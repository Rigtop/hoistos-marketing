/**
 * BigMomentChapterShader.tsx
 *
 * Lazy-mounted R3F shader plane used by BigMomentChapterBreak as its
 * "noise mesh" depth layer. Default-exported so the parent can lazy-import.
 *
 * Stack: @react-three/fiber@9.6.1 + @react-three/drei@10.7.7 + three@0.184.
 * Renders one full-screen orthographic plane with a fragment shader that
 * draws a slow signal-orange simplex-style noise field plus a drei
 * <Sparkles> burst behind the chapter title.
 *
 * Hard Rule #11: zero em dashes.
 * Hard Rule #19: brand colors only.
 * Hard Rule #31 (Context7): @react-three/fiber API used here is <Canvas>,
 *   useFrame((state) => state.clock.elapsedTime). drei API: <Sparkles count
 *   size scale color speed noise>. All declarative; renders to a canvas the
 *   parent positions via absolute fill.
 *
 * Tab C-fx Phase 1 companion, S198 morning, 2026-05-08.
 */

import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

interface ShaderNoiseMeshProps {
  /** 0..1 multiplier on the noise mesh contrast. */
  intensity?: number
  /** 0..1 lean toward signal-2 (lighter orange). */
  accent2Lean?: number
}

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Trig-based pseudo-noise. Cheap, no lookups, no extra deps.
// Three layers of sin + cos summed at different frequencies.
const FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uAccent;
  uniform vec3 uAccent2;
  uniform float uAccent2Lean;

  float noise2(vec2 p) {
    return sin(p.x * 1.8 + uTime * 0.18)
         * sin(p.y * 2.1 - uTime * 0.13)
         + 0.5 * sin(p.x * 4.6 - uTime * 0.21)
         * sin(p.y * 5.3 + uTime * 0.17)
         + 0.25 * sin(p.x * 9.1 + uTime * 0.27)
         * sin(p.y * 8.4 - uTime * 0.31);
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float n = noise2(uv * 1.4);
    n = n * 0.5 + 0.5;

    // Radial mask so the noise softens at edges and concentrates center.
    float r = length(uv);
    float mask = smoothstep(1.05, 0.25, r);

    float v = n * mask * uIntensity;

    vec3 col = mix(uAccent, uAccent2, clamp(uAccent2Lean + n * 0.4, 0.0, 1.0));
    float alpha = clamp(v * 0.55, 0.0, 0.7);

    gl_FragColor = vec4(col, alpha);
  }
`

function NoiseMesh({ intensity = 0.7, accent2Lean = 0.45 }: ShaderNoiseMeshProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  // CSS custom-property colors are not directly readable from the shader;
  // we resolve them once at mount via getComputedStyle, then drop in.
  const [accent, accent2] = useMemo(() => {
    if (typeof window === 'undefined') {
      return [new THREE.Color('#f25a00'), new THREE.Color('#ff8a3d')]
    }
    const root = getComputedStyle(document.documentElement)
    const a = root.getPropertyValue('--color-accent').trim() || '242 90 0'
    const a2 = root.getPropertyValue('--color-accent-2').trim() || '255 138 61'
    const toColor = (rgbTriple: string) => {
      const [r, g, b] = rgbTriple.split(/\s+/).map((n) => parseFloat(n) / 255)
      return new THREE.Color(r, g, b)
    }
    return [toColor(a), toColor(a2)]
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uAccent: { value: accent },
      uAccent2: { value: accent2 },
      uAccent2Lean: { value: accent2Lean },
    }),
    [intensity, accent, accent2, accent2Lean],
  )

  useFrame((state) => {
    if (!matRef.current) return
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh>
      <planeGeometry args={[2.4, 2.4]} />
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={uniforms}
      />
    </mesh>
  )
}

export default function ShaderNoiseMesh({
  intensity = 0.7,
  accent2Lean = 0.45,
}: ShaderNoiseMeshProps) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 1], zoom: 1 }}
      gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      dpr={[1, 2]}
    >
      <NoiseMesh intensity={intensity} accent2Lean={accent2Lean} />
      <Sparkles
        count={42}
        size={3}
        scale={[2.2, 1.4, 1]}
        speed={0.4}
        noise={0.6}
        color="#f25a00"
      />
    </Canvas>
  )
}
