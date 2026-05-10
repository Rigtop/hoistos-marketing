import { useEffect, useRef } from 'react'
import { Renderer, Geometry, Program, Mesh } from 'ogl'

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
  uniform float uTime;
  uniform float uVelocity;
  uniform vec3 uAccent;
  uniform vec3 uAccent2;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // 2D simplex noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);

    float t = uTime * 0.15;
    float n = snoise(p * 1.6 + t) * 0.5 + 0.5;
    float n2 = snoise(p * 3.0 - t * 1.5) * 0.5 + 0.5;

    // Chromatic split scales with scroll velocity
    float shift = 0.018 + uVelocity * 0.06;

    vec2 dirR = vec2( shift, 0.0);
    vec2 dirB = vec2(-shift, 0.0);

    float r = snoise((p + dirR) * 1.6 + t) * 0.5 + 0.5;
    float b = snoise((p + dirB) * 1.6 + t) * 0.5 + 0.5;

    vec3 base = mix(uAccent2, uAccent, n);
    vec3 col = mix(base, vec3(1.0), n2 * 0.15);

    // RGB-shift accent
    col.r = mix(col.r, r, 0.4);
    col.b = mix(col.b, b, 0.4);

    // Vignette
    float v = smoothstep(0.0, 1.2, 1.0 - length(p) * 0.9);
    col *= v;

    gl_FragColor = vec4(col, 0.55);
  }
`

function parseRgb(varName: string): [number, number, number] {
  const styles = getComputedStyle(document.documentElement)
  const raw = styles.getPropertyValue(varName).trim()
  const parts = raw.split(/\s+/).map((n) => parseFloat(n) / 255)
  if (parts.length !== 3 || parts.some(isNaN)) return [0.95, 0.35, 0]
  return [parts[0], parts[1], parts[2]]
}

/**
 * RGBShiftBackground — generative WebGL background.
 * Two layers of simplex noise blended with theme accent colors,
 * chromatic split that scales with scroll velocity, soft vignette.
 *
 * Drop into a positioned hero. Theme-aware (reads CSS vars at mount).
 */
export function RGBShiftBackground({ className = '' }: { className?: string }) {
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
      program.uniforms.uResolution.value = [r.width, r.height]
    }

    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
      uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
    })

    const accent = parseRgb('--color-accent')
    const accent2 = parseRgb('--color-accent-2')

    const program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uVelocity: { value: 0 },
        uAccent: { value: accent },
        uAccent2: { value: accent2 },
        uResolution: { value: [1, 1] },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    let raf = 0
    let lastY = window.scrollY
    let velocity = 0
    function tick() {
      const y = window.scrollY
      const v = Math.min(Math.abs(y - lastY) / 16, 1)
      velocity += (v - velocity) * 0.1
      lastY = y
      program.uniforms.uVelocity.value = velocity
      program.uniforms.uTime.value = performance.now() / 1000
      renderer.render({ scene: mesh })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      el.removeChild(gl.canvas)
    }
  }, [])

  return <div ref={ref} className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden />
}
