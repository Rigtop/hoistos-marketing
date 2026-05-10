import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

function Blob({ position, color, distort = 0.4, speed = 1 }: {
  position: [number, number, number]
  color: string
  distort?: number
  speed?: number
}) {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.x = state.clock.elapsedTime * 0.15 * speed
    ref.current.rotation.y = state.clock.elapsedTime * 0.2 * speed
  })

  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={ref} position={position}>
        <icosahedronGeometry args={[1.2, 8]} />
        <MeshDistortMaterial
          color={color}
          distort={distort}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  )
}

/**
 * FloatingGeometry — R3F scene with three floating distorted icosahedrons.
 * Theme-aware: pulls accent + accent-2 + bg from CSS vars at mount time.
 * Drop inside a positioned container (relative). Set its height/width.
 */
export function FloatingGeometry({ className = '' }: { className?: string }) {
  // Read theme colors at render. Three.js needs hex/rgb strings.
  const styles = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : null
  const accent = styles ? `rgb(${styles.getPropertyValue('--color-accent').trim()})` : '#F25A00'
  const accent2 = styles ? `rgb(${styles.getPropertyValue('--color-accent-2').trim()})` : '#FF8A3D'
  const subtle = styles ? `rgb(${styles.getPropertyValue('--color-fg-subtle').trim()})` : '#6B8090'

  return (
    <div className={`absolute inset-0 ${className}`} aria-hidden>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, -5]} intensity={0.4} color={accent2} />
        <Blob position={[-2.6, 0.8, 0]} color={accent} distort={0.45} speed={0.9} />
        <Blob position={[2.4, -0.6, -1]} color={accent2} distort={0.35} speed={1.1} />
        <Blob position={[0.2, 1.8, -2]} color={subtle} distort={0.55} speed={0.7} />
        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
