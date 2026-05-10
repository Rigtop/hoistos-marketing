import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl'

/**
 * Threads. OGL fragment shader of 40 Perlin-noise-perturbed horizontal lines
 * flowing slowly across the viewport, single-color, transparent background.
 *
 * Source: DavidHDev/react-bits `src/content/Backgrounds/Threads/Threads.jsx`
 * (verified pull 2026-05-08 via raw.githubusercontent.com).
 *
 * Ported to TypeScript and inlined the .threads-container CSS as a style prop
 * so no external .css file import is required. The shader is unchanged.
 *
 * Color is RGB float, 0 to 1. Signal orange #F25A00 = [0.949, 0.353, 0.0].
 *
 * V7 HoistOS use: replaces WarmGradientMesh. mixBlendMode: multiply against
 * paper white converts the orange-on-transparent shader output to ink-stamp
 * topography rather than glow. Premium 2026 editorial-light treatment.
 */
type ThreadsProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> & {
  color?: [number, number, number]
  amplitude?: number
  distance?: number
  enableMouseInteraction?: boolean
}

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;

#define PI 3.1415926538

const int u_line_count = 40;
const float u_line_width = 7.0;
const float u_line_blur = 10.0;

float Perlin2D(vec2 P) {
    vec2 Pi = floor(P);
    vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
    vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
    Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
    Pt += vec2(26.0, 161.0).xyxy;
    Pt *= Pt;
    Pt = Pt.xzxz * Pt.yyww;
    vec4 hash_x = fract(Pt * (1.0 / 951.135664));
    vec4 hash_y = fract(Pt * (1.0 / 642.949883));
    vec4 grad_x = hash_x - 0.49999;
    vec4 grad_y = hash_y - 0.49999;
    vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y)
        * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
    grad_results *= 1.4142135623730950;
    vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy
               * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
    vec4 blend2 = vec4(blend, vec2(1.0 - blend));
    return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

float pixel(float count, vec2 resolution) {
    return (1.0 / max(resolution.x, resolution.y)) * count;
}

float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse, float time, float amplitude, float distance) {
    float split_offset = (perc * 0.4);
    float split_point = 0.1 + split_offset;

    // V7.3: amplitude_normal was a horizontal smoothstep that faded lines in
    // from the left edge so the wave field only became dramatic on the right.
    // Replaced with constant 1.0 so the wave covers the full viewport at the
    // same intensity the right side previously had. Eugeen: "make the single
    // wave take up the majority of the viewport." Blur gate also dropped so
    // line softness is uniform left-to-right (still varies per-line via perc).
    float amplitude_normal = 1.0;
    float amplitude_strength = 0.5;
    float finalAmplitude = amplitude_normal * amplitude_strength
                           * amplitude * (1.0 + (mouse.y - 0.5) * 0.08);

    float time_scaled = time / 10.0 + (mouse.x - 0.5) * 0.5;
    float blur = perc;

    float xnoise = mix(
        Perlin2D(vec2(time_scaled, st.x + perc) * 2.5),
        Perlin2D(vec2(time_scaled, st.x + time_scaled) * 3.5) / 1.5,
        st.x * 0.3
    );

    float y = 0.5 + (perc - 0.5) * distance + xnoise / 2.0 * finalAmplitude;

    float line_start = smoothstep(
        y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        y,
        st.y
    );

    float line_end = smoothstep(
        y,
        y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        st.y
    );

    return clamp(
        (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))),
        0.0,
        1.0
    );
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;

    float line_strength = 1.0;
    for (int i = 0; i < u_line_count; i++) {
        float p = float(i) / float(u_line_count);
        line_strength *= (1.0 - lineFn(
            uv,
            u_line_width * pixel(1.0, iResolution.xy) * (1.0 - p),
            p,
            (PI * 1.0) * p,
            uMouse,
            iTime,
            uAmplitude,
            uDistance
        ));
    }

    float colorVal = 1.0 - line_strength;
    fragColor = vec4(uColor * colorVal, colorVal);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`

export function Threads({
  color = [1, 1, 1],
  amplitude = 1,
  distance = 0,
  enableMouseInteraction = false,
  style,
  ...rest
}: ThreadsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameId = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current

    // Explicit dpr so iResolution math below is deterministic across reloads.
    // Cap at 2 because beyond that the GPU cost is wasted on this shader.
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const renderer = new Renderer({ alpha: true, dpr })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    container.appendChild(gl.canvas)

    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Color(
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / gl.canvas.height,
          ),
        },
        uColor: { value: new Color(...color) },
        uAmplitude: { value: amplitude },
        uDistance: { value: distance },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })

    function resize() {
      const { clientWidth, clientHeight } = container
      if (clientWidth === 0 || clientHeight === 0) return
      renderer.setSize(clientWidth, clientHeight)
      // V7.5 high-DPI fix: OGL setSize takes CSS pixels and internally
      // multiplies by renderer.dpr for the canvas backing store. The shader
      // uses gl_FragCoord (physical pixels), so iResolution must also be
      // in physical pixels for `fragCoord / iResolution.xy` and
      // `pixel(1.0, iResolution.xy)` (line-width math) to produce correctly-
      // scaled output. Previously passing CSS pixels made lines render 2x
      // thicker on Retina, causing visible stair-stepping. Eugeen S198:
      // "feels a little jagged."
      const dpr = renderer.dpr || 1
      program.uniforms.iResolution.value.r = clientWidth * dpr
      program.uniforms.iResolution.value.g = clientHeight * dpr
      program.uniforms.iResolution.value.b =
        (clientWidth * dpr) / (clientHeight * dpr)
    }

    // V7.4 layout-race fix: window 'resize' alone does not fire when the
    // container's own layout changes (font load reflow, route mount delay,
    // mixBlendMode compositor layer arrival in Safari). ResizeObserver
    // tracks the container box directly and re-runs resize() whenever it
    // actually changes size. Eugeen S198 report: wave was a small strip at
    // top on first load, snapped to full size only after a hover triggered
    // a window event. ResizeObserver eliminates the race.
    let resizeFrame: number | null = null
    function scheduleResize() {
      if (resizeFrame !== null) cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = null
        resize()
      })
    }
    const resizeObserver = new ResizeObserver(scheduleResize)
    resizeObserver.observe(container)
    window.addEventListener('resize', scheduleResize)
    scheduleResize()

    const currentMouse: [number, number] = [0.5, 0.5]
    let targetMouse: [number, number] = [0.5, 0.5]

    // V7.1 fix: when enableMouseInteraction is true and the parent has
    // pointer-events:none (so it does not block CTA cards), the container
    // never receives mousemove. Listen on window instead. Coordinates are
    // normalized to viewport, which matches how the canvas itself paints.
    function handleMouseMove(e: MouseEvent) {
      const x = e.clientX / window.innerWidth
      const y = 1.0 - e.clientY / window.innerHeight
      targetMouse = [x, y]
    }
    function handleMouseLeave() {
      targetMouse = [0.5, 0.5]
    }
    if (enableMouseInteraction) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
      document.addEventListener('mouseleave', handleMouseLeave)
    }

    function update(t: number) {
      const tSec = t * 0.001
      if (enableMouseInteraction) {
        const smoothing = 0.018
        currentMouse[0] += smoothing * (targetMouse[0] - currentMouse[0])
        currentMouse[1] += smoothing * (targetMouse[1] - currentMouse[1])
        program.uniforms.uMouse.value[0] = currentMouse[0]
        program.uniforms.uMouse.value[1] = currentMouse[1]
      } else {
        // V7.5 ambient mode, slowed: Eugeen "moving too much, slow it down."
        // Period multipliers 0.12 -> 0.045 (x period ~140s, was ~52s) and
        // 0.086 -> 0.032 (y period ~196s, was ~73s). Magnitude 0.35 -> 0.22
        // so the orbit also covers a tighter region of uMouse space. Together
        // the wave field drifts almost imperceptibly slowly, the way the
        // light shifts on a still afternoon, instead of looking animated.
        const nx = 0.5 + 0.22 * Math.sin(tSec * 0.045)
        const ny = 0.5 + 0.22 * Math.cos(tSec * 0.032)
        program.uniforms.uMouse.value[0] = nx
        program.uniforms.uMouse.value[1] = ny
      }
      program.uniforms.iTime.value = tSec

      renderer.render({ scene: mesh })
      animationFrameId.current = requestAnimationFrame(update)
    }
    animationFrameId.current = requestAnimationFrame(update)

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
      if (resizeFrame !== null) cancelAnimationFrame(resizeFrame)
      resizeObserver.disconnect()
      window.removeEventListener('resize', scheduleResize)

      if (enableMouseInteraction) {
        window.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseleave', handleMouseLeave)
      }
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(gl.getExtension('WEBGL_lose_context') as any)?.loseContext()
    }
  }, [color, amplitude, distance, enableMouseInteraction])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative', ...style }}
      {...rest}
    />
  )
}

export default Threads
