/**
 * 按钮渲染方案：
 * 1. TSX 声明 button、白色遮罩、描边、图标和文字，HtmlTexture 将整个顶层 button 上传为一张纹理。
 * 2. WGSL 从纹理 alpha 和黑白语义提取基层、白色遮罩与纯黑镂空；基层显示动态流光，白色区域保持不透明。
 * 3. 纯黑镂空使用平滑遮罩构成高度场，以一次折射、背景模糊和镜面高光合成液态玻璃。
 * 4. 平面尺寸始终按 BUTTON_WIDTH 和 BUTTON_HEIGHT 的 CSS 像素值映射，HtmlRaycastInteractionManager 负责将点击回传 DOM。
 */
import { createSignal, type JSX, onCleanup, onMount } from "solid-js";
import { render } from "solid-js/web";
import { Icons } from "~/components/ui/icons";
import {
	Color4,
	HtmlRaycastInteractionManager,
	HtmlTexture,
	MeshBuilder,
	PointerEventTypes,
	Scene,
	ShaderLanguage,
	ShaderMaterial,
	UniversalCamera,
	Vector2,
	Vector3,
	WebGPUEngine,
} from "~/platform/render/babylon/runtime";

const BUTTON_WIDTH = 240;
const BUTTON_HEIGHT = 80;
const TEXTURE_SCALE = 2;
const TEXTURE_WIDTH = BUTTON_WIDTH * TEXTURE_SCALE;
const TEXTURE_HEIGHT = BUTTON_HEIGHT * TEXTURE_SCALE;
const CAMERA_DISTANCE = 8;
const CAMERA_FOV = 0.8;

const vertexShader = /* wgsl */ `
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

const fragmentShader = /* wgsl */ `
varying vUV: vec2f;
var htmlTextureSampler: sampler;
var htmlTexture: texture_2d<f32>;
uniform time: f32;
uniform hover: f32;
uniform pressed: f32;
uniform isActive: f32;
uniform textureSize: vec2f;

struct Masks {
	base: f32,
	white: f32,
	hole: f32,
}

// WebGPU 的 HTML-in-Canvas 上传保持 DOM 的左上原点；平面 UV 需要在采样处翻转 V 轴。
// 遮罩纹理不生成 mipmap，固定采样第 0 级可避免在逐像素镂空分支中触发隐式导数的 WebGPU 校验错误。
fn sampleHtmlTexture(uv: vec2f) -> vec4f {
	return textureSampleLevel(htmlTexture, htmlTextureSampler, vec2f(uv.x, 1.0 - uv.y), 0.0);
}

fn classifySource(source: vec4f) -> Masks {
	let luminance = dot(source.rgb, vec3f(0.2126, 0.7152, 0.0722));
	let white = source.a * smoothstep(0.18, 0.84, luminance);
	// 按钮基层的 #000018 仅是纹理语义编码，借蓝色通道将其与真实纯黑镂空区分。
	let baseEncoding = smoothstep(0.028, 0.075, max(source.b - source.r, source.b - source.g));
	let hole = source.a * (1.0 - white) * (1.0 - baseEncoding);
	return Masks(source.a, white, hole);
}

fn hash21(point: vec2f) -> f32 {
	return fract(sin(dot(point, vec2f(127.1, 311.7))) * 43758.5453123);
}

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

fn flowColor(uv: vec2f, elapsed: f32) -> vec3f {
	let waveUv = vec2f(uv.x * 4.4, uv.y * 2.8);
	let broadWave = sin(waveUv.x * 2.4 - waveUv.y * 1.8 - elapsed * 1.35);
	let narrowWave = sin(waveUv.x * 7.6 + waveUv.y * 4.0 + elapsed * 2.1);
	let turbulence = valueNoise(waveUv * 1.7 + vec2f(elapsed * 0.22, -elapsed * 0.16));
	let energy = clamp(0.48 + broadWave * 0.25 + narrowWave * 0.12 + turbulence * 0.28, 0.0, 1.0);
	let spectrum = 0.5 + 0.5 * sin(vec3f(0.0, 2.05, 4.1) + energy * 6.2831853 + elapsed * 0.38);
	let base = mix(vec3f(0.015, 0.025, 0.05), spectrum, 0.9);
	return base * (0.62 + energy * 0.72);
}

fn holeAt(uv: vec2f) -> f32 {
	return classifySource(sampleHtmlTexture(uv)).hole;
}

fn glassHeight(uv: vec2f) -> f32 {
	let texel = 1.0 / uniforms.textureSize;
	let nearX = vec2f(texel.x * 2.0, 0.0);
	let nearY = vec2f(0.0, texel.y * 2.0);
	let diagonal = vec2f(texel.x * 1.5, texel.y * 1.5);
	let farX = vec2f(texel.x * 4.0, 0.0);
	let farY = vec2f(0.0, texel.y * 4.0);
	return holeAt(uv) * 0.18 +
		(holeAt(uv - nearX) + holeAt(uv + nearX) + holeAt(uv - nearY) + holeAt(uv + nearY)) * 0.11 +
		(holeAt(uv - diagonal) + holeAt(uv + diagonal) + holeAt(uv + vec2f(diagonal.x, -diagonal.y)) +
			holeAt(uv + vec2f(-diagonal.x, diagonal.y))) *
			0.055 +
		(holeAt(uv - farX) + holeAt(uv + farX) + holeAt(uv - farY) + holeAt(uv + farY)) * 0.04;
}

fn blurredFlow(uv: vec2f, elapsed: f32) -> vec3f {
	let blurRadius = 4.0 / uniforms.textureSize;
	let horizontal = vec2f(blurRadius.x, 0.0);
	let vertical = vec2f(0.0, blurRadius.y);
	let diagonal = blurRadius;
	return flowColor(uv, elapsed) * 0.32 +
		(flowColor(uv - horizontal, elapsed) + flowColor(uv + horizontal, elapsed) + flowColor(uv - vertical, elapsed) +
			flowColor(uv + vertical, elapsed)) *
			0.09 +
		(flowColor(uv - diagonal, elapsed) + flowColor(uv + diagonal, elapsed) + flowColor(uv + vec2f(diagonal.x, -diagonal.y), elapsed) +
			flowColor(uv + vec2f(-diagonal.x, diagonal.y), elapsed)) *
			0.08;
}

fn saturateColor(color: vec3f, amount: f32) -> vec3f {
	let luminance = dot(color, vec3f(0.2126, 0.7152, 0.0722));
	return mix(vec3f(luminance), color, amount);
}

fn liquidGlass(uv: vec2f, elapsed: f32) -> vec3f {
	let texel = 1.0 / uniforms.textureSize;
	let surfaceHeight = glassHeight(uv);
	let gradientStep = vec2f(texel.x * 1.5, texel.y * 1.5);
	let gradient = vec2f(
		glassHeight(uv + vec2f(gradientStep.x, 0.0)) - glassHeight(uv - vec2f(gradientStep.x, 0.0)),
		glassHeight(uv + vec2f(0.0, gradientStep.y)) - glassHeight(uv - vec2f(0.0, gradientStep.y))
	);
	let normal = normalize(vec3f(-gradient * 3.8, 1.0));
	let refractedRay = refract(vec3f(0.0, 0.0, -1.0), normal, 1.0 / 1.33);
	let refractionOffset = refractedRay.xy * (0.018 + surfaceHeight * 0.024);
	let ripple = vec2f(
		sin(uv.y * 21.0 + elapsed * 1.3),
		cos(uv.x * 18.0 - elapsed * 1.1)
	) * 0.0015;
	let refractedUv = uv + refractionOffset + ripple;
	let blurred = blurredFlow(refractedUv, elapsed);
	let dispersion = normal.xy * 0.0018;
	let refracted = vec3f(
		mix(blurred.r, flowColor(refractedUv + dispersion, elapsed).r, 0.45),
		blurred.g,
		mix(blurred.b, flowColor(refractedUv - dispersion, elapsed).b, 0.45)
	);
	let saturated = saturateColor(refracted, 1.35);
	let highlightDirection = normalize(vec3f(-0.38, 0.42, 0.82));
	let directionalHighlight = pow(max(dot(normal, highlightDirection), 0.0), 24.0);
	let rimHighlight = smoothstep(0.025, 0.38, length(gradient));
	let highlightBand = smoothstep(0.74, 0.96, 0.5 + 0.5 * sin(uv.x * 10.0 - uv.y * 6.0 + elapsed * 0.18));
	let specular = directionalHighlight * (0.62 + highlightBand * 0.38) + rimHighlight * 0.16;
	return saturated * (0.88 + normal.z * 0.12) + vec3f(0.74, 0.9, 1.0) * specular;
}

@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
	let source = sampleHtmlTexture(input.vUV);
	let masks = classifySource(source);
	let interactionTime = uniforms.time * (1.0 + uniforms.hover * 0.28) + uniforms.isActive * 1.7;
	let baseFlow = flowColor(input.vUV, interactionTime) * (1.0 - uniforms.pressed * 0.16);
	let covered = mix(baseFlow, vec3f(1.0), masks.white);
	var finalColor: vec3f = covered;
	if (masks.hole > 0.001) {
		let glassFlow = liquidGlass(input.vUV, interactionTime);
		finalColor = mix(covered, glassFlow, masks.hole);
	}
	fragmentOutputs.color = vec4f(finalColor, masks.base);
}
`;

export default function ShaderButton(): JSX.Element {
	const [canvas, setCanvas] = createSignal<HTMLCanvasElement>();
	let engine: WebGPUEngine | undefined;
	let scene: Scene | undefined;
	let htmlTexture: HtmlTexture | undefined;
	let interactionManager: HtmlRaycastInteractionManager | undefined;
	let disposeHtmlButton: (() => void) | undefined;
	let resizeHandler: (() => void) | undefined;
	let textureMutationObserver: MutationObserver | undefined;
	let disposed = false;
	let active = false;

	/**
	 * 初始化 TSX 到纹理再到 WGSL 平面的完整渲染路径。
	 * HtmlTexture 会把源 button 移动到 Babylon canvas 的直接子节点，以满足 HTML-in-Canvas 的布局与上传约束；
	 * 因此只捕获顶层 button，子 div、图标和文字均作为它的后代一并进入同一张纹理。
	 */
	const initializeScene = async (): Promise<void> => {
		const canvasElement = canvas();
		if (!canvasElement) return;

		try {
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

			scene = new Scene(engine);
			scene.clearColor = new Color4(0, 0, 0, 0);

			const camera = new UniversalCamera("shader-button-camera", new Vector3(0, 0, -CAMERA_DISTANCE), scene);
			camera.fov = CAMERA_FOV;
			camera.setTarget(Vector3.Zero());

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
							border-radius:24px;
							background:#000018;
							overflow:hidden;
							appearance:none;
							cursor:pointer;
						`}
					>
						{/* 阶段二：白色遮罩覆盖按钮中心，纯黑描边、图标和文字成为 shader 的镂空语义。 */}
						<div
							style={`
								box-sizing:border-box;
								position:absolute;
								inset:10px;
								display:flex;
								align-items:center;
								justify-content:center;
								gap:10px;
								border:2px solid #000;
								border-radius:16px;
								background:#fff;
								color:#000;
								font-family:ui-sans-serif,system-ui,sans-serif;
								font-size:18px;
								font-weight:700;
								line-height:1;
								letter-spacing:0;
							`}
						>
							<Icons.Outline.Gamepad aria-hidden="true" style="display:block;color:#000;flex:none" />
							<span>Liquid Shader</span>
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
				height: TEXTURE_HEIGHT,
				scene,
				useSvgFallback: true,
				width: TEXTURE_WIDTH,
			});

			const material = new ShaderMaterial(
				"shader-button-material",
				scene,
				{ fragmentSource: fragmentShader, vertexSource: vertexShader },
				{
					attributes: ["position", "uv"],
					needAlphaBlending: true,
					samplers: ["htmlTexture"],
					shaderLanguage: ShaderLanguage.WGSL,
					uniforms: ["worldViewProjection", "time", "hover", "pressed", "isActive", "textureSize"],
				},
			);
			material.setTexture("htmlTexture", htmlTexture);
			material.setVector2("textureSize", new Vector2(TEXTURE_WIDTH, TEXTURE_HEIGHT));

			// 原生 HTML-in-Canvas 会在 paint 事件时自动刷新；这里补充 DOM 观察，
			// 使开发时修改描边、图标或文字也能同步刷新 SVG 降级路径中的遮罩纹理。
			textureMutationObserver = new MutationObserver(() => {
				htmlTexture?.requestUpdate();
			});
			textureMutationObserver.observe(htmlButton, {
				attributes: true,
				characterData: true,
				childList: true,
				subtree: true,
			});

			const plane = MeshBuilder.CreatePlane(
				"shader-button-plane",
				{ height: 1, width: BUTTON_WIDTH / BUTTON_HEIGHT },
				scene,
			);
			plane.material = material;

			/**
			 * 将 TSX 的 CSS 像素尺寸映射到透视平面。
			 * 网格基础高度固定为 1，避免按钮视觉大小被固定世界坐标掩盖；窗口尺寸变化时按相机可见高度重新换算。
			 */
			const syncPlaneSize = (): void => {
				if (canvasElement.clientHeight === 0) return;
				const visibleHeight = 2 * CAMERA_DISTANCE * Math.tan(camera.fov / 2);
				const buttonWorldHeight = (BUTTON_HEIGHT / canvasElement.clientHeight) * visibleHeight;
				plane.scaling.x = buttonWorldHeight;
				plane.scaling.y = buttonWorldHeight;
			};
			syncPlaneSize();

			// 阶段三：WGSL 通过黑白纹理计算遮罩梯度，扭曲流光并在镂空区域增加高光。
			interactionManager = new HtmlRaycastInteractionManager(scene, htmlTexture, plane);
			let hovered = false;
			let pressed = false;
			scene.onPointerObservable.add((pointerInfo) => {
				const hitButton = pointerInfo.pickInfo?.hit === true && pointerInfo.pickInfo.pickedMesh === plane;
				switch (pointerInfo.type) {
					case PointerEventTypes.POINTERMOVE:
						hovered = hitButton;
						break;
					case PointerEventTypes.POINTERDOWN:
						pressed = hitButton;
						break;
					case PointerEventTypes.POINTERUP:
						pressed = false;
						break;
				}
			});

			scene.registerBeforeRender(() => {
				material.setFloat("isActive", active ? 1 : 0);
				material.setFloat("hover", hovered ? 1 : 0);
				material.setFloat("pressed", pressed ? 1 : 0);
				material.setFloat("time", performance.now() * 0.001);
			});

			engine.runRenderLoop(() => {
				scene?.render();
			});
			resizeHandler = () => {
				engine?.resize();
				syncPlaneSize();
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
		textureMutationObserver?.disconnect();
		interactionManager?.dispose();
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
