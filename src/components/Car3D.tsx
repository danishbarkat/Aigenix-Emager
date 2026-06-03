import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, ContactShadows } from '@react-three/drei'
import { Box3, Vector3 } from 'three'
import type { Group } from 'three'

function CarModel() {
  const group = useRef<Group>(null)
  const { scene } = useGLTF('/car.glb')

  // compute once, not every render
  const { scale, center } = useMemo(() => {
    const box = new Box3().setFromObject(scene)
    const size = box.getSize(new Vector3())
    const c    = box.getCenter(new Vector3())
    const max  = Math.max(size.x, size.y, size.z)
    return { scale: 2.2 / max, center: c }
  }, [scene])

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.45
  })

  return (
    <group ref={group}>
      <primitive
        object={scene}
        scale={scale}
        position={[
          -center.x * scale,
          -center.y * scale - 0.05,
          -center.z * scale,
        ]}
      />
    </group>
  )
}

export default function Car3D() {
  return (
    <Canvas
      camera={{ position: [0, 1, 4.5], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]}  intensity={1.6} color="#ffffff" />
      <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#A78BFA" />

      <Environment preset="city" />

      <ContactShadows
        position={[0, -0.6, 0]}
        opacity={0.4}
        scale={8}
        blur={3}
        color="#3730A3"
      />

      <Suspense fallback={null}>
        <CarModel />
      </Suspense>
    </Canvas>
  )
}

useGLTF.preload('/car.glb')
