import { createSignal, type JSX, onCleanup, onMount } from "solid-js";
import { Motion } from "solid-motionone";
import { createLiquidGlassButtonRenderer, type LiquidGlassButtonRenderer } from "./liquidGlassButton.renderer";

export type LiquidGlassButtonProps = {
	icon: JSX.Element;
	text: JSX.Element | string;
};

export const LiquidGlassButton = (props: LiquidGlassButtonProps): JSX.Element => {
	let button!: HTMLButtonElement;
	let backgroundCanvas!: HTMLCanvasElement;
	let iconCanvas!: HTMLCanvasElement;
	let iconHost!: HTMLSpanElement;
	let renderer: LiquidGlassButtonRenderer | null = null;
	let resizeObserver: ResizeObserver | undefined;
	let visibilityObserver: IntersectionObserver | undefined;
	let removeMotionListener: (() => void) | undefined;
	let frame = 0;
	let visible = true;
	let reducedMotion = false;
	let disposed = false;
	const [rendered, setRendered] = createSignal(false);

	onMount(() => {
		const initialize = async (): Promise<void> => {
			const nextRenderer = await createLiquidGlassButtonRenderer(backgroundCanvas, iconCanvas, button, iconHost);
			if (disposed) {
				nextRenderer?.dispose();
				return;
			}
			renderer = nextRenderer;
			if (!renderer) return;

			setRendered(renderer.hasIconLayer);
			const draw = (timestamp: number): void => {
				frame = 0;
				if (!visible || !renderer) return;
				renderer.draw(reducedMotion ? 0 : timestamp * 0.001);
				if (!reducedMotion) frame = requestAnimationFrame(draw);
			};
			const schedule = (): void => {
				if (visible && frame === 0) frame = requestAnimationFrame(draw);
			};
			const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
			reducedMotion = motionQuery.matches;
			const onMotionChange = (event: MediaQueryListEvent): void => {
				reducedMotion = event.matches;
				if (reducedMotion) {
					if (frame !== 0) cancelAnimationFrame(frame);
					frame = 0;
					if (renderer) renderer.draw(0);
				} else {
					schedule();
				}
			};
			motionQuery.addEventListener("change", onMotionChange);
			removeMotionListener = () => motionQuery.removeEventListener("change", onMotionChange);

			resizeObserver = new ResizeObserver(() => {
				renderer?.resize();
				if (reducedMotion) renderer?.draw(0);
				else schedule();
			});
			resizeObserver.observe(button);
			resizeObserver.observe(iconHost);
			visibilityObserver = new IntersectionObserver(([entry]) => {
				visible = entry?.isIntersecting ?? true;
				if (!visible && frame !== 0) {
					cancelAnimationFrame(frame);
					frame = 0;
				}
				if (visible) schedule();
			});
			visibilityObserver.observe(button);
			schedule();
		};
		void initialize();
	});

	onCleanup(() => {
		disposed = true;
		resizeObserver?.disconnect();
		visibilityObserver?.disconnect();
		removeMotionListener?.();
		if (frame !== 0) cancelAnimationFrame(frame);
		renderer?.dispose();
	});

	return (
		<Motion.button
			ref={button}
			type="button"
			aria-label="液态玻璃按钮"
			class={`group relative grid place-self-center cursor-pointer overflow-hidden rounded-full shadow-lg ${rendered() ? "border-transparent bg-transparent" : ""}`}
		>
			<canvas ref={backgroundCanvas} class="pointer-events-none absolute inset-0 z-0 h-full w-full" tabIndex={-1} />
			<span
				aria-hidden="true"
				class="pointer-events-none absolute inset-0.5 z-10 rounded-full bg-primary-color group-hover:inset-0"
			/>
			<canvas ref={iconCanvas} class="pointer-events-none absolute inset-0 z-20 h-full w-full" tabIndex={-1} />
			<span class="relative z-30 flex items-center gap-3 px-6 py-3">
				<span ref={iconHost} class={`shrink-0 opacity-0`} aria-hidden="true">
					{props.icon}
				</span>
				<span class="text-xl">{props.text}</span>
			</span>
		</Motion.button>
	);
};
