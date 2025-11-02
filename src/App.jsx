import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function Background() {
  const texture = useLoader(THREE.TextureLoader, '/space.jpg');
  return (
    <mesh scale={[-1, 1, 1]}>
      {/* A giant sphere turned inside out */}
      <sphereGeometry args={[200, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

function Sun() {
  const sunRef = useRef();
  const sunTexture = useLoader(THREE.TextureLoader, '/sun.jpg');

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    sunRef.current.scale.setScalar(1 + 0.05 * Math.sin(t * 2));
    sunRef.current.rotation.y += 0.001;
  });

  return (
    <>
      <mesh ref={sunRef}>
        <sphereGeometry args={[3, 64, 64]} />
        <meshBasicMaterial map={sunTexture} />
      </mesh>
      <pointLight intensity={100} distance={300} decay={1} />
    </>
  );
}

function EarthAndMoon() {
  const earthOrbitRef = useRef();
  const moonOrbitRef = useRef();
  const earthRef = useRef();

  const earthTexture = useLoader(THREE.TextureLoader, '/earth.jpg');
  const moonTexture = useLoader(THREE.TextureLoader, '/moon.jpg');

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    earthOrbitRef.current.rotation.y = t * 0.2; // orbit around Sun
    earthRef.current.rotation.y = t * 1.5; // spin
    moonOrbitRef.current.rotation.y = t * 1.2; // moon orbit
  });

  return (
    <group ref={earthOrbitRef}>
      <group position={[8, 0, 0]}>
        <mesh ref={earthRef}>
          <sphereGeometry args={[1.2, 64, 64]} />
          <meshStandardMaterial map={earthTexture} roughness={1} />
        </mesh>

        <group ref={moonOrbitRef}>
          <mesh position={[2, 0, 0]}>
            <sphereGeometry args={[0.4, 64, 64]} />
            <meshStandardMaterial map={moonTexture} roughness={1} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }}>
      <Canvas camera={{ position: [0, 15, 35], fov: 60 }}>
        {/* Background space texture */}
        <Background />

        <ambientLight intensity={0.4} color={0x222233} />
        <Sun />
        <EarthAndMoon />
        <OrbitControls enableDamping minDistance={10} maxDistance={200} />
      </Canvas>
    </div>
  );
}
