'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import dynamic from 'next/dynamic'
import * as THREE from 'three'
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber'
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'

// Extend the fiber namespace with MeshLine components
extend({ MeshLineGeometry, MeshLineMaterial })

// Declare module for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: any
      meshLineMaterial: any
    }
  }
}

// Type definitions
interface BandProps {
  maxSpeed?: number
  minSpeed?: number
}

// Import Rapier components with SSR disabled
const Physics = dynamic(
  () => import('@react-three/rapier').then((mod) => mod.Physics),
  { ssr: false }
) as any

const RigidBody = dynamic(
  () => import('@react-three/rapier').then((mod) => mod.RigidBody),
  { ssr: false }
) as any

const BallCollider = dynamic(
  () => import('@react-three/rapier').then((mod) => mod.BallCollider),
  { ssr: false }
) as any

const CuboidCollider = dynamic(
  () => import('@react-three/rapier').then((mod) => mod.CuboidCollider),
  { ssr: false }
) as any

const useRopeJoint = (
  ...args: Parameters<typeof import('@react-three/rapier').useRopeJoint>
) => {
  const rapier = require('@react-three/rapier')
  return rapier.useRopeJoint(...args)
}

const useSphericalJoint = (
  ...args: Parameters<typeof import('@react-three/rapier').useSphericalJoint>
) => {
  const rapier = require('@react-three/rapier')
  return rapier.useSphericalJoint(...args)
}

// Preload assets
useGLTF.preload('/assets/tag.glb')
useTexture.preload('/assets/band.jpg')

const InteractiveCard3DContent = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div style={{ 
        width: '50vw', 
        height: '90vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'black'
      }}>
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ width: '50vw', height: '90vh', borderRadius: '5%', overflow: 'hidden', borderTop: 'solid 5px #f1f1' }}>
      <Canvas camera={{ position: [0, 0, 13], fov: 25 }}>
        <ambientLight intensity={Math.PI} />
        <Physics debug={false} interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
          <Band />
        </Physics>
        <Environment blur={0.75}>
          <color attach="background" args={['black']} />
          <Lightformer 
            intensity={2} 
            color="white" 
            position={[0, -1, 5]} 
            rotation={[0, 0, Math.PI / 3]} 
            scale={[100, 0.1, 1]} 
          />
          <Lightformer 
            intensity={3} 
            color="white" 
            position={[-1, -1, 1]} 
            rotation={[0, 0, Math.PI / 3]} 
            scale={[100, 0.1, 1]} 
          />
          <Lightformer 
            intensity={3} 
            color="white" 
            position={[1, 1, 1]} 
            rotation={[0, 0, Math.PI / 3]} 
            scale={[100, 0.1, 1]} 
          />
          <Lightformer 
            intensity={10} 
            color="indigo" 
            position={[-10, 0, 14]} 
            rotation={[0, Math.PI / 2, Math.PI / 3]} 
            scale={[100, 10, 1]} 
          />
        </Environment>
      </Canvas>
    </div>
  )
}

export default function InteractiveCard3D() {
  return (
    <Suspense fallback={
      <div style={{ 
        width: '50vw', 
        height: '90vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'black'
      }}>
        <div className="loading-spinner">Loading...</div>
      </div>
    }>
      <InteractiveCard3DContent />
    </Suspense>
  )
}

function Band({ maxSpeed = 50, minSpeed = 10 }: BandProps) {
  const band = useRef<THREE.Mesh>(null)
  const fixed = useRef<any>(null)
  const j1 = useRef<any>(null)
  const j2 = useRef<any>(null)
  const j3 = useRef<any>(null)
  const card = useRef<any>(null)

  const vec = new THREE.Vector3()
  const ang = new THREE.Vector3()
  const rot = new THREE.Vector3()
  const dir = new THREE.Vector3()

  const segmentProps = { 
    type: 'dynamic' as const, 
    canSleep: true, 
    angularDamping: 2, 
    linearDamping: 2 
  }

  const { nodes, materials } = useGLTF('/assets/tag.glb') as any
  const texture = useTexture('/assets/band.jpg')
  const { width, height } = useThree((state) => state.size)
  
  const [curve] = useState(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(), 
    new THREE.Vector3(), 
    new THREE.Vector3(), 
    new THREE.Vector3()
  ]))
  
  const [dragged, drag] = useState<THREE.Vector3 | false>(false)
  const [hovered, hover] = useState<boolean>(false)

  // Rope joints connecting the segments
  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]])

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab'
      return () => {
        document.body.style.cursor = 'auto'
      }
    }
  }, [hovered, dragged])

  useFrame((state, delta) => {
    if (dragged && card.current) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      
      // Wake up all rigid bodies
      ;[card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp())
      
      card.current.setNextKinematicTranslation({ 
        x: vec.x - dragged.x, 
        y: vec.y - dragged.y, 
        z: vec.z - dragged.z 
      })
    }

    if (fixed.current && j1.current && j2.current && j3.current && card.current) {
      // Fix most of the jitter when over pulling the card
      ;[j1, j2].forEach((ref) => {
        if (ref.current && !ref.current.lerped) {
          ref.current.lerped = new THREE.Vector3().copy(ref.current.translation())
        }
        if (ref.current && ref.current.lerped) {
          const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())))
          ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)))
        }
      })

      // Calculate catmull curve
      curve.points[0].copy(j3.current.translation())
      curve.points[1].copy(j2.current.lerped || j2.current.translation())
      curve.points[2].copy(j1.current.lerped || j1.current.translation())
      curve.points[3].copy(fixed.current.translation())
      
      if (band.current?.geometry && (band.current.geometry as any).setPoints) {
        (band.current.geometry as any).setPoints(curve.getPoints(32))
      }

      // Tilt it back towards the screen
      ang.copy(card.current.angvel())
      rot.copy(card.current.rotation())
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
    }
  })

  curve.curveType = 'chordal'
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping

  const handlePointerDown = (e: any) => {
    e.target.setPointerCapture(e.pointerId)
    if (card.current) {
      drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
    }
  }

  const handlePointerUp = (e: any) => {
    e.target.releasePointerCapture(e.pointerId)
    drag(false)
  }

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody 
          position={[2, 0, 0]} 
          ref={card} 
          {...segmentProps} 
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={handlePointerUp}
            onPointerDown={handlePointerDown}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial 
                map={materials.base.map} 
                map-anisotropy={16} 
                clearcoat={1} 
                clearcoatRoughness={0.15} 
                roughness={0.3} 
                metalness={0.5} 
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial 
          color="white" 
          depthTest={false} 
          resolution={[width, height]} 
          useMap 
          map={texture} 
          repeat={[-3, 1]} 
          lineWidth={1} 
        />
      </mesh>
    </>
  )
}