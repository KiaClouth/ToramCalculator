/**
 * 图标有符号距离场（SDF）的一次性预计算。
 *
 * 为什么需要它：液态玻璃的折射偏移、菲涅耳亮边和眩光都依赖「到图标边缘的距离」和「表面法线」。
 * 法线只能从距离场的梯度取得——二值遮罩的梯度仅在抗锯齿边缘 1~2 像素内非零，直接差分会让
 * 图标内部的光学效果全部消失。
 *
 * 为什么在 CPU 上算：SVG 只在组件初始化时栅格化一次，之后每帧只采样距离场纹理。
 * 8SSEDT 是 O(n) 的欧氏距离变换，比 GPU 上多趟 jump-flooding 更简单也更准确，
 * 且完全不需要渲染管线参与——没有 ping-pong 纹理、没有 shader、没有帧同步。
 *
 * 有符号是关键：图标外部为负、内部为正。原实现在遮罩覆盖率低于阈值处直接返回 0 且梯度为零，
 * 导致 `length(normal) == 0`，把菲涅耳和眩光乘成 0——图标最外一圈抗锯齿像素其实完全没有玻璃效果。
 * 有符号距离场在边界两侧都有定义且梯度连续，该缺陷自然消失。
 */

/** 距离场纹理相对图标 CSS 尺寸的超采样倍数，决定距离精度和玻璃边缘的平滑度。 */
export const ICON_SDF_SCALE = 4;

/**
 * 距离场在纹理中的编码范围，单位为 SDF 像素。
 * 距离被归一化到 [-ICON_SDF_RANGE, ICON_SDF_RANGE] → [0, 1] 以便用普通纹理存储；
 * 该范围必须覆盖 shader 里最大的光学作用距离（折射厚度、菲涅耳与眩光范围）。
 */
export const ICON_SDF_RANGE = 48;

/**
 * 图标与距离场纹理边缘的最小间隔，单位为 SDF 像素。
 *
 * 距离场需要在图形外部保留连续的负距离。path 靠近纹理边缘时，外部距离会被截断，
 * 使纹理轮廓进入 shader。内边距让图标几何与纹理边界完全解耦。
 */
export const ICON_SDF_PADDING = 24;

/** 8SSEDT 的哨兵值，表示「尚未找到最近的边界像素」。 */
const UNSET = 1e9;

/**
 * 用 8SSEDT（8-points Signed Sequential Euclidean Distance Transform）计算无符号距离场。
 *
 * 算法要点：每个像素记录「到最近边界像素的偏移向量」，先正向扫描（左上到右下）传播上方与左侧的
 * 邻居，再反向扫描（右下到左上）传播下方与右侧的邻居。两趟之后每个像素都持有精确的最近边界偏移。
 * 相比逐像素向多个方向搜索，它的代价与搜索半径无关。
 *
 * @param inside 逐像素的内外判定，true 表示位于形状内部
 * @param width 网格宽度
 * @param height 网格高度
 * @returns 每个像素到最近边界的欧氏距离（无符号），单位为像素
 */
function euclideanDistanceTransform(inside: Uint8Array, width: number, height: number): Float32Array {
	const count = width * height;
	// 分量存最近边界像素的相对偏移；距离由偏移长度导出，避免累积误差。
	const offsetX = new Float32Array(count);
	const offsetY = new Float32Array(count);
	const squaredDistance = new Float32Array(count);

	for (let index = 0; index < count; index += 1) {
		// 边界定义为「内部像素紧邻外部像素」；这里先把所有像素标记为未确定，
		// 再在下面的邻域检查中把真正的边界像素距离置零。
		squaredDistance[index] = UNSET;
	}

	// 边界像素：自身在当前集合中，且四邻中存在相反状态的像素。
	// 网格边缘不是几何边界；把它当成边界会让补集距离变换在纹理四周
	// 产生一圈接近零距离的假轮廓，最终在 shader 中显示为矩形边框。
	for (let y = 0; y < height; y += 1) {
		for (let x = 0; x < width; x += 1) {
			const index = y * width + x;
			if (inside[index] === 0) continue;
			const leftOutside = x > 0 && inside[index - 1] === 0;
			const rightOutside = x < width - 1 && inside[index + 1] === 0;
			const topOutside = y > 0 && inside[index - width] === 0;
			const bottomOutside = y < height - 1 && inside[index + width] === 0;
			if (leftOutside || rightOutside || topOutside || bottomOutside) {
				squaredDistance[index] = 0;
				offsetX[index] = 0;
				offsetY[index] = 0;
			}
		}
	}

	/** 尝试用邻居的最近边界偏移改进当前像素，偏移需按两像素间的位移修正。 */
	const relax = (index: number, neighborIndex: number, stepX: number, stepY: number): void => {
		if (squaredDistance[neighborIndex] >= UNSET) return;
		const candidateX = offsetX[neighborIndex] + stepX;
		const candidateY = offsetY[neighborIndex] + stepY;
		const candidate = candidateX * candidateX + candidateY * candidateY;
		if (candidate < squaredDistance[index]) {
			squaredDistance[index] = candidate;
			offsetX[index] = candidateX;
			offsetY[index] = candidateY;
		}
	};

	// 正向扫描：传播来自上一行和左侧的信息。
	for (let y = 0; y < height; y += 1) {
		for (let x = 0; x < width; x += 1) {
			const index = y * width + x;
			if (y > 0) {
				relax(index, index - width, 0, 1);
				if (x > 0) relax(index, index - width - 1, 1, 1);
				if (x < width - 1) relax(index, index - width + 1, -1, 1);
			}
			if (x > 0) relax(index, index - 1, 1, 0);
		}
	}

	// 反向扫描：传播来自下一行和右侧的信息。
	for (let y = height - 1; y >= 0; y -= 1) {
		for (let x = width - 1; x >= 0; x -= 1) {
			const index = y * width + x;
			if (y < height - 1) {
				relax(index, index + width, 0, 1);
				if (x < width - 1) relax(index, index + width + 1, 1, 1);
				if (x > 0) relax(index, index + width - 1, -1, 1);
			}
			if (x < width - 1) relax(index, index + 1, 1, 0);
		}
	}

	const distance = new Float32Array(count);
	for (let index = 0; index < count; index += 1) {
		distance[index] = squaredDistance[index] >= UNSET ? UNSET : Math.sqrt(squaredDistance[index]);
	}
	return distance;
}

/**
 * 把内外判定网格转成归一化的有符号距离场。
 *
 * 分别对形状和其补集做距离变换，再按内外取符号：内部为正、外部为负。
 * 单独对补集再算一次，是为了让外部像素也拥有精确距离——只算一次的话外部全是哨兵值，
 * 玻璃边缘外侧就没有可用的梯度。
 *
 * @param inside 逐像素内外判定
 * @param width 网格宽度
 * @param height 网格高度
 * @returns 归一化到 [0, 1] 的有符号距离，0.5 对应边界
 */
export function buildSignedDistanceField(inside: Uint8Array, width: number, height: number): Float32Array {
	const outside = new Uint8Array(inside.length);
	for (let index = 0; index < inside.length; index += 1) {
		outside[index] = inside[index] === 0 ? 1 : 0;
	}
	const insideDistance = euclideanDistanceTransform(inside, width, height);
	const outsideDistance = euclideanDistanceTransform(outside, width, height);

	const field = new Float32Array(inside.length);
	for (let index = 0; index < inside.length; index += 1) {
		// 距离从边界像素中心起算，两侧各偏半个像素才能让 0 落在真实轮廓上。
		const signed =
			inside[index] === 1
				? Math.min(insideDistance[index], ICON_SDF_RANGE) + 0.5
				: -Math.min(outsideDistance[index], ICON_SDF_RANGE) - 0.5;
		field[index] = Math.min(Math.max(signed / (ICON_SDF_RANGE * 2) + 0.5, 0), 1);
	}
	return field;
}

export type SvgViewBox = {
	x: number;
	y: number;
	width: number;
	height: number;
};

/**
 * 从 SVG 的 viewBox 属性读取完整坐标系。
 *
 * viewBox 不能只用一个边长表示：项目中的图标同时存在 24×24、24×25、50×50 和更宽的
 * 品牌图标。这里保留 x/y 偏移和宽高，后续交给 SVG 自己的 preserveAspectRatio 处理。
 */
export function readSvgViewBox(svg: SVGSVGElement): SvgViewBox | null {
	const viewBox = svg.viewBox.baseVal;
	if (viewBox.width > 0 && viewBox.height > 0) {
		return { x: viewBox.x, y: viewBox.y, width: viewBox.width, height: viewBox.height };
	}
	const raw = svg
		.getAttribute("viewBox")
		?.trim()
		.split(/[\s,]+/)
		.map(Number);
	if (!raw || raw.length !== 4 || raw.some((value) => !Number.isFinite(value)) || raw[2] <= 0 || raw[3] <= 0) {
		return null;
	}
	return { x: raw[0], y: raw[1], width: raw[2], height: raw[3] };
}

/**
 * 将 SVG 变成只表达几何的遮罩源。
 *
 * SDF 不需要图标原本的品牌色，且离屏 SVG 图片不会加载应用 CSS。删除 class 并把显式
 * fill/stroke（包含 currentColor 和项目的颜色 class）归一化为白色，可以避免颜色丢失
 * 或外部样式改变 alpha，同时保留 opacity、transform、描边宽度和 fill-rule 等几何信息。
 */
export function normalizeSvgColorsToWhite(svgMarkup: string, rasterSize?: number): string | null {
	if (typeof DOMParser === "undefined" || typeof XMLSerializer === "undefined") return null;
	const document = new DOMParser().parseFromString(svgMarkup, "image/svg+xml");
	const root = document.documentElement;
	if (!root || root.tagName.toLowerCase() !== "svg") return null;

	root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	root.setAttribute("color", "#fff");
	if (rasterSize !== undefined) {
		root.setAttribute("width", String(rasterSize));
		root.setAttribute("height", String(rasterSize));
		root.setAttribute("preserveAspectRatio", "xMidYMid meet");
	}

	const elements = [root, ...Array.from(root.querySelectorAll("*"))];
	for (const element of elements) {
		const className = element.getAttribute("class") ?? "";
		const hasFillNoneClass = /(?:^|\s)fill-none(?:\s|$)/.test(className);
		const hasStrokeNoneClass = /(?:^|\s)stroke-none(?:\s|$)/.test(className);
		const hasFillClass = /(?:^|\s)fill-(?!none(?:\s|$))[^\s]+/.test(className);
		const hasStrokeClass = /(?:^|\s)stroke-(?!none(?:\s|$))[^\s]+/.test(className);
		const fill = element.getAttribute("fill");
		const stroke = element.getAttribute("stroke");

		if (fill && fill.toLowerCase() !== "none") element.setAttribute("fill", "#fff");
		else if (hasFillClass) element.setAttribute("fill", "#fff");
		else if (hasFillNoneClass) element.setAttribute("fill", "none");
		if (stroke && stroke.toLowerCase() !== "none") element.setAttribute("stroke", "#fff");
		else if (hasStrokeClass) element.setAttribute("stroke", "#fff");
		else if (hasStrokeNoneClass) element.setAttribute("stroke", "none");

		const style = element.getAttribute("style");
		if (style) {
			const normalizedStyle = style
				.split(";")
				.map((declaration) => declaration.trim())
				.filter(Boolean)
				.map((declaration) => {
					const separator = declaration.indexOf(":");
					if (separator < 0) return declaration;
					const property = declaration.slice(0, separator).trim().toLowerCase();
					if (property === "fill" || property === "stroke" || property === "color") {
						const value = declaration
							.slice(separator + 1)
							.trim()
							.toLowerCase();
						return `${property}: ${value === "none" ? "none" : "#fff"}`;
					}
					return declaration;
				})
				.join("; ");
			if (normalizedStyle) element.setAttribute("style", normalizedStyle);
			else element.removeAttribute("style");
		}

		// 颜色 class 依赖应用 CSS，离屏 SVG 中没有这份样式；保留几何属性即可。
		element.removeAttribute("class");
	}

	return new XMLSerializer().serializeToString(root);
}

async function loadSvgImage(svgMarkup: string): Promise<CanvasImageSource | null> {
	const blob = new Blob([svgMarkup], { type: "image/svg+xml" });
	if (typeof createImageBitmap === "function") {
		try {
			return await createImageBitmap(blob);
		} catch {
			// 某些浏览器不能直接解码 SVG Blob，下面的 HTMLImageElement 是兼容路径。
		}
	}
	if (typeof Image === "undefined" || typeof URL === "undefined") return null;
	const url = URL.createObjectURL(blob);
	try {
		const image = new Image();
		image.decoding = "async";
		image.src = url;
		await image.decode();
		return image;
	} catch {
		return null;
	} finally {
		URL.revokeObjectURL(url);
	}
}

/**
 * 将完整 SVG 栅格化为有符号距离场。
 *
 * 使用 SVG 图片解码而不是 Path2D，因此 path、circle、rect、g、transform、stroke 和多个
 * 子元素都会按照浏览器的 SVG 规则参与遮罩。返回 Promise 是因为图片解码本身是异步操作。
 */
export async function rasterizeIconSignedDistanceField(
	svgMarkup: string,
	size: number,
): Promise<{ field: Float32Array; inset: number; size: number } | null> {
	if (typeof OffscreenCanvas === "undefined" || size <= ICON_SDF_PADDING * 2) return null;
	const drawableSize = size - ICON_SDF_PADDING * 2;
	const normalizedSvg = normalizeSvgColorsToWhite(svgMarkup, drawableSize);
	if (!normalizedSvg) return null;
	const image = await loadSvgImage(normalizedSvg);
	if (!image) return null;

	try {
		const canvas = new OffscreenCanvas(size, size);
		const context = canvas.getContext("2d");
		if (!context) return null;
		context.clearRect(0, 0, size, size);
		context.drawImage(image, ICON_SDF_PADDING, ICON_SDF_PADDING, drawableSize, drawableSize);

		const pixels = context.getImageData(0, 0, size, size).data;
		const inside = new Uint8Array(size * size);
		for (let index = 0; index < inside.length; index += 1) {
			// 栅格化结果是抗锯齿的；以半覆盖率为内外分界，与浏览器渲染的视觉轮廓一致。
			inside[index] = pixels[index * 4 + 3] >= 128 ? 1 : 0;
		}
		return { field: buildSignedDistanceField(inside, size, size), inset: ICON_SDF_PADDING / size, size };
	} finally {
		if ("close" in image && typeof image.close === "function") image.close();
	}
}
