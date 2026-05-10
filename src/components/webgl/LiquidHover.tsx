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

// Liquid distortion: polar coordinates around cursor + sin warp on radius.
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

    // Polar coords from cursor
    vec2 d = uv - m;
    float r = length(d);
    float a = atan(d.y, d.x);

    // Sin warp on radius, swirl on angle
    float ripple = sin(r * 24.0 - uTime * 2.4) * 0.05 * uHover * smoothstep(0.45, 0.0, r);
    float swirl = sin(a * 3.0 + uTime * 0.6) * 0.04 * uHover * smoothstep(0.4, 0.0, r);

    vec2 warped = m + vec2(cos(a + swirl), sin(a + swirl)) * (r + ripple);

    // Light chromatic split that scales with distortion
    float split = 0.005 * uHover * smoothstep(0.4, 0.0, r);
    float cr = texture2D(tMap, warped + vec2(split, 0.0)).r;
    float cg = texture2D(tMap, warped).g;
    float cb = texture2D(tMap, warped - vec2(split, 0.0)).b;

    gl_FragColor = vec4(cr, cg, cb, 1.0);
  }
`

type Props = {
  src: string
  aspect?: string
  className?: string
  alt?: string
}

/**
 * LiquidHover: image with liquid distortion centered on the cursor.
 *
 * Polar-coord shader. Sin warp on radius for ripple + sin swirl on angle for
 * twist. Slight chromatic split inside the distortion zone. Eases in/out
 * with hover state. Uses ogl micro WebGL.
 *
 * Sister of DistortionImage but with a more aggressive, "liquid" feel.
 */
export function LiquidHover({ src, aspect = '16 / 10', className = '', alt = '' }: Props) {
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
      current.mx += (target.mx - current.mx) * 0.12
      current.my += (target.my - current.my) * 0.12
      current.hover += (target.hover - current.hover) * 0.07

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
