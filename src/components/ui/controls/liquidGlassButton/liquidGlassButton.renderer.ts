import { ICON_SDF_SCALE, rasterizeIconSignedDistanceField, readSvgViewBox } from "./liquidGlassButton.iconSdf";
import {
	LIQUID_GLASS_BACKGROUND_FRAGMENT_SHADER,
	LIQUID_GLASS_ICON_FRAGMENT_SHADER,
	LIQUID_GLASS_VERTEX_SHADER,
} from "./liquidGlassButton.shader";

export type LiquidGlassButtonRenderer = {
	/** icon canvas 是否成功创建；失败时组件保留 DOM SVG 作为降级内容。 */
	hasIconLayer: boolean;
	resize: () => void;
	draw: (time: number) => void;
	dispose: () => void;
};

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
	const shader = gl.createShader(type);
	if (!shader) throw new Error("无法创建按钮 shader");
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader) ?? "shader 编译失败";
		gl.deleteShader(shader);
		throw new Error(log);
	}
	return shader;
}

function createProgram(gl: WebGL2RenderingContext, fragmentSource: string): WebGLProgram {
	const program = gl.createProgram();
	const vertex = compileShader(gl, gl.VERTEX_SHADER, LIQUID_GLASS_VERTEX_SHADER);
	const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
	if (!program) throw new Error("无法创建按钮 program");
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);
	gl.deleteShader(vertex);
	gl.deleteShader(fragment);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		gl.deleteProgram(program);
		throw new Error(gl.getProgramInfoLog(program) ?? "program 链接失败");
	}
	return program;
}

function createQuad(
	gl: WebGL2RenderingContext,
	program: WebGLProgram,
): { vao: WebGLVertexArrayObject; buffer: WebGLBuffer } {
	const vao = gl.createVertexArray();
	const buffer = gl.createBuffer();
	if (!vao || !buffer) throw new Error("无法创建按钮几何");
	gl.bindVertexArray(vao);
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
	const position = gl.getAttribLocation(program, "a_position");
	if (position < 0) throw new Error("按钮 shader 缺少 a_position");
	gl.enableVertexAttribArray(position);
	gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
	gl.bindVertexArray(null);
	return { vao, buffer };
}

function configureCanvas(
	canvas: HTMLCanvasElement,
	gl: WebGL2RenderingContext,
	width: number,
	height: number,
	dpr: number,
): void {
	canvas.width = Math.round(width * dpr);
	canvas.height = Math.round(height * dpr);
	canvas.style.width = `${width}px`;
	canvas.style.height = `${height}px`;
	gl.viewport(0, 0, canvas.width, canvas.height);
}

/**
 * 创建双 canvas 液态玻璃绘制器。
 *
 * 背景 canvas 永远绘制整个按钮；CSS 遮罩决定可见描边宽度。icon canvas 使用同一套
 * dispersion 函数、按钮分辨率和时间值，只额外应用 SDF 形状与玻璃光学效果。
 */
export async function createLiquidGlassButtonRenderer(
	backgroundCanvas: HTMLCanvasElement,
	iconCanvas: HTMLCanvasElement,
	button: HTMLButtonElement,
	iconHost: HTMLElement,
): Promise<LiquidGlassButtonRenderer | null> {
	const icon = iconHost.querySelector("svg");
	let sdf: Awaited<ReturnType<typeof rasterizeIconSignedDistanceField>> = null;
	if (icon) {
		try {
			if (!readSvgViewBox(icon)) throw new Error("SVG 缺少有效 viewBox");
			const svgMarkup = new XMLSerializer().serializeToString(icon);
			sdf = await rasterizeIconSignedDistanceField(svgMarkup, ICON_SDF_SCALE * 64);
		} catch (error) {
			console.warn("按钮 icon SVG 无法生成距离场，将保留 DOM SVG。", error);
		}
	}

	const backgroundGl = backgroundCanvas.getContext("webgl2", {
		alpha: true,
		antialias: true,
		premultipliedAlpha: true,
	});
	if (!backgroundGl) return null;

	let backgroundProgram: WebGLProgram | undefined;
	let backgroundVao: WebGLVertexArrayObject | undefined;
	let backgroundBuffer: WebGLBuffer | undefined;
	let iconGl: WebGL2RenderingContext | undefined;
	let iconProgram: WebGLProgram | undefined;
	let iconVao: WebGLVertexArrayObject | undefined;
	let iconBuffer: WebGLBuffer | undefined;
	let sdfTexture: WebGLTexture | undefined;
	let sdfInset = 0;

	try {
		backgroundProgram = createProgram(backgroundGl, LIQUID_GLASS_BACKGROUND_FRAGMENT_SHADER);
		({ vao: backgroundVao, buffer: backgroundBuffer } = createQuad(backgroundGl, backgroundProgram));
		if (!backgroundProgram || !backgroundVao || !backgroundBuffer) throw new Error("无法创建按钮背景资源");
		const background = {
			buffer: backgroundBuffer,
			program: backgroundProgram,
			vao: backgroundVao,
		};

		try {
			iconGl = iconCanvas.getContext("webgl2", { alpha: true, antialias: true, premultipliedAlpha: true }) ?? undefined;
			if (!iconGl) throw new Error("无法创建 icon WebGL2 context");
			iconProgram = createProgram(iconGl, LIQUID_GLASS_ICON_FRAGMENT_SHADER);
			({ vao: iconVao, buffer: iconBuffer } = createQuad(iconGl, iconProgram));

			if (!sdf) throw new Error("无法创建 icon 距离场");
			sdfInset = sdf.inset;
			const sdfPixels = new Uint8Array(sdf.field.length);
			for (let index = 0; index < sdf.field.length; index += 1) sdfPixels[index] = Math.round(sdf.field[index] * 255);
			sdfTexture = iconGl.createTexture() ?? undefined;
			if (!sdfTexture) throw new Error("无法创建 icon 纹理");
			iconGl.bindTexture(iconGl.TEXTURE_2D, sdfTexture);
			iconGl.texParameteri(iconGl.TEXTURE_2D, iconGl.TEXTURE_MIN_FILTER, iconGl.LINEAR);
			iconGl.texParameteri(iconGl.TEXTURE_2D, iconGl.TEXTURE_MAG_FILTER, iconGl.LINEAR);
			iconGl.texParameteri(iconGl.TEXTURE_2D, iconGl.TEXTURE_WRAP_S, iconGl.CLAMP_TO_EDGE);
			iconGl.texParameteri(iconGl.TEXTURE_2D, iconGl.TEXTURE_WRAP_T, iconGl.CLAMP_TO_EDGE);
			iconGl.texImage2D(
				iconGl.TEXTURE_2D,
				0,
				iconGl.R8,
				sdf.size,
				sdf.size,
				0,
				iconGl.RED,
				iconGl.UNSIGNED_BYTE,
				sdfPixels,
			);
		} catch (error) {
			console.warn("按钮 icon WebGL 视觉层不可用，将保留 DOM SVG。", error);
			if (iconGl && iconBuffer) iconGl.deleteBuffer(iconBuffer);
			if (iconGl && iconVao) iconGl.deleteVertexArray(iconVao);
			if (iconGl && iconProgram) iconGl.deleteProgram(iconProgram);
			iconGl = undefined;
			iconProgram = undefined;
			iconVao = undefined;
			iconBuffer = undefined;
			sdfTexture = undefined;
		}

		const backgroundResolution = glUniform(backgroundGl, background.program, "u_resolution");
		const backgroundTime = glUniform(backgroundGl, background.program, "u_time");
		const iconResolution = iconGl && iconProgram ? glUniform(iconGl, iconProgram, "u_resolution") : null;
		const iconRect = iconGl && iconProgram ? glUniform(iconGl, iconProgram, "u_icon_rect") : null;
		const iconSdfInset = iconGl && iconProgram ? glUniform(iconGl, iconProgram, "u_icon_sdf_inset") : null;
		const iconTime = iconGl && iconProgram ? glUniform(iconGl, iconProgram, "u_time") : null;
		const iconSampler = iconGl && iconProgram ? glUniform(iconGl, iconProgram, "u_icon_sdf") : null;
		let width = 1;
		let height = 1;

		const draw = (time: number): void => {
			backgroundGl.viewport(0, 0, backgroundCanvas.width, backgroundCanvas.height);
			backgroundGl.clearColor(0, 0, 0, 0);
			backgroundGl.clear(backgroundGl.COLOR_BUFFER_BIT);
			backgroundGl.useProgram(background.program);
			backgroundGl.uniform1f(backgroundTime, time);
			backgroundGl.bindVertexArray(background.vao);
			backgroundGl.drawArrays(backgroundGl.TRIANGLE_STRIP, 0, 4);
			backgroundGl.bindVertexArray(null);

			if (
				iconGl &&
				iconProgram &&
				iconVao &&
				iconResolution &&
				iconRect &&
				iconSdfInset &&
				iconTime &&
				iconSampler &&
				sdfTexture
			) {
				iconGl.viewport(0, 0, iconCanvas.width, iconCanvas.height);
				iconGl.clearColor(0, 0, 0, 0);
				iconGl.clear(iconGl.COLOR_BUFFER_BIT);
				iconGl.enable(iconGl.BLEND);
				iconGl.blendFunc(iconGl.ONE, iconGl.ONE_MINUS_SRC_ALPHA);
				iconGl.useProgram(iconProgram);
				iconGl.uniform1f(iconTime, time);
				iconGl.activeTexture(iconGl.TEXTURE0);
				iconGl.bindTexture(iconGl.TEXTURE_2D, sdfTexture);
				iconGl.uniform1i(iconSampler, 0);
				iconGl.bindVertexArray(iconVao);
				iconGl.drawArrays(iconGl.TRIANGLE_STRIP, 0, 4);
				iconGl.bindVertexArray(null);
			}
		};

		const resize = (): void => {
			const buttonRect = button.getBoundingClientRect();
			const iconBounds = icon?.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			width = Math.max(1, buttonRect.width);
			height = Math.max(1, buttonRect.height);
			configureCanvas(backgroundCanvas, backgroundGl, width, height, dpr);
			backgroundGl.useProgram(background.program);
			backgroundGl.uniform2f(backgroundResolution, width, height);
			if (iconGl && iconProgram && iconResolution && iconRect) {
				configureCanvas(iconCanvas, iconGl, width, height, dpr);
				iconGl.useProgram(iconProgram);
				iconGl.uniform2f(iconResolution, width, height);
				if (!iconBounds) return;
				iconGl.uniform4f(
					iconRect,
					iconBounds.left - buttonRect.left,
					iconBounds.top - buttonRect.top,
					iconBounds.width,
					iconBounds.height,
				);
				iconGl.uniform1f(iconSdfInset, sdfInset);
			}
		};

		resize();
		return {
			hasIconLayer: Boolean(iconGl && iconProgram && sdfTexture),
			resize,
			draw,
			dispose(): void {
				backgroundGl.deleteBuffer(background.buffer);
				backgroundGl.deleteVertexArray(background.vao);
				backgroundGl.deleteProgram(background.program);
				if (iconGl) {
					if (sdfTexture) iconGl.deleteTexture(sdfTexture);
					if (iconBuffer) iconGl.deleteBuffer(iconBuffer);
					if (iconVao) iconGl.deleteVertexArray(iconVao);
					if (iconProgram) iconGl.deleteProgram(iconProgram);
				}
			},
		};
	} catch (error) {
		if (backgroundBuffer) backgroundGl.deleteBuffer(backgroundBuffer);
		if (backgroundVao) backgroundGl.deleteVertexArray(backgroundVao);
		if (backgroundProgram) backgroundGl.deleteProgram(backgroundProgram);
		console.warn("按钮 WebGL 背景视觉层不可用，将使用 CSS 降级。", error);
		return null;
	}
}

function glUniform(gl: WebGL2RenderingContext, program: WebGLProgram, name: string): WebGLUniformLocation {
	const location = gl.getUniformLocation(program, name);
	if (!location) throw new Error(`按钮 shader 缺少 uniform: ${name}`);
	return location;
}
