import { ICON_SDF_RANGE } from "./liquidGlassButton.iconSdf";

/** WebGL2 全屏四边形顶点着色器，两个视觉 canvas 共用同一套按钮 UV。 */
export const LIQUID_GLASS_VERTEX_SHADER = [
	"#version 300 es",
	"in vec2 a_position;",
	"out vec2 v_uv;",
	"void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}",
].join("\n");

/**
 * 背景和 icon 共享的动态色散场。
 *
 * 两个 canvas 虽然属于不同 WebGL context，不能直接共享 WebGLTexture；这里将「同一纹理」
 * 具体化为同一套 UV、同一套场函数和同一个时间值。这样每个像素的流光相位严格一致，
 * icon 只在此基础上增加 SDF 掩码和玻璃偏移。
 */
const LIQUID_GLASS_DISPERSION_GLSL = [
	"float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
	"float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);float a=hash21(i),b=hash21(i+vec2(1,0)),c=hash21(i+vec2(0,1)),d=hash21(i+1.);return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}",
	"float field(vec2 uv,float t){float aspect=u_resolution.x/max(u_resolution.y,1.);vec2 p=(uv-.5)*vec2(aspect,1.),drift=vec2(t*.08,-t*.055),q=p*.48;",
	"vec2 w=vec2(noise(q+vec2(4.7,-2.1)-drift*.7),noise(q+vec2(-3.4,5.8)+drift*.9));",
	"vec2 s=vec2(noise(q*2.1+vec2(-8.2,3.6)+drift*1.1),noise(q*2.1+vec2(6.4,-7.7)-drift*.8));",
	"vec2 warped=q+(w-.5)*1.25+(s-.5)*.68+drift;float n=mix(noise(warped),noise(warped*2.4-drift*1.4+vec2(11.3,-4.9)),.42);",
	"float ribbon=.5+.5*sin(p.x*2.-p.y*1.48+n*7.-t*1.55);return mix(.012,.94,smoothstep(.86,.95,ribbon));}",
	"vec3 dispersion(vec2 uv,float t){float o=6./max(u_resolution.x,1.);float r=field(uv-vec2(o,0),t),g0=field(uv,t),b=field(uv+vec2(o,0),t);return vec3(r,max(g0,max(r*.42,b*.46)),b);}",
].join("\n");

/** 背景 canvas 始终绘制整个按钮区域；描边宽度由上层 DOM 遮罩的 CSS inset 决定。 */
export const LIQUID_GLASS_BACKGROUND_FRAGMENT_SHADER = [
	"#version 300 es",
	"precision highp float;",
	"in vec2 v_uv;out vec4 out_color;",
	"uniform vec2 u_resolution;uniform float u_time;",
	LIQUID_GLASS_DISPERSION_GLSL,
	"void main(){out_color=vec4(dispersion(v_uv,u_time),1.);}",
].join("\n");

/**
 * icon canvas 的片元着色器。
 *
 * icon 采样的色散场与背景使用同一段 GLSL；SDF 仅负责决定 alpha，glass() 再对同一场做局部折射。
 * SDF 由 2D Canvas 按顶部到下部写入纹理数组，local.y 已经是顶部坐标，因此这里不能再次翻转 y。
 */
export const LIQUID_GLASS_ICON_FRAGMENT_SHADER = [
	"#version 300 es",
	"precision highp float;",
	"in vec2 v_uv;out vec4 out_color;",
	"uniform vec2 u_resolution;uniform vec4 u_icon_rect;uniform float u_icon_sdf_inset;uniform float u_time;uniform sampler2D u_icon_sdf;",
	LIQUID_GLASS_DISPERSION_GLSL,
	`float iconDistance(vec2 pixel){vec2 local=(pixel-u_icon_rect.xy)/max(u_icon_rect.zw,vec2(.001));if(any(lessThan(local,vec2(0)))||any(greaterThan(local,vec2(1))))return -${ICON_SDF_RANGE.toFixed(1)};vec2 textureUv=mix(vec2(u_icon_sdf_inset),vec2(1.-u_icon_sdf_inset),local);float encoded=texture(u_icon_sdf,textureUv).r;return (encoded-.5)*${(ICON_SDF_RANGE * 2).toFixed(1)};}`,
	"vec2 iconNormal(vec2 pixel){float r=iconDistance(pixel+vec2(1,0)),l=iconDistance(pixel-vec2(1,0)),d=iconDistance(pixel+vec2(0,1)),u=iconDistance(pixel-vec2(0,1));vec2 g=vec2(r-l,d-u);return length(g)>.001?normalize(-g):vec2(0);}",
	"vec3 glass(vec2 uv,vec2 pixel,float distanceValue,float t){vec2 n=iconNormal(pixel);float depth=clamp(1.-max(distanceValue,0.)/20.,0.,1.);vec2 offset=-n*depth*vec2(u_resolution.y/max(u_resolution.x,1.),1.)*.055;vec3 color=dispersion(uv+offset,t);float fresnel=pow(clamp(1.-max(distanceValue,0.)/30.,0.,1.),4.);float glare=pow(max(dot(n,normalize(vec2(-.72,-.68))),0.),2.)*fresnel;color=mix(color,vec3(.98,.99,1.),fresnel*.25);color+=vec3(1.,.38,.2)*glare*.22;color+=vec3(.2,.85,.95)*(1.-glare)*fresnel*.08;return color;}",
	"void main(){vec2 pixel=vec2(v_uv.x*u_resolution.x,(1.-v_uv.y)*u_resolution.y);float signedIcon=iconDistance(pixel);float iconAa=max(fwidth(signedIcon),.8);float icon=clamp(smoothstep(-iconAa,iconAa,signedIcon),0.,1.);vec3 color=glass(v_uv,pixel,signedIcon,u_time);out_color=vec4(color*icon,icon);}",
].join("\n");
