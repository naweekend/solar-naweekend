import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import LofiPlayer from './LofiPlayer';

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

// 🪐 Orbit visualization
function Orbit({ radius }) {
  const points = [];
  const segments = 128;
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * 2 * Math.PI;
    points.push(new THREE.Vector3(radius * Math.cos(theta), 0, radius * Math.sin(theta)));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });

  return <line geometry={geometry} material={material} />;
}

// 🌍 Generic planet
function Planet({ texturePath, size, distance, orbitSpeed, spinSpeed, showOrbit, children }) {
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
      {showOrbit && <Orbit radius={distance} />}
      <group position={[distance, 0, 0]}>
        <mesh ref={planetRef}>
          <sphereGeometry args={[size, 64, 64]} />
          <meshStandardMaterial map={texture} roughness={1} />
        </mesh>
        {children}
      </group>
    </group>
  );
}

// 🌍 Earth + 🌙 Moon combo
function EarthAndMoon({ showOrbit }) {
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
      {showOrbit && <Orbit radius={16} />}
      <group position={[16, 0, 0]}>
        <mesh ref={earthRef}>
          <sphereGeometry args={[1.2, 64, 64]} />
          <meshStandardMaterial map={earthTexture} roughness={1} />
        </mesh>

        <group ref={moonOrbitRef}>
          {showOrbit && <Orbit radius={2} />}
          <mesh position={[2, 0, 0]}>
            <sphereGeometry args={[0.4, 64, 64]} />
            <meshStandardMaterial map={moonTexture} roughness={1} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// 🪐 Saturn with Rings
function Saturn({ showOrbit }) {
  const ringTexture = useLoader(THREE.TextureLoader, '/saturn-rings.png');

  return (
    <Planet
      texturePath="/saturn.jpg"
      size={2.5}
      distance={38}
      orbitSpeed={0.08}
      spinSpeed={0.018}
      showOrbit={showOrbit}
    >
      {/* Saturn Rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3, 5, 128]} />
        <meshBasicMaterial
          map={ringTexture}
          side={THREE.DoubleSide}
          transparent={true}
          opacity={0.9}
        />
      </mesh>
    </Planet>
  );
}

export default function App() {
  const [showOrbits, setShowOrbits] = useState(true);

  return (
    <div className="w-screen h-screen bg-black relative">
      {/* Checkbox UI */}
      <div className="absolute top-5 left-5 z-10">
        <label className="flex items-center gap-2 text-white">
          <input
            type="checkbox"
            className="checkbox checkbox-sm checkbox-primary"
            checked={showOrbits}
            onChange={() => setShowOrbits(!showOrbits)}
          />
          Show Orbits
        </label>
      </div>

      <Canvas camera={{ position: [0, 40, 80], fov: 60 }}>
        <color attach="background" args={[0x000000]} />
        <Background />

        <ambientLight intensity={0.4} color={0x222233} />
        <Sun />

        {/* Planets */}
        <Planet texturePath="/mercury.jpg" size={0.5} distance={8} orbitSpeed={0.6} spinSpeed={0.01} showOrbit={showOrbits} />
        <Planet texturePath="/venus.jpg" size={1} distance={12} orbitSpeed={0.5} spinSpeed={0.008} showOrbit={showOrbits} />
        <EarthAndMoon showOrbit={showOrbits} />
        <Planet texturePath="/mars.jpg" size={0.8} distance={20} orbitSpeed={0.18} spinSpeed={0.015} showOrbit={showOrbits} />
        <Planet texturePath="/jupiter.jpg" size={3} distance={28} orbitSpeed={0.1} spinSpeed={0.02} showOrbit={showOrbits} />
        <Saturn showOrbit={showOrbits} />
        <Planet texturePath="/uranus.jpg" size={2} distance={48} orbitSpeed={0.05} spinSpeed={0.012} showOrbit={showOrbits} />
        <Planet texturePath="/neptune.jpg" size={2} distance={58} orbitSpeed={0.03} spinSpeed={0.01} showOrbit={showOrbits} />

        <OrbitControls enableDamping enablePan minDistance={20} maxDistance={300} />
      </Canvas>

      <LofiPlayer />
    </div>
  );
}
