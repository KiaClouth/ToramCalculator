/**
 * 按钮渲染方案：
 * 1. TSX 声明 button、白色遮罩、黑色描边/文字和图标；HtmlTexture 将整个顶层 button 上传为一张纹理。
 * 2. WGSL 根据基层蓝色、白色、纯黑和图标绿色编码的线性混合关系，恢复四类覆盖率。
 * 3. 直接保留 HtmlTexture 的原始子像素覆盖率，再将其分配给流场、白色层、黑色文字/描边和图标液态玻璃；最终按总 alpha 合成，避免颜色阈值破坏源纹理的抗锯齿。
 * 4. 仅图标遮罩可生成边缘距离、表面法线、折射位移、菲涅耳亮边和眩光；液态玻璃光学模型复刻
 *    liquid-glass-studio 的 WGSL 方案。背景流场按三个水平偏移位置分别写入颜色通道，生成左橘黄右湛蓝色散。
 * 5. 独立阴影平面用圆角矩形距离场渲染网格外阴影；原生 DOM 由 HTML-in-Canvas 保持在 canvas 子树中，
 *    由浏览器直接处理命中、focus、Tab 和键盘事件，不经过 Babylon 射线转发。
 */
import { createSignal, type JSX, onCleanup, onMount } from "solid-js";
import { render } from "solid-js/web";
import {
	Color4,
	HtmlTexture,
	IsHtmlInCanvasUploadSupported,
	Matrix,
	MeshBuilder,
	Scene,
	ShaderLanguage,
	ShaderMaterial,
	Texture,
	UniversalCamera,
	Vector2,
	Vector3,
	Viewport,
	WebGPUEngine,
} from "~/platform/render/babylon/runtime";

// 按钮 CSS 宽度，决定 HTML 源节点和主平面的横向尺寸。
const BUTTON_WIDTH = 240;
// 按钮 CSS 高度，决定 HTML 源节点和主平面的纵向尺寸。
const BUTTON_HEIGHT = 80;
// HTML 纹理相对 CSS 像素的超采样倍数，用于减轻文字、圆角和边框锯齿。
const TEXTURE_SCALE = 2;
// HTML 纹理实际上传到 GPU 的宽度。
const TEXTURE_WIDTH = BUTTON_WIDTH * TEXTURE_SCALE;
// HTML 纹理实际上传到 GPU 的高度。
const TEXTURE_HEIGHT = BUTTON_HEIGHT * TEXTURE_SCALE;
// 相机到按钮平面的距离，用于把 CSS 像素换算成世界坐标。
const CAMERA_DISTANCE = 8;
// 透视相机视场角，影响按钮在画布中的可见尺寸。
const CAMERA_FOV = 0.8;

// 子 div 的默认内缩，决定按钮外圈底层纹理的宽度。
const BUTTON_FRAME_INSET = 2;
// 按钮和子 div 的圆角半径；999 表示使用胶囊形圆角。
const BUTTON_FRAME_RADIUS = 999;
// HTML 源按钮基层的语义编码颜色；WGSL 以此区分流场基层和真实黑色镂空。
const BUTTON_BASE_COLOR = "#000018";
// BUTTON_BASE_COLOR 的蓝色通道强度，用于从 HTML 纹理中线性还原基层覆盖率。
const BUTTON_BASE_BLUE = 24 / 255;
// 图标在 HTML 源纹理中的语义编码颜色；最终不直接显示，用绿色通道将图标与普通黑色文字、描边区分。
const BUTTON_ICON_MASK_COLOR = "#001800";
// BUTTON_ICON_MASK_COLOR 的绿色通道强度，用于从 HTML 纹理中线性还原图标覆盖率。
const BUTTON_ICON_MASK_GREEN = 24 / 255;
// 阴影的水平偏移，单位为 CSS 像素。
const BUTTON_SHADOW_OFFSET_X = 4;
// 阴影的初始垂直偏移，hover 时会按比例压低。
const BUTTON_SHADOW_OFFSET_Y = 8;
// 阴影从实体边缘衰减到透明的距离，单位为 CSS 像素。
const BUTTON_SHADOW_BLUR = 16;
// 阴影初始不透明度。
const BUTTON_SHADOW_OPACITY = 0.1;
// 阴影平面在按钮四周预留的额外像素，必须覆盖偏移和模糊范围。
const BUTTON_SHADOW_PADDING = 24;
// 阴影平面相对主按钮的深度偏移，避免两个透明平面发生深度竞争。
const BUTTON_SHADOW_DEPTH = 0.001;
// 阴影平面总宽度。
const SHADOW_PLANE_WIDTH = BUTTON_WIDTH + BUTTON_SHADOW_PADDING * 2;
// 阴影平面总高度。
const SHADOW_PLANE_HEIGHT = BUTTON_HEIGHT + BUTTON_SHADOW_PADDING * 2;

// DOM 内层和阴影 uniform 共用的交互过渡时长。
const INTERACTION_TRANSITION_SECONDS = 0.3;
// 用户启用“减少动态效果”时的交互过渡时长，保留状态反馈但缩短位移过程。
const REDUCED_MOTION_TRANSITION_SECONDS = 0.15;
// 按下时阴影淡出的时长，使按压反馈比 hover 状态切换更直接。
const PRESSED_SHADOW_TRANSITION_SECONDS = 0.12;
// hover 时子 div 的目标内缩，0 表示扩展到按钮外轮廓。
const HOVER_FRAME_INSET = 0;
// hover 时阴影垂直偏移相对初始值的比例，0.5 表示高度减半。
const HOVER_SHADOW_OFFSET_Y_SCALE = 0.5;
// 按下时的目标阴影不透明度，0 表示完全隐藏。
const PRESSED_SHADOW_OPACITY = 0;

// 正弦流带进入亮部的阈值；0.904 对应约两成相位为亮部，维持约 8:2 的黑白占比。
const FLOW_BRIGHT_THRESHOLD = 0.904;
// 黑白之间的灰阶过渡宽度。
const FLOW_GRAY_TRANSITION = 0.04;
// 流场最低亮度，决定黑色区域是否保留少量可见细节。
const FLOW_BLACK_LEVEL = 0.012;
// 流场最高亮度，决定白色亮带的最大亮度。
const FLOW_WHITE_LEVEL = 0.94;
// 流场坐标缩放；减小频率可以放大纹理，避免按钮内出现过密细纹。
const FLOW_COORDINATE_SCALE = 0.48;
// 主流带的空间频率；当前值保证按钮初始帧已有黑白带，同时维持较大的纹理尺度。
const FLOW_RIBBON_FREQUENCY = 2;
// 流场时间速度，值越大纹理移动越快。
const FLOW_TIME_SCALE = 1.72;
// 域扭曲对采样坐标的最大位移，值越大流场弯曲越明显；提高它可以减少平行条纹。
const FLOW_WARP_STRENGTH = 1.25;
// 第二层域扭曲相对主扭曲的比例，用于打破单一尺度的规则形状。
const FLOW_SECONDARY_WARP_WEIGHT = 0.55;
// 第二层域扭曲的坐标频率，值越大局部纹理越碎。
const FLOW_SECONDARY_WARP_SCALE = 2.1;
// 噪声对主流带相位的影响强度，值越大流带形状越不规则。
const FLOW_FIELD_PHASE_STRENGTH = 7;
// 细节噪声的坐标频率，用于在大尺度流带上叠加不重复的局部变化。
const FLOW_NOISE_DETAIL_SCALE = 2.4;
// 细节噪声混入主噪声的比例，值越大纹理越随机，过高会使边缘失去连续性。
const FLOW_NOISE_DETAIL_BLEND = 0.42;
// 主流带纵向频率相对横向频率的比例。
const FLOW_RIBBON_VERTICAL_RATIO = 0.74;
// 流场动画的固定初始时间，避免页面运行时长决定首帧处于全黑阶段。
const FLOW_INITIAL_TIME = 0;

// 色散通道相对中心灰阶纹理的水平偏移距离，单位为 CSS 像素；它决定两侧色带的分离宽度。
const CHROMATIC_CHANNEL_OFFSET = 6;
// 左侧偏移通道补入绿色的比例；红色通道单独显现时由此形成高饱和度橘黄色。
const CHROMATIC_ORANGE_GREEN_RATIO = 0.42;
// 右侧偏移通道补入绿色的比例；蓝色通道单独显现时由此形成高饱和度湛蓝色。
const CHROMATIC_AZURE_GREEN_RATIO = 0.46;

// 图标距离场的采样方向数；增加该值会使复杂 SVG 图标的边缘距离更接近真实距离，但会提高图标区域的采样成本。
const GLASS_DISTANCE_DIRECTION_COUNT = 16;
// 每个方向上搜索图标边缘的最大步数，单位为 HTML 纹理像素。
const GLASS_DISTANCE_SAMPLE_COUNT = 24;
// 图标距离场每次搜索前进的距离，单位为 HTML 纹理像素。
const GLASS_DISTANCE_SAMPLE_STEP = 1;
// 判断采样点位于图标内部的遮罩覆盖率阈值；0.5 对应浏览器抗锯齿边缘的中点。
const GLASS_MASK_INSIDE_THRESHOLD = 0.5;
// 用距离场采样近似边界位置时扣除的半个纹理像素，防止玻璃折射从抗锯齿边缘向外扩张。
const GLASS_EDGE_DISTANCE_BIAS = 0.5;
// 参考实现的折射厚度，单位为 HTML 纹理像素；厚度范围内计算折射，超过后仅保留模糊透射层。
const GLASS_REFRACTION_THICKNESS = 20;
// 参考实现的折射系数，近似玻璃相对于空气的折射率比。
const GLASS_REFRACTION_FACTOR = 1.4;
// 红色通道的相对折射系数，用于让三色通道在折射边缘产生细微分离。
const GLASS_RED_REFRACTION_SCALE = 0.98;
// 绿色通道的相对折射系数，作为色散的中心参考。
const GLASS_GREEN_REFRACTION_SCALE = 1;
// 蓝色通道的相对折射系数，用于让三色通道在折射边缘产生细微分离。
const GLASS_BLUE_REFRACTION_SCALE = 1.02;
// 折射色散强度，放大红绿蓝相对折射系数的差异。
const GLASS_REFRACTION_DISPERSION = 7;
// 折射采样偏移系数，决定边缘光线在背景流场中的弯折距离。
const GLASS_REFRACTION_OFFSET = 0.05;
// 玻璃边缘是否始终读取模糊背景；true 与参考实现默认值一致。
const GLASS_BLUR_EDGE = true;
// 玻璃内部模糊半径，单位为 HTML 纹理像素；参考实现默认值为 1。
const GLASS_BLUR_RADIUS = 1;
// 折射结果混入的玻璃色调红色通道。
const GLASS_TINT_RED = 1;
// 折射结果混入的玻璃色调绿色通道。
const GLASS_TINT_GREEN = 1;
// 折射结果混入的玻璃色调蓝色通道。
const GLASS_TINT_BLUE = 1;
// 玻璃色调不透明度；参考实现默认值为 0，保留真实背景颜色。
const GLASS_TINT_OPACITY = 0;
// 菲涅耳亮边的距离范围，值越小亮边越靠近图标边缘。
const GLASS_FRESNEL_RANGE = 30;
// 菲涅耳亮边的硬度，控制边缘亮度曲线的起始值。
const GLASS_FRESNEL_HARDNESS = 0.2;
// 菲涅耳亮边的混合强度。
const GLASS_FRESNEL_FACTOR = 0.2;
// 定向眩光的距离范围，值越小眩光越集中在图标边缘。
const GLASS_GLARE_RANGE = 30;
// 定向眩光的硬度，控制眩光距离曲线的起始值。
const GLASS_GLARE_HARDNESS = 0.2;
// 定向眩光的收敛度，值越大眩光沿边缘的角度范围越窄。
const GLASS_GLARE_CONVERGENCE = 0.5;
// 背光侧眩光相对主光侧的亮度比例。
const GLASS_GLARE_OPPOSITE_FACTOR = 0.8;
// 定向眩光的总强度。
const GLASS_GLARE_FACTOR = 0.9;
// 定向眩光的角度，单位为弧度；-PI / 4 对应参考实现默认的左上方光源。
const GLASS_GLARE_ANGLE = -Math.PI / 4;

// 主按钮和阴影平面共用的顶点着色器，负责变换顶点并传递 UV。
const vertexShader = /* wgsl */ `
// 顶点阶段只负责两件事：把按钮平面放进相机空间，并把 0..1 的 UV 原样传给片元阶段。
// 所有视觉效果都依赖同一套 UV，因此这里不做顶点位移，避免几何尺寸和纹理尺寸产生两套坐标。
attribute position: vec3f;
attribute uv: vec2f;
uniform worldViewProjection: mat4x4f;
varying vUV: vec2f;

@vertex
fn main(input: VertexInputs) -> FragmentInputs {
	vertexOutputs.position = uniforms.worldViewProjection * vec4f(vertexInputs.position, 1.0);
	vertexOutputs.vUV = vertexInputs.uv;
}
`;

// 独立阴影平面的片元着色器，输出不会受主按钮网格边界裁剪的软阴影。
const shadowFragmentShader = /* wgsl */ `
// 阴影使用独立平面而不是 HTML 的 drop-shadow：主按钮网格没有多余几何区域，
// 无法可靠承载超出按钮边界的像素。这个 shader 在扩大的平面中直接绘制软阴影。
varying vUV: vec2f;
uniform shadowOffsetY: f32;
uniform shadowOpacity: f32;

// 返回以中心为原点的圆角矩形有符号距离：负数在矩形内部，正数在矩形外部。
// 阴影只需要这个距离值，就能在没有纹理采样的情况下控制边缘的平滑衰减。
fn roundedRectangleDistance(point: vec2f, halfSize: vec2f, radius: f32) -> f32 {
	let cornerPoint = abs(point) - halfSize + vec2f(radius);
	return length(max(cornerPoint, vec2f(0.0))) + min(max(cornerPoint.x, cornerPoint.y), 0.0) - radius;
}

@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
	let planeSize = vec2f(${SHADOW_PLANE_WIDTH}, ${SHADOW_PLANE_HEIGHT});
	let buttonSize = vec2f(${BUTTON_WIDTH}, ${BUTTON_HEIGHT});
	// UV 的 y 轴在平面上向上，CSS 像素的 y 轴向下；这里翻转 y 后，正的 offsetY 就是向下投影。
	let pixelPosition = vec2f(input.vUV.x - 0.5, 0.5 - input.vUV.y) * planeSize;
	let shadowOffset = vec2f(${BUTTON_SHADOW_OFFSET_X}, uniforms.shadowOffsetY);
	let radius = min(${BUTTON_FRAME_RADIUS}, min(buttonSize.x, buttonSize.y) * 0.5);
	let distance = roundedRectangleDistance(pixelPosition - shadowOffset, buttonSize * 0.5, radius);
	// 主按钮平面会覆盖 distance <= 0 的区域；这里保留内部 alpha，能保证阴影与按钮边缘连续。
	let alpha = (1.0 - smoothstep(0.0, ${BUTTON_SHADOW_BLUR}, distance)) * uniforms.shadowOpacity;
	fragmentOutputs.color = vec4f(0.0, 0.0, 0.0, alpha);
}
`;

// 主按钮的 WGSL 片元着色器，负责遮罩抗锯齿、流场、液态玻璃和边缘色散。
const fragmentShader = /* wgsl */ `
// 片元阶段的总体数据流：
// HTML 纹理 -> 黑/白/透明语义遮罩 -> 动态背景流场 -> 镂空处的液态玻璃 -> 最终颜色。
// 这样做的目的，是让 DOM 继续负责文字、图标和点击区域，shader 只负责重绘视觉层。
varying vUV: vec2f;
var htmlTextureSampler: sampler;
var htmlTexture: texture_2d<f32>;
// time 驱动连续动画；pressed、isActive 只改变亮度和固定状态，不改变纹理空间坐标。
uniform time: f32;
uniform pressed: f32;
uniform isActive: f32;
// 用纹理像素尺寸计算 texel 偏移，使高度场和模糊半径在不同分辨率下保持一致。
uniform textureSize: vec2f;
// HTML 纹理相对当前画布像素的 mip 级别，由 CPU 根据实际渲染倍率计算。
uniform htmlTextureMipLevel: f32;

struct SourceMasks {
	// HTML 源纹理的 alpha，表示按钮外轮廓的原始覆盖率。
	alpha: f32,
	// 白色子 div 的覆盖率，承载静态白色表面。
	white: f32,
	// 纯黑描边和文字的覆盖率，最终保持为不透明黑色。
	ink: f32,
	// 绿色编码图标的覆盖率，是唯一允许进入液态玻璃的遮罩。
	icon: f32,
}

struct LayerCoverage {
	// 最终输出 alpha，沿用 HTML 纹理的原始按钮轮廓覆盖率。
	alpha: f32,
	// 分配给黑白灰流场的覆盖率。
	flow: f32,
	// 分配给不透明白色表面的覆盖率。
	white: f32,
	// 分配给不透明黑色描边和文字的覆盖率。
	ink: f32,
	// 分配给图标液态玻璃的覆盖率。
	icon: f32,
}

// WebGPU 的 HTML-in-Canvas 上传保持 DOM 的左上原点；平面 UV 需要在采样处翻转 V 轴。
// 遮罩纹理生成 mipmap，采样时由 uniform 指定实际缩小比例对应的级别。显式 LOD 不依赖隐式导数，
// 因而可安全用于后续可能位于非一致分支中的镂空遮罩读取，同时避免高分辨率 HTML 纹理缩小时产生锯齿。
fn sampleHtmlTexture(uv: vec2f) -> vec4f {
	return textureSampleLevel(htmlTexture, htmlTextureSampler, vec2f(uv.x, 1.0 - uv.y), uniforms.htmlTextureMipLevel);
}

fn classifySource(source: vec4f) -> SourceMasks {
	// 遮罩编码使用四种语义颜色：基层 #000018、白色 #fff、普通黑色 #000 和图标 #001800。
	// 在抗锯齿边缘，浏览器输出的是这些颜色的线性混合：红蓝通道的共同部分来自白色，
	// 蓝色相对红绿的增量来自基层，绿色相对红蓝的增量来自图标，最后的剩余覆盖率才是普通黑色。
	// 这样能保留 DOM 的子像素覆盖率，不需要以颜色阈值猜测文字、边框或图标的边界。
	let alpha = clamp(source.a, 0.0, 1.0);
	let white = min(min(source.r, source.b), alpha);
	let base = min(clamp((source.b - max(source.r, source.g)) / ${BUTTON_BASE_BLUE}, 0.0, 1.0), alpha);
	let remainingAfterBase = max(alpha - white - base, 0.0);
	let icon = min(
		clamp((source.g - max(source.r, source.b)) / ${BUTTON_ICON_MASK_GREEN}, 0.0, 1.0),
		remainingAfterBase
	);
	let ink = max(remainingAfterBase - icon, 0.0);
	return SourceMasks(alpha, white, ink, icon);
}

// 将四类语义覆盖率变为互斥图层。白色、普通黑色和图标先获得覆盖率，剩余部分才显示流场；
// 这保证同一个半透明边缘不会被两层颜色重复绘制，也让最终 alpha 始终可追踪。
fn resolveLayers(masks: SourceMasks) -> LayerCoverage {
	let alpha = clamp(masks.alpha, 0.0, 1.0);
	let white = min(clamp(masks.white, 0.0, alpha), alpha);
	let ink = min(clamp(masks.ink, 0.0, alpha - white), alpha - white);
	let icon = min(clamp(masks.icon, 0.0, alpha - white - ink), alpha - white - ink);
	let flow = max(alpha - white - ink - icon, 0.0);
	return LayerCoverage(alpha, flow, white, ink, icon);
}

// 将二维整数网格坐标映射成稳定的伪随机值。它不依赖纹理或外部随机状态，
// 因此同一个坐标始终产生同一个结果，适合在片元 shader 中构造可重复的噪声。
fn hash21(point: vec2f) -> f32 {
	return fract(sin(dot(point, vec2f(127.1, 311.7))) * 43758.5453123);
}

// 对四个网格角点做平滑插值，得到连续的 value noise。
// 设计上选择 value noise 而不是逐像素随机，是为了让流光呈现可追踪的连续形变。
fn valueNoise(uv: vec2f) -> f32 {
	let cell = floor(uv);
	let local = fract(uv);
	let eased = local * local * (3.0 - 2.0 * local);
	let a = hash21(cell);
	let b = hash21(cell + vec2f(1.0, 0.0));
	let c = hash21(cell + vec2f(0.0, 1.0));
	let d = hash21(cell + vec2f(1.0, 1.0));
	return mix(mix(a, b, eased.x), mix(c, d, eased.x), eased.y);
}

// 实现灵感：https://www.shadertoy.com/view/WtdXR8。这里只保留其域扭曲思路，
// 并按按钮 UV、WGSL 和现有 HTML 纹理管线重写，不直接复用 Shadertoy GLSL。
// 先用两种尺度的噪声扭曲坐标，再叠加宽尺度和细节尺度的噪声；这样既保留连续流动，
// 又避免单一正弦带在按钮底部形成重复的平行结构。
fn warpedField(point: vec2f, elapsed: f32) -> f32 {
	let drift = vec2f(elapsed * 0.08 * ${FLOW_TIME_SCALE}, -elapsed * 0.055 * ${FLOW_TIME_SCALE});
	let flowPoint = point * ${FLOW_COORDINATE_SCALE};
	let warp = vec2f(
		valueNoise(flowPoint + vec2f(4.7, -2.1) - drift * 0.7),
		valueNoise(flowPoint + vec2f(-3.4, 5.8) + drift * 0.9)
	);
	let secondaryWarp = vec2f(
		valueNoise(flowPoint * ${FLOW_SECONDARY_WARP_SCALE} + vec2f(-8.2, 3.6) + drift * 1.1),
		valueNoise(flowPoint * ${FLOW_SECONDARY_WARP_SCALE} + vec2f(6.4, -7.7) - drift * 0.8)
	);
	let warpedPoint = flowPoint +
		(warp - vec2f(0.5)) * ${FLOW_WARP_STRENGTH} +
		(secondaryWarp - vec2f(0.5)) * ${FLOW_WARP_STRENGTH * FLOW_SECONDARY_WARP_WEIGHT} +
		drift;
	let broadNoise = valueNoise(warpedPoint);
	let detailNoise = valueNoise(warpedPoint * ${FLOW_NOISE_DETAIL_SCALE} - drift * 1.4 + vec2f(11.3, -4.9));
	return mix(broadNoise, detailNoise, ${FLOW_NOISE_DETAIL_BLEND});
}

// 这是色散前的单通道背景纹理，对应参考实现中的 iChannel0.x。
// 后续色散只在不同横向坐标重复调用这个函数，不再检测边缘或叠加独立颜色层。
fn flowLuminance(uv: vec2f, elapsed: f32) -> f32 {
	// Shadertoy 通常使用 fragCoord / iResolution；当前平面使用 0..1 的 UV，
	// 因此先按纹理宽高比换算到近似的居中屏幕坐标，防止按钮被拉伸后流纹变形。
	let aspect = uniforms.textureSize.x / uniforms.textureSize.y;
	let point = (uv - vec2f(0.5)) * vec2f(aspect, 1.0);
	let field = warpedField(point, elapsed);
	// ribbon 是一条由正弦函数生成的主流带；field 只扭曲其相位，
	// 不再直接参与亮度阈值，首帧和后续帧都会保留稳定的黑白结构。
	let ribbon = 0.5 + 0.5 * sin(
		point.x * ${FLOW_RIBBON_FREQUENCY} - point.y * ${FLOW_RIBBON_FREQUENCY * FLOW_RIBBON_VERTICAL_RATIO} + field * ${FLOW_FIELD_PHASE_STRENGTH} - elapsed * 0.9 * ${FLOW_TIME_SCALE}
	);
	let energy = ribbon;
	// 低于阈值的区域接近黑色，阈值附近保留灰色，高于过渡区的区域才接近白色。
	// 三个通道使用同一个值，保证按钮基层只有黑、白、灰。
	let grayTone = smoothstep(
		${FLOW_BRIGHT_THRESHOLD - FLOW_GRAY_TRANSITION * 0.5},
		${FLOW_BRIGHT_THRESHOLD + FLOW_GRAY_TRANSITION * 0.5},
		energy
	);
	let luminance = mix(${FLOW_BLACK_LEVEL}, ${FLOW_WHITE_LEVEL}, grayTone);
	return clamp(luminance, 0.0, 1.0);
}

// 液态玻璃光学模型改写自 https://github.com/iyinchao/liquid-glass-studio 的 WebGPU WGSL 实现。
// Copyright (c) 2024 Charles Yin，按 MIT License 使用；该实现将其固定形状距离场替换为 SVG 图标遮罩距离场，
// 背景纹理替换为当前程序化流场，其他折射、色散、菲涅耳和眩光计算保持同一模型。
// 注意法线与参考实现一样取自距离场梯度：二值遮罩覆盖率的梯度只在抗锯齿边缘 1~2 像素内非零，
// 直接对它做差分会让形状内部的折射偏移、菲涅耳和眩光全部消失，因此必须由距离场承担法线来源。
const GLASS_PI: f32 = 3.14159265359;
const GLASS_TAU: f32 = GLASS_PI * 2.0;
const GLASS_D65_WHITE: vec3f = vec3f(0.95045592705, 1.0, 1.08905775076);

struct GlassSurface {
	// 到图标边缘的近似距离，单位为 HTML 纹理像素；0 表示位于玻璃折射边缘。
	distanceToEdge: f32,
	// 指向图标外部的二维单位法线；折射偏移、菲涅耳层和眩光层共用该方向。
	normal: vec2f,
}

fn safeAsin(value: f32) -> f32 {
	// WGSL 的 asin 在输入超过 [-1, 1] 时会产生 NaN；折射边缘必须保持有限值。
	return asin(clamp(value, -1.0, 1.0));
}

fn safeNormalize(value: vec2f) -> vec2f {
	let valueLength = length(value);
	if (valueLength < 0.000001) {
		return vec2f(0.0);
	}
	return value / valueLength;
}

fn iconAt(uv: vec2f) -> f32 {
	// 所有邻域采样都经过同一套颜色分类；只读取图标覆盖率，避免文字和描边进入玻璃距离场。
	return classifySource(sampleHtmlTexture(uv)).icon;
}

// 沿单个方向搜索图标边缘，返回从 uv 到覆盖率阈值穿越点的距离，单位为 HTML 纹理像素。
// 抗锯齿边缘的覆盖率平滑过渡，在跨越阈值的两步之间线性插值可得到亚像素精度；
// 没有插值时距离按整数步进量化，其中心差分会在整数值平台上归零，无法用作玻璃法线。
fn iconEdgeDistanceAlong(uv: vec2f, direction: vec2f, texel: vec2f, center: f32) -> f32 {
	var previousMask = center;
	for (var sampleIndex: i32 = 1; sampleIndex <= ${GLASS_DISTANCE_SAMPLE_COUNT}; sampleIndex = sampleIndex + 1) {
		let distance = f32(sampleIndex * ${GLASS_DISTANCE_SAMPLE_STEP});
		let sampledMask = iconAt(uv + direction * texel * distance);
		if (sampledMask < ${GLASS_MASK_INSIDE_THRESHOLD}) {
			let crossing = (previousMask - ${GLASS_MASK_INSIDE_THRESHOLD}) / max(previousMask - sampledMask, 0.00001);
			return distance - f32(${GLASS_DISTANCE_SAMPLE_STEP}) * (1.0 - clamp(crossing, 0.0, 1.0));
		}
		previousMask = sampledMask;
	}
	return f32(${GLASS_DISTANCE_SAMPLE_COUNT * GLASS_DISTANCE_SAMPLE_STEP});
}

fn iconDistanceToEdge(uv: vec2f, center: f32) -> f32 {
	// 参考实现对圆形和圆角矩形直接求解析距离场。当前图标是任意 SVG 路径，
	// 因此从当前像素向固定方向集搜索第一个图标外部样本，得到可用于同一光学模型的近似距离场。
	if (center < ${GLASS_MASK_INSIDE_THRESHOLD}) {
		return 0.0;
	}
	let texel = 1.0 / uniforms.textureSize;
	var nearestDistance = f32(${GLASS_DISTANCE_SAMPLE_COUNT * GLASS_DISTANCE_SAMPLE_STEP});
	for (var directionIndex: i32 = 0; directionIndex < ${GLASS_DISTANCE_DIRECTION_COUNT}; directionIndex = directionIndex + 1) {
		let angle = GLASS_TAU * f32(directionIndex) / f32(${GLASS_DISTANCE_DIRECTION_COUNT});
		let direction = vec2f(cos(angle), sin(angle));
		nearestDistance = min(nearestDistance, iconEdgeDistanceAlong(uv, direction, texel, center));
	}
	return max(nearestDistance - ${GLASS_EDGE_DISTANCE_BIAS}, 0.0);
}

fn sampleGlassSurface(uv: vec2f) -> GlassSurface {
	let center = iconAt(uv);
	let distanceToEdge = iconDistanceToEdge(uv, center);
	var normal = vec2f(0.0);
	// 参考实现的法线是解析 SDF 的中心差分梯度，在形状内部处处有定义且指向外部。
	// 这里对距离场做同样的中心差分：距离朝内递增，梯度朝内，取反即得指向图标外部的法线。
	// 法线只在折射厚度带内参与计算，带外边缘因子为 0，保留零向量以避免无意义的邻域步进。
	if (distanceToEdge < ${GLASS_REFRACTION_THICKNESS}) {
		let texel = 1.0 / uniforms.textureSize;
		let uvRight = uv + vec2f(texel.x, 0.0);
		let uvLeft = uv - vec2f(texel.x, 0.0);
		let uvUp = uv + vec2f(0.0, texel.y);
		let uvDown = uv - vec2f(0.0, texel.y);
		let inwardGradient = vec2f(
			iconDistanceToEdge(uvRight, iconAt(uvRight)) - iconDistanceToEdge(uvLeft, iconAt(uvLeft)),
			iconDistanceToEdge(uvUp, iconAt(uvUp)) - iconDistanceToEdge(uvDown, iconAt(uvDown))
		);
		normal = safeNormalize(-inwardGradient);
	}
	return GlassSurface(distanceToEdge, normal);
}

// 对应 https://www.shadertoy.com/view/lsVGz3 的核心逻辑：从同一张单通道纹理的
// 左、中、右三个偏移位置分别读取亮度，并写进颜色通道。因为三个通道共享同一连续流场，
// 明暗边缘会在采样坐标变化时自然产生连续色散，而不是通过边缘差分绘制纯色轮廓。
// 参考代码使用纯 RGB；这里仅给红、蓝通道补入固定比例的绿色，将色相调整为橘黄和湛蓝。
fn flowChromaticColor(uv: vec2f, elapsed: f32) -> vec3f {
	let offset = vec2f(${CHROMATIC_CHANNEL_OFFSET * TEXTURE_SCALE} / uniforms.textureSize.x, 0.0);
	let left = flowLuminance(uv - offset, elapsed);
	let center = flowLuminance(uv, elapsed);
	let right = flowLuminance(uv + offset, elapsed);
	let green = max(center, max(left * ${CHROMATIC_ORANGE_GREEN_RATIO}, right * ${CHROMATIC_AZURE_GREEN_RATIO}));
	return vec3f(left, green, right);
}

// 对带色散的背景做五点十字模糊，对应参考实现的独立 blurred source pass。
fn blurredFlow(uv: vec2f, elapsed: f32) -> vec3f {
	let radius = ${GLASS_BLUR_RADIUS} / uniforms.textureSize;
	let horizontal = vec2f(radius.x, 0.0);
	let vertical = vec2f(0.0, radius.y);
	return flowChromaticColor(uv, elapsed) * 0.5 +
		(flowChromaticColor(uv - horizontal, elapsed) + flowChromaticColor(uv + horizontal, elapsed) +
			flowChromaticColor(uv - vertical, elapsed) + flowChromaticColor(uv + vertical, elapsed)) * 0.125;
}

fn glassDispersion(uv: vec2f, offset: vec2f, factor: f32, elapsed: f32, blurred: bool) -> vec3f {
	// 参考实现为 R/G/B 使用略有差异的折射率，从同一背景产生连续通道分离。
	let redUv = uv + offset * (1.0 - (${GLASS_RED_REFRACTION_SCALE} - 1.0) * factor);
	let greenUv = uv + offset * (1.0 - (${GLASS_GREEN_REFRACTION_SCALE} - 1.0) * factor);
	let blueUv = uv + offset * (1.0 - (${GLASS_BLUE_REFRACTION_SCALE} - 1.0) * factor);
	let redSharp = flowChromaticColor(redUv, elapsed).r;
	let greenSharp = flowChromaticColor(greenUv, elapsed).g;
	let blueSharp = flowChromaticColor(blueUv, elapsed).b;
	let redBlurred = blurredFlow(redUv, elapsed).r;
	let greenBlurred = blurredFlow(greenUv, elapsed).g;
	let blueBlurred = blurredFlow(blueUv, elapsed).b;
	return vec3f(select(redSharp, redBlurred, blurred), select(greenSharp, greenBlurred, blurred), select(blueSharp, blueBlurred, blurred));
}

fn srgbToLinear(value: f32) -> f32 {
	return select(value / 12.92, pow((value + 0.055) / 1.055, 2.4), value > 0.04045);
}

fn linearToSrgb(value: f32) -> f32 {
	return select(12.92 * value, 1.055 * pow(max(value, 0.0), 0.41666666666) - 0.055, value > 0.0031308);
}

fn srgbToXyz(color: vec3f) -> vec3f {
	let linear = vec3f(srgbToLinear(color.r), srgbToLinear(color.g), srgbToLinear(color.b));
	return vec3f(dot(linear, vec3f(0.4124, 0.3576, 0.1805)), dot(linear, vec3f(0.2126, 0.7152, 0.0722)), dot(linear, vec3f(0.0193, 0.1192, 0.9505)));
}

fn xyzToSrgb(xyz: vec3f) -> vec3f {
	let linear = vec3f(dot(xyz, vec3f(3.2406255, -1.537208, -0.4986286)), dot(xyz, vec3f(-0.9689307, 1.8757561, 0.0415175)), dot(xyz, vec3f(0.0557101, -0.2040211, 1.0569959)));
	return vec3f(linearToSrgb(linear.r), linearToSrgb(linear.g), linearToSrgb(linear.b));
}

fn xyzLabComponent(value: f32) -> f32 {
	return select(7.78703703704 * value + 0.13793103448, pow(value, 0.333333333), value > 0.00885645167);
}

fn srgbToLch(color: vec3f) -> vec3f {
	let xyz = srgbToXyz(color) / GLASS_D65_WHITE;
	let f = vec3f(xyzLabComponent(xyz.x), xyzLabComponent(xyz.y), xyzLabComponent(xyz.z));
	let lab = vec3f(116.0 * f.y - 16.0, 500.0 * (f.x - f.y), 200.0 * (f.y - f.z));
	return vec3f(lab.x, length(lab.yz), atan2(lab.z, lab.y) * 57.2957795131);
}

fn labComponentToXyz(value: f32) -> f32 {
	return select(0.12841854934 * (value - 0.137931034), value * value * value, value > 0.206897);
}

fn lchToSrgb(lch: vec3f) -> vec3f {
	let lab = vec3f(lch.x, lch.y * cos(lch.z * 0.01745329251), lch.y * sin(lch.z * 0.01745329251));
	let w = (lab.x + 16.0) / 116.0;
	let xyz = GLASS_D65_WHITE * vec3f(labComponentToXyz(w + lab.y / 500.0), labComponentToXyz(w), labComponentToXyz(w - lab.z / 200.0));
	return xyzToSrgb(xyz);
}

fn vec2ToAngle(value: vec2f) -> f32 {
	var angle = atan2(value.y, value.x);
	if (angle < 0.0) { angle = angle + GLASS_TAU; }
	return angle;
}

fn glassEdgeFactor(distanceToEdge: f32) -> f32 {
	// 参考实现的 thetaI/thetaT 路径：边缘距离决定折射角，超过厚度后不再折射。
	let normalizedDepth = 1.0 - distanceToEdge / ${GLASS_REFRACTION_THICKNESS};
	if (normalizedDepth <= 0.0) { return 0.0; }
	let thetaI = safeAsin(pow(clamp(normalizedDepth, 0.0, 1.0), 2.0));
	let thetaT = safeAsin(sin(thetaI) / ${GLASS_REFRACTION_FACTOR});
	return max(-tan(thetaT - thetaI), 0.0);
}

fn liquidGlass(uv: vec2f, elapsed: f32) -> vec3f {
	let surface = sampleGlassSurface(uv);
	let edgeFactor = glassEdgeFactor(surface.distanceToEdge);
	if (edgeFactor <= 0.0) { return blurredFlow(uv, elapsed); }
	let refractionOffset = -surface.normal * edgeFactor * ${GLASS_REFRACTION_OFFSET} * vec2f(uniforms.textureSize.y / uniforms.textureSize.x, 1.0);
	let refracted = glassDispersion(uv, refractionOffset, ${GLASS_REFRACTION_DISPERSION}, elapsed, false);
	let blurredPixel = glassDispersion(uv, refractionOffset, ${GLASS_REFRACTION_DISPERSION}, elapsed, true);
	var color = mix(refracted, blurredPixel, select(0.0, 1.0, ${GLASS_BLUR_EDGE}));
	color = mix(color, vec3f(${GLASS_TINT_RED}, ${GLASS_TINT_GREEN}, ${GLASS_TINT_BLUE}), ${GLASS_TINT_OPACITY} * 0.8);
	// 参考实现以菲涅耳提亮之前的颜色作为眩光基色，避免眩光叠加菲涅耳后整体过曝。
	let glareBase = color;
	let fresnelGeometry = clamp(pow(1.0 - surface.distanceToEdge / ${GLASS_FRESNEL_RANGE} + ${GLASS_FRESNEL_HARDNESS}, 5.0), 0.0, 1.0);
	var fresnelLch = srgbToLch(mix(vec3f(1.0), vec3f(${GLASS_TINT_RED}, ${GLASS_TINT_GREEN}, ${GLASS_TINT_BLUE}), ${GLASS_TINT_OPACITY} * 0.5));
	fresnelLch.x = clamp(fresnelLch.x + 20.0 * fresnelGeometry * ${GLASS_FRESNEL_FACTOR}, 0.0, 100.0);
	color = mix(color, lchToSrgb(fresnelLch), fresnelGeometry * ${GLASS_FRESNEL_FACTOR} * 0.7 * length(surface.normal));
	let glareGeometry = clamp(pow(1.0 - surface.distanceToEdge / ${GLASS_GLARE_RANGE} + ${GLASS_GLARE_HARDNESS}, 5.0), 0.0, 1.0);
	let glareAngle = (vec2ToAngle(safeNormalize(surface.normal)) - GLASS_PI / 4.0 + ${GLASS_GLARE_ANGLE}) * 2.0;
	let opposite = select(1.2, 1.2 * ${GLASS_GLARE_OPPOSITE_FACTOR}, glareAngle > GLASS_PI * 1.5 || glareAngle < -GLASS_PI * 0.5);
	let glareAngular = clamp(pow((0.5 + sin(glareAngle) * 0.5) * opposite * ${GLASS_GLARE_FACTOR}, 0.1 + ${GLASS_GLARE_CONVERGENCE} * 2.0), 0.0, 1.0);
	var glareLch = srgbToLch(mix(glareBase, vec3f(${GLASS_TINT_RED}, ${GLASS_TINT_GREEN}, ${GLASS_TINT_BLUE}), ${GLASS_TINT_OPACITY} * 0.5));
	glareLch.x = clamp(glareLch.x + 150.0 * glareAngular * glareGeometry, 0.0, 120.0);
	glareLch.y = glareLch.y + 30.0 * glareAngular * glareGeometry;
	return mix(color, lchToSrgb(glareLch), glareAngular * glareGeometry * length(surface.normal));
}

@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
	// HtmlTexture 已经以 TEXTURE_SCALE 超采样并线性过滤；直接沿用这份子像素覆盖率，
	// 不再额外模糊遮罩，避免圆角、描边、文字和镂空边缘变宽或发虚。
	let layers = resolveLayers(classifySource(sampleHtmlTexture(input.vUV)));
	// 交互不再改变 hover 时的时间速度，避免鼠标移入或移出时重新计算纹理相位而产生整体偏移。
	// 激活状态仍保留固定相位差，按下只降低亮度；这些变化不会依赖指针连续位置。
	let interactionTime = uniforms.time + uniforms.isActive * 1.7;
	let baseFlow = flowChromaticColor(input.vUV, interactionTime) * (1.0 - uniforms.pressed * 0.16);
	// 玻璃只在图标覆盖率存在时计算；文字、边框和白色内层继续使用原始图层，避免语义串扰。
	var glassFlow = baseFlow;
	if (layers.icon > 0.001) {
		glassFlow = liquidGlass(input.vUV, interactionTime);
	}
	// 先以覆盖率加权得到预乘颜色，再除以最终 alpha。这样半透明的圆角、描边、文字和图标
	// 会在合成阶段保持正确颜色，不会因白色、黑色或玻璃层的重复混合而形成阶梯或深色边。
	let premultipliedColor =
		baseFlow * layers.flow + vec3f(1.0) * layers.white + glassFlow * layers.icon;
	let uncolored = premultipliedColor / max(layers.alpha, 0.0001);
	fragmentOutputs.color = vec4f(uncolored, layers.alpha);
}
`;

export default function ShaderButton(): JSX.Element {
	const [canvas, setCanvas] = createSignal<HTMLCanvasElement>();
	let engine: WebGPUEngine | undefined;
	let scene: Scene | undefined;
	let htmlTexture: HtmlTexture | undefined;
	let disposeHtmlButton: (() => void) | undefined;
	let resizeHandler: (() => void) | undefined;
	let htmlFrame: HTMLDivElement | undefined;
	let disposed = false;
	let active = false;
	let nativeInteractionCleanup: (() => void) | undefined;

	/**
	 * 初始化 TSX 到纹理再到 WGSL 平面的完整渲染路径。
	 * HtmlTexture 会把源 button 移动到 Babylon canvas 的直接子节点，以满足 HTML-in-Canvas 的布局与上传约束；
	 * 因此只捕获顶层 button，子 div、图标和文字均作为它的后代一并进入同一张纹理。
	 */
	const initializeScene = async (): Promise<void> => {
		const canvasElement = canvas();
		if (!canvasElement) return;

		try {
			// WICG HTML-in-Canvas 是本实现的必要能力；没有原生/已安装 polyfill 时直接停止，
			// 避免悄悄退回 SVG 快照，保证 DOM 交互和纹理内容来自同一条原生路径。
			canvasElement.layoutSubtree = true;
			engine = await WebGPUEngine.CreateAsync(canvasElement, {
				adaptToDeviceRatio: true,
				antialias: true,
				canvasTabIndex: -1,
				premultipliedAlpha: true,
			});
			if (disposed) {
				engine.dispose();
				return;
			}
			if (!IsHtmlInCanvasUploadSupported(engine) || typeof canvasElement.getElementTransform !== "function") {
				throw new Error(
					"当前浏览器没有 GPUQueue.copyElementImageToTexture；请启用原生 HTML-in-Canvas 或先安装 three-html-render polyfill。",
				);
			}

			scene = new Scene(engine);
			scene.clearColor = new Color4(0, 0, 0, 0);

			const camera = new UniversalCamera("shader-button-camera", new Vector3(0, 0, -CAMERA_DISTANCE), scene);
			camera.fov = CAMERA_FOV;
			camera.setTarget(Vector3.Zero());
			const interactionTransitionSeconds = window.matchMedia("(prefers-reduced-motion: reduce)").matches
				? REDUCED_MOTION_TRANSITION_SECONDS
				: INTERACTION_TRANSITION_SECONDS;

			let htmlButton: HTMLButtonElement | undefined;
			const htmlButtonRoot = document.createElement("div");
			disposeHtmlButton = render(
				() => (
					// 阶段一：黑色基层只定义按钮轮廓，最终会被 WGSL 的动态流光完全覆盖。
					<button
						ref={(element) => {
							htmlButton = element;
						}}
						on:click={() => {
							active = !active;
						}}
						type="button"
						aria-label="液态玻璃按钮"
						style={`
							box-sizing:border-box;
							position:absolute;
							left:0;
							top:0;
							width:${BUTTON_WIDTH}px;
							height:${BUTTON_HEIGHT}px;
							margin:0;
							padding:0;
							border:0;
							border-radius:${BUTTON_FRAME_RADIUS}px;
							background:${BUTTON_BASE_COLOR};
							overflow:hidden;
							appearance:none;
							pointer-events:auto;
							transform-origin:0 0;
							cursor:pointer;
						`}
					>
						{/* 阶段二：白色遮罩覆盖按钮中心，纯黑描边、图标和文字成为 shader 的镂空语义。 */}
						<div
							ref={(element) => {
								htmlFrame = element;
							}}
							style={`
								box-sizing:border-box;
								position:absolute;
								inset:${BUTTON_FRAME_INSET}px;
								--frame-transition:${interactionTransitionSeconds}s;
								transition:top var(--frame-transition) ease,right var(--frame-transition) ease,bottom var(--frame-transition) ease,left var(--frame-transition) ease;
								display:flex;
								align-items:center;
								justify-content:center;
								gap:10px;
								border-radius:999px;
								background:#fff;
							`}
						>
							<svg
								class="icon"
								viewBox="0 0 1024 1024"
								xmlns="http://www.w3.org/2000/svg"
								p-id="1734"
								width="32"
								height="32"
							>
								<title>Search</title>
								<path
									d="M556.885333 338.602667c-59.847111-10.581333-59.847111-97.735111 0-108.373334a158.833778 158.833778 0 0 0 127.032889-122.766222l0.910222-4.437333 0.512-2.161778h0.113778C698.026667 42.496 779.946667 42.097778 792.917333 100.352l0.568889 2.673778a159.914667 159.914667 0 0 0 128.625778 127.203555c60.017778 10.581333 60.017778 97.905778 0 108.487111a159.857778 159.857778 0 0 0-127.715556 122.88l-1.536 6.997334c-13.084444 58.140444-95.004444 57.799111-107.52-0.512l-1.251555-5.916445a158.890667 158.890667 0 0 0-127.203556-123.562666z m237.169778 249.002666a327.111111 327.111111 0 1 1-287.857778-429.283555q16.497778-7.566222 35.783111-11.036445h0.113778q47.786667-8.419556 58.254222-56.035555l0.455112-2.048a412.444444 412.444444 0 1 0 74.126222 760.888889l148.252444 148.252444a42.666667 42.666667 0 0 0 60.302222-60.302222l-136.248888-136.248889a411.591111 411.591111 0 0 0 147.000888-355.441778q-11.776 13.653333-16.497777 34.816l-1.649778 7.168q-11.605333 51.712-52.792889 82.432-13.937778 10.353778-29.240889 16.839111z"
									fill={BUTTON_ICON_MASK_COLOR}
									p-id="1735"
								></path>
							</svg>
							<span
								style={`
								color:#000;
								font-family:ui-sans-serif,system-ui,sans-serif;
								font-size:18px;
								font-weight:700;
								line-height:1;
								letter-spacing:0.5px;
							`}
							>
								AI Mode
							</span>
						</div>
					</button>
				),
				htmlButtonRoot,
			);

			if (!htmlButton) {
				disposeHtmlButton();
				disposeHtmlButton = undefined;
				throw new Error("无法创建 HtmlTexture 的 button 源节点。");
			}

			htmlTexture = new HtmlTexture("shader-button-html", htmlButton, {
				autoUpdate: true,
				generateMipMaps: true,
				height: TEXTURE_HEIGHT,
				scene,
				samplingMode: Texture.TRILINEAR_SAMPLINGMODE,
				useSvgFallback: false,
				width: TEXTURE_WIDTH,
			});
			// HtmlTexture 为避免源节点抢占 canvas 输入会暂时设置 inert；
			// 这里使用 WICG 原生命中测试，因此必须恢复真实 button 的 focus/Tab 能力。
			htmlButton.removeAttribute("inert");

			const material = new ShaderMaterial(
				"shader-button-material",
				scene,
				{ fragmentSource: fragmentShader, vertexSource: vertexShader },
				{
					attributes: ["position", "uv"],
					needAlphaBlending: true,
					samplers: ["htmlTexture"],
					shaderLanguage: ShaderLanguage.WGSL,
					uniforms: ["worldViewProjection", "time", "pressed", "isActive", "textureSize", "htmlTextureMipLevel"],
				},
			);
			material.setTexture("htmlTexture", htmlTexture);
			material.setVector2("textureSize", new Vector2(TEXTURE_WIDTH, TEXTURE_HEIGHT));
			// 在首次取得画布物理尺寸前，先按 CSS 1:1 渲染倍率使用完整缩小级别；后续由 syncHtmlTextureMipLevel 精确修正。
			material.setFloat("htmlTextureMipLevel", Math.log2(TEXTURE_SCALE));
			const shadowMaterial = new ShaderMaterial(
				"shader-button-shadow-material",
				scene,
				{ fragmentSource: shadowFragmentShader, vertexSource: vertexShader },
				{
					attributes: ["position", "uv"],
					needAlphaBlending: true,
					shaderLanguage: ShaderLanguage.WGSL,
					uniforms: ["worldViewProjection", "shadowOffsetY", "shadowOpacity"],
				},
			);
			shadowMaterial.setFloat("shadowOffsetY", BUTTON_SHADOW_OFFSET_Y);
			shadowMaterial.setFloat("shadowOpacity", BUTTON_SHADOW_OPACITY);

			const plane = MeshBuilder.CreatePlane(
				"shader-button-plane",
				{ height: 1, width: BUTTON_WIDTH / BUTTON_HEIGHT },
				scene,
			);
			plane.material = material;
			plane.alphaIndex = 1;
			// 命中测试完全由 canvas 的 layoutsubtree 子节点交给浏览器处理，Babylon 网格不参与 pointer picking。
			plane.isPickable = false;

			// 阴影平面比按钮大出固定像素留白，避免模糊边缘被主按钮网格的边界截断。
			const shadowPlane = MeshBuilder.CreatePlane(
				"shader-button-shadow-plane",
				{ height: 1, width: SHADOW_PLANE_WIDTH / SHADOW_PLANE_HEIGHT },
				scene,
			);
			shadowPlane.alphaIndex = 0;
			shadowPlane.isPickable = false;
			shadowPlane.material = shadowMaterial;
			shadowPlane.position.z = BUTTON_SHADOW_DEPTH;

			/**
			 * 将 TSX 的 CSS 像素尺寸映射到透视平面。
			 * 网格基础高度固定为 1，避免按钮视觉大小被固定世界坐标掩盖；窗口尺寸变化时按相机可见高度重新换算。
			 */
			const syncPlaneSize = (): void => {
				if (canvasElement.clientHeight === 0) return;
				const visibleHeight = 2 * CAMERA_DISTANCE * Math.tan(camera.fov / 2);
				const buttonWorldHeight = (BUTTON_HEIGHT / canvasElement.clientHeight) * visibleHeight;
				const shadowWorldHeight = (SHADOW_PLANE_HEIGHT / canvasElement.clientHeight) * visibleHeight;
				plane.scaling.x = buttonWorldHeight;
				plane.scaling.y = buttonWorldHeight;
				shadowPlane.scaling.x = shadowWorldHeight;
				shadowPlane.scaling.y = shadowWorldHeight;
			};

			/**
			 * 根据画布的实际物理像素倍率选择 HTML 纹理 mip 级别。
			 * HtmlTexture 按 CSS 像素的 TEXTURE_SCALE 倍上传；选择对应级别后，圆角和细线会在缩小时
			 * 先经过纹理过滤再进入遮罩分类，避免直接从第 0 级纹理读取造成覆盖率跳变。
			 */
			const syncHtmlTextureMipLevel = (): void => {
				if (canvasElement.clientWidth === 0) return;
				const renderPixelRatio = (engine?.getRenderWidth() ?? 0) / canvasElement.clientWidth;
				if (!Number.isFinite(renderPixelRatio) || renderPixelRatio <= 0) return;
				const mipLevel = Math.max(Math.log2(TEXTURE_SCALE / renderPixelRatio), 0);
				material.setFloat("htmlTextureMipLevel", mipLevel);
			};

			const nativeTransformViewport = new Viewport(0, 0, 0, 0);
			const projectedCenter = new Vector3();
			const projectedRight = new Vector3();
			const projectedUp = new Vector3();
			const projectedWorldPoint = new Vector3();
			const worldAxisX = new Vector3();
			const worldAxisY = new Vector3();
			const screenRight = new Vector3();
			const screenUp = new Vector3();
			let previousNativeTransform = "";

			/**
			 * 将 Babylon 平面在画布物理像素中的绘制矩阵交给 WICG API，得到真实 DOM button 的命中变换。
			 * getElementTransform 会处理画布 CSS 尺寸、设备像素比和元素 transform-origin；这里不再维护独立 overlay 坐标。
			 */
			const syncNativeHtmlTransform = (): void => {
				if (!htmlButton || !htmlTexture?.isReady() || typeof canvasElement.getElementTransform !== "function") {
					return;
				}

				const renderWidth = engine?.getRenderWidth() ?? 0;
				const renderHeight = engine?.getRenderHeight() ?? 0;
				if (
					renderWidth === 0 ||
					renderHeight === 0 ||
					canvasElement.clientWidth === 0 ||
					canvasElement.clientHeight === 0
				) {
					return;
				}

				try {
					camera.viewport.toGlobalToRef(renderWidth, renderHeight, nativeTransformViewport);
					plane.computeWorldMatrix(true);
					const boundingBox = plane.getBoundingInfo().boundingBox;
					const center = boundingBox.centerWorld;
					const extend = boundingBox.extendSize;
					const world = plane.getWorldMatrix();
					const sceneTransform = scene?.getTransformMatrix();
					if (!sceneTransform) return;

					Vector3.TransformNormalFromFloatsToRef(extend.x, 0, 0, world, worldAxisX);
					Vector3.TransformNormalFromFloatsToRef(0, extend.y, 0, world, worldAxisY);
					Vector3.ProjectToRef(
						center,
						Matrix.IdentityReadOnly,
						sceneTransform,
						nativeTransformViewport,
						projectedCenter,
					);
					center.addToRef(worldAxisX, projectedWorldPoint);
					Vector3.ProjectToRef(
						projectedWorldPoint,
						Matrix.IdentityReadOnly,
						sceneTransform,
						nativeTransformViewport,
						projectedRight,
					);
					center.addToRef(worldAxisY, projectedWorldPoint);
					Vector3.ProjectToRef(
						projectedWorldPoint,
						Matrix.IdentityReadOnly,
						sceneTransform,
						nativeTransformViewport,
						projectedUp,
					);

					projectedRight.subtractToRef(projectedCenter, screenRight);
					projectedUp.subtractToRef(projectedCenter, screenUp);
					const drawTransform = new DOMMatrix([
						screenRight.x * (2 / BUTTON_WIDTH),
						screenRight.y * (2 / BUTTON_WIDTH),
						-screenUp.x * (2 / BUTTON_HEIGHT),
						-screenUp.y * (2 / BUTTON_HEIGHT),
						projectedCenter.x - screenRight.x - screenUp.x,
						projectedCenter.y - screenRight.y - screenUp.y,
					]);
					const cssTransform = canvasElement.getElementTransform(htmlButton, drawTransform).toString();
					if (cssTransform !== previousNativeTransform) {
						htmlButton.style.transform = cssTransform;
						previousNativeTransform = cssTransform;
					}
				} catch {
					// 原生 API 要求先完成一次 paint snapshot；onLoadObservable 会在首次上传后再次同步。
				}
			};

			syncPlaneSize();
			syncHtmlTextureMipLevel();
			htmlTexture.onLoadObservable.addOnce(syncNativeHtmlTransform);
			syncNativeHtmlTransform();

			// 阶段三：WGSL 通过黑白纹理计算遮罩梯度，扭曲流光并在镂空区域增加高光。
			// 流场时间从组件创建时重新计时，保证首帧使用固定纹理相位而不是页面运行时长。
			const animationStartedAt = performance.now();
			let hovered = false;
			let pressed = false;
			let shadowFromOffsetY = BUTTON_SHADOW_OFFSET_Y;
			let shadowFromOpacity = BUTTON_SHADOW_OPACITY;
			let shadowTargetOffsetY = BUTTON_SHADOW_OFFSET_Y;
			let shadowTargetOpacity = BUTTON_SHADOW_OPACITY;
			let shadowTransitionStartedAt = animationStartedAt;
			let shadowTransitionDurationMs = interactionTransitionSeconds * 1000;
			let frameTransitionEndsAt = 0;

			/**
			 * 读取阴影的当前插值值，供新的指针状态从当前帧重新定向。
			 * 这样快速进入、离开或按下不会从旧起点重播，阴影的位置和透明度始终连续。
			 */
			const getShadowState = (now: number): { offsetY: number; opacity: number } => {
				const progress = Math.min((now - shadowTransitionStartedAt) / shadowTransitionDurationMs, 1);
				const easedProgress = progress * progress * (3 - 2 * progress);
				return {
					offsetY: shadowFromOffsetY + (shadowTargetOffsetY - shadowFromOffsetY) * easedProgress,
					opacity: shadowFromOpacity + (shadowTargetOpacity - shadowFromOpacity) * easedProgress,
				};
			};

			/**
			 * 同步真实 DOM 的原生 hover/active 状态与 shader uniform。
			 * 事件监听在 button 上注册，因此 focus、Tab、键盘和 pointer 语义全部由浏览器保留。
			 */
			const setInteractionState = (nextHovered: boolean, nextPressed: boolean): void => {
				if (hovered === nextHovered && pressed === nextPressed) return;

				const now = performance.now();
				const currentShadow = getShadowState(now);
				hovered = nextHovered;
				pressed = nextPressed;
				shadowFromOffsetY = currentShadow.offsetY;
				shadowFromOpacity = currentShadow.opacity;
				shadowTargetOffsetY = nextHovered
					? BUTTON_SHADOW_OFFSET_Y * HOVER_SHADOW_OFFSET_Y_SCALE
					: BUTTON_SHADOW_OFFSET_Y;
				shadowTargetOpacity = nextPressed ? PRESSED_SHADOW_OPACITY : BUTTON_SHADOW_OPACITY;
				shadowTransitionStartedAt = now;
				shadowTransitionDurationMs =
					(nextPressed ? PRESSED_SHADOW_TRANSITION_SECONDS : interactionTransitionSeconds) * 1000;
				frameTransitionEndsAt = now + interactionTransitionSeconds * 1000;

				if (htmlFrame) {
					htmlFrame.style.inset = `${nextHovered ? HOVER_FRAME_INSET : BUTTON_FRAME_INSET}px`;
				}
				htmlTexture?.requestUpdate();
			};

			if (!htmlButton) throw new Error("无法创建原生 HTML-in-Canvas button。");
			const onPointerEnter = () => setInteractionState(true, pressed);
			const onPointerLeave = () => setInteractionState(false, false);
			const onPointerDown = () => setInteractionState(true, true);
			const onPointerUp = () => setInteractionState(true, false);
			htmlButton.addEventListener("pointerenter", onPointerEnter);
			htmlButton.addEventListener("pointerleave", onPointerLeave);
			htmlButton.addEventListener("pointerdown", onPointerDown);
			htmlButton.addEventListener("pointerup", onPointerUp);
			nativeInteractionCleanup = () => {
				htmlButton?.removeEventListener("pointerenter", onPointerEnter);
				htmlButton?.removeEventListener("pointerleave", onPointerLeave);
				htmlButton?.removeEventListener("pointerdown", onPointerDown);
				htmlButton?.removeEventListener("pointerup", onPointerUp);
			};

			scene.registerBeforeRender(() => {
				const now = performance.now();
				const shadowState = getShadowState(now);
				material.setFloat("isActive", active ? 1 : 0);
				material.setFloat("pressed", pressed ? 1 : 0);
				material.setFloat("time", (now - animationStartedAt) * 0.001 + FLOW_INITIAL_TIME);
				shadowMaterial.setFloat("shadowOffsetY", shadowState.offsetY);
				shadowMaterial.setFloat("shadowOpacity", shadowState.opacity);
				// CSS inset 过渡需要连续触发 canvas paint，才能让原生 HTML-in-Canvas 纹理完整显示 0.3 秒状态变化。
				if (now < frameTransitionEndsAt) htmlTexture?.requestUpdate();
			});

			engine.runRenderLoop(() => {
				scene?.render();
			});
			resizeHandler = () => {
				engine?.resize();
				syncPlaneSize();
				syncHtmlTextureMipLevel();
				syncNativeHtmlTransform();
			};
			window.addEventListener("resize", resizeHandler);
		} catch (error) {
			console.error("无法初始化 WebGPU 液态玻璃按钮。", error);
		}
	};

	onMount(() => {
		void initializeScene();
	});

	onCleanup(() => {
		disposed = true;
		if (resizeHandler) window.removeEventListener("resize", resizeHandler);
		nativeInteractionCleanup?.();
		htmlTexture?.dispose();
		disposeHtmlButton?.();
		scene?.dispose();
		engine?.dispose();
	});

	return (
		<canvas ref={setCanvas} class="fixed top-0 left-0 h-dvh w-dvw touch-none bg-transparent outline-none">
			当前浏览器不支持 canvas。
		</canvas>
	);
}
