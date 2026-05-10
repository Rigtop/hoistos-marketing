import { useEffect, useRef } from 'react'
import { Renderer, Geometry, Program, Mesh, Texture } from 'ogl'

const VERTEX = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform float uHover;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec2 m = uMouse;
    float dist = distance(uv, m);

    // Concentric ripple from mouse
    float ripple = sin(dist * 28.0 - uTime * 3.0) * 0.018 * uHover;
    ripple *= 1.0 - smoothstep(0.0, 0.55, dist);

    // Cursor-direction warp (UV bend toward mouse)
    vec2 dir = (uv - m) * 0.06 * uHover * (1.0 - smoothstep(0.0, 0.4, dist));
    uv += dir + vec2(ripple);

    // Slight chromatic split inside the ripple zone
    float split = 0.004 * uHover * (1.0 - smoothstep(0.0, 0.3, dist));
    float r = texture2D(tMap, uv + vec2(split, 0.0)).r;
    float g = texture2D(tMap, uv).g;
    float b = texture2D(tMap, uv - vec2(split, 0.0)).b;
    gl_FragColor = vec4(r, g, b, 1.0);
  }
`

type Props = {
  /** Image URL (must be CORS-friendly or local). */
  src: string
  /** Optional aspect ratio (e.g. "16/9"). Default "16/10". */
  aspect?: string
  className?: string
  /** Alt text for accessibility. */
  alt?: string
}

/**
 * DistortionImage — image with cursor-driven WebGL distortion.
 *
 * Renders an ogl plane with the image as a texture. Fragment shader
 * adds a concentric ripple, UV bend toward the mouse, and a small
 * chromatic split. All effects fade in/out with hover state.
 *
 * Codrops VFX-JS pattern, ~120 lines, theme-agnostic (works on any image).
 */
export function DistortionImage({ src, aspect = '16 / 10', className = '', alt = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const renderer = new Renderer({ alpha: true, dpr: Math.min(window.devicePixelRatio, 2) })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    el.appendChild(gl.canvas)
    gl.canvas.style.width = '100%'
    gl.canvas.style.height = '100%'
    gl.canvas.style.display = 'block'

    function resize() {
      const r = el!.getBoundingClientRect()
      renderer.setSize(r.width, r.height)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
      uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
    })

    const texture = new Texture(gl)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src
    img.onload = () => {
      texture.image = img
    }

    const program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      uniforms: {
        tMap: { value: texture },
        uMouse: { value: [0.5, 0.5] },
        uTime: { value: 0 },
        uHover: { value: 0 },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })

    const target = { mx: 0.5, my: 0.5, hover: 0 }
    const current = { mx: 0.5, my: 0.5, hover: 0 }

    function onMove(e: PointerEvent) {
      const r = el!.getBoundingClientRect()
      target.mx = (e.clientX - r.left) / r.width
      target.my = 1 - (e.clientY - r.top) / r.height
      target.hover = 1
    }
    function onLeave() {
      target.hover = 0
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)

    let raf = 0
    const t0 = performance.now()
    function loop() {
      // ease toward target
      current.mx += (target.mx - current.mx) * 0.12
      current.my += (target.my - current.my) * 0.12
      current.hover += (target.hover - current.hover) * 0.08

      program.uniforms.uMouse.value = [current.mx, current.my]
      program.uniforms.uTime.value = (performance.now() - t0) / 1000
      program.uniforms.uHover.value = current.hover
      renderer.render({ scene: mesh })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      el.removeChild(gl.canvas)
    }
  }, [src])

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{ aspectRatio: aspect }}
      role="img"
      aria-label={alt}
    />
  )
}
