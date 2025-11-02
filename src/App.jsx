import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

// 🌌 Space background
function Background() {
  const texture = useLoader(THREE.TextureLoader, '/space.jpg');
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[400, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

// ☀️ Sun
function Sun() {
  const sunRef = useRef();
  const sunTexture = useLoader(THREE.TextureLoader, '/sun.jpg');

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    sunRef.current.rotation.y += 0.001;
    sunRef.current.scale.setScalar(1 + 0.05 * Math.sin(t * 2));
  });

  return (
    <>
      <mesh ref={sunRef}>
        <sphereGeometry args={[4, 64, 64]} />
        <meshBasicMaterial map={sunTexture} />
      </mesh>
      <pointLight intensity={250} distance={800} decay={1} />
    </>
  );
}

// 🌍 Generic planet
function Planet({ texturePath, size, distance, orbitSpeed, spinSpeed }) {
  const orbitRef = useRef();
  const planetRef = useRef();
  const texture = useLoader(THREE.TextureLoader, texturePath);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    orbitRef.current.rotation.y = t * orbitSpeed;
    planetRef.current.rotation.y += spinSpeed;
  });

  return (
    <group ref={orbitRef}>
      <mesh ref={planetRef} position={[distance, 0, 0]}>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial map={texture} roughness={1} />
      </mesh>
    </group>
  );
}

// 🌍 Earth + 🌙 Moon combo
function EarthAndMoon() {
  const earthOrbitRef = useRef();
  const moonOrbitRef = useRef();
  const earthRef = useRef();

  const earthTexture = useLoader(THREE.TextureLoader, '/earth.jpg');
  const moonTexture = useLoader(THREE.TextureLoader, '/moon.jpg');

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    earthOrbitRef.current.rotation.y = t * 0.2;
    earthRef.current.rotation.y = t * 1.5;
    moonOrbitRef.current.rotation.y = t * 1.2;
  });

  return (
    <group ref={earthOrbitRef}>
      <group position={[16, 0, 0]}>
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
      <Canvas camera={{ position: [0, 40, 80], fov: 60 }}>
        <color attach="background" args={[0x000000]} />
        <Background />

        <ambientLight intensity={0.4} color={0x222233} />
        <Sun />

        {/* 🪐 Planets */}
        <Planet texturePath="/mercury.jpg" size={0.5} distance={8} orbitSpeed={0.6} spinSpeed={0.01} />
        <Planet texturePath="/venus.jpg" size={1} distance={12} orbitSpeed={0.5} spinSpeed={0.008} />
        <EarthAndMoon />
        <Planet texturePath="/mars.jpg" size={0.8} distance={20} orbitSpeed={0.18} spinSpeed={0.015} />
        <Planet texturePath="/jupiter.jpg" size={3} distance={28} orbitSpeed={0.1} spinSpeed={0.02} />
        <Planet texturePath="/saturn.jpg" size={2.5} distance={38} orbitSpeed={0.08} spinSpeed={0.018} />
        <Planet texturePath="/uranus.jpg" size={2} distance={48} orbitSpeed={0.05} spinSpeed={0.012} />
        <Planet texturePath="/neptune.jpg" size={2} distance={58} orbitSpeed={0.03} spinSpeed={0.01} />

        <OrbitControls enableDamping minDistance={20} maxDistance={300} />
      </Canvas>
    </div>
  );
}
