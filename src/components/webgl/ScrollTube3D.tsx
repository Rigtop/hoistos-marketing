import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

type Props = {
  /** Image URLs. Repeats around the tube. Min 4 recommended. */
  images: string[]
  /** Tube radius. Default 3. */
  radius?: number
  /** Camera FOV. Default 60. */
  fov?: number
  className?: string
}

function Tube({ images, radius = 3 }: { images: string[]; radius?: number }) {
  const groupRef = useRef<THREE.Group>(null!)
  const planes = useMemo(() => {
    const arr: { src: string; angle: number; y: number }[] = []
    const total = Math.max(images.length, 8)
    const layers = 4
    for (let layer = 0; layer < layers; layer++) {
      for (let i = 0; i < total; i++) {
        arr.push({
          src: images[(layer * total + i) % images.length],
          angle: (i / total) * Math.PI * 2 + (layer % 2) * (Math.PI / total),
          y: layer * 2.6 - layers * 1.3,
        })
      }
    }
    return arr
  }, [images])

  useFrame((state) => {
    if (!groupRef.current) return
    const scroll = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    groupRef.current.rotation.y = scroll * Math.PI * 4
    groupRef.current.position.y = -scroll * 8 + 2
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05
  })

  return (
    <group ref={groupRef}>
      {planes.map((p, i) => {
        const x = Math.cos(p.angle) * radius
        const z = Math.sin(p.angle) * radius
        return (
          <ImagePlane key={i} src={p.src} position={[x, p.y, z]} lookAt={[0, p.y, 0]} />
        )
      })}
    </group>
  )
}

function ImagePlane({ src, position, lookAt }: { src: string; position: [number, number, number]; lookAt: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null!)
  const texture = useMemo(() => {
    const t = new THREE.TextureLoader().load(src)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [src])

  useFrame(() => {
    if (!ref.current) return
    ref.current.lookAt(...lookAt)
  })

  return (
    <mesh ref={ref} position={position}>
      <planeGeometry args={[1.6, 1]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  )
}

/**
 * ScrollTube3D: scroll-driven 3D image tube.
 *
 * Codrops Feb 2026 "Reactive Depth: Building a Scroll-Driven 3D Image Tube"
 * pattern. Images orbit a vertical axis, scroll position rotates and descends
 * the tube. R3F + Three.js. Use as a hero, portfolio reel, or product gallery.
 *
 * Drop into a tall section (e.g., 200vh) so there's scroll runway.
 */
export function ScrollTube3D({ images, radius = 3, fov = 60, className = '' }: Props) {
  return (
    <div className={`absolute inset-0 ${className}`} aria-hidden>
      <Canvas camera={{ position: [0, 0, radius * 1.8], fov }} dpr={[1, 2]}>
        <ambientLight intensity={1} />
        <Tube images={images} radius={radius} />
      </Canvas>
    </div>
  )
}
