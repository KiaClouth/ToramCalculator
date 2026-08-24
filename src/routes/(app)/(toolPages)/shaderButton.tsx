import { HtmlTexture } from "@babylonjs/core/Materials/Textures";
import { createEffect, createMemo, createSignal, type JSX, onCleanup, onMount } from "solid-js";
import { Motion } from "solid-motionone";
import { Icons } from "~/components/ui/icons";
import type { AbstractEngine } from "~/platform/render/babylon/runtime";
import { Color3, Color4, Engine, Scene, UniversalCamera, Vector3 } from "~/platform/render/babylon/runtime";
import { store } from "~/store";
import { resolveColorSystem } from "~/styles/colorSystem/colorSystemController";

export default function ShaderButton(): JSX.Element {
	// 主题色计算
	const colorSystem = createMemo(() =>
		resolveColorSystem(store.settings.userInterface.theme, store.settings.userInterface.themeVersion),
	);
	// 颜色系统输出的是中立投影，这里只做 Babylon Color3 运行时适配
	const themePrimaryColor = createMemo(() => new Color3(...colorSystem().colors.semantic.primary.rgb01));
	// canvas引用
	const [canvas, setCanvas] = createSignal<HTMLCanvasElement>();
	// 引擎定义
	let engine: AbstractEngine;
	// 场景定义
	let scene: Scene;
	// 相机定义
	let camera: UniversalCamera;

	// 主场景内容
	onMount(async () => {
		const canvasElement = canvas();
		if (!canvasElement) {
			console.error("Canvas element is not available.");
			return;
		}
		engine = new Engine(canvasElement, true);
		//自定义加载动画
		engine.loadingScreen = {
			displayLoadingUI: (): void => {
				// console.log('display')
			},
			hideLoadingUI: (): void => {
				// console.log('hidden')
			},
			loadingUIBackgroundColor: "#000000",
			loadingUIText: "Loading...",
		};
		scene = new Scene(engine);
		scene.clearColor = new Color4(1, 1, 1, 1);
		createEffect(() => {
			scene.ambientColor = themePrimaryColor();
		});

		// 测试模式配置函数
		// 开发环境下启动检查器。生产构建会移除这个分支，避免打包 Babylon Inspector。
		if (import.meta.env.DEV) {
			const openInspector = async () => {
				await import("@babylonjs/core/Debug/debugLayer");
				await import("@babylonjs/inspector");
				const { AxesViewer } = await import("@babylonjs/core/Debug/axesViewer");
				// 是否开启inspector ///////////////////////////////////////////////////////////////////////////////////////////////////
				void scene.debugLayer.show({
					// embedMode: true
				});
				// 世界坐标轴显示
				new AxesViewer(scene, 0.1);
			};

			await openInspector();
		}

		// 摄像机
		camera = new UniversalCamera("Camera", new Vector3(0, 1, 0), scene);
		camera.attachControl(canvasElement, true);
		camera.minZ = 0.1;
		camera.fov = 1;
		camera.inputs.addMouseWheel();

		// ---------------------------- 按钮绘制 ------------------------------
		const htmlTexture = HtmlTexture(
			"html",
			<Motion.button>
				<div class="Mask">
					<Icons.Filled.Gamepad /> ShaderBG Button
				</div>
			</Motion.button>,
			{ scene },
		);

		// 当场景中资源加载和初始化完成后
		scene.executeWhenReady(() => {
			// 注册循环渲染函数
			engine.runRenderLoop(() => {
				scene.render();
			});
		});
	});

	onCleanup(() => {
		scene?.dispose();
		engine?.dispose();
	});

	return (
		<canvas ref={setCanvas} class="fixed top-0 left-0 h-dvh w-dvw bg-transparent">
			当前浏览器不支持canvas，尝试更换Google Chrome浏览器尝试
		</canvas>
	);
}
