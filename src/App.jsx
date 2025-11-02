import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import LofiPlayer from './LofiPlayer';
import EarthAndMoon from './EarthAndMoon';
import Orbit from './Orbit';

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

  useFrame(() => {
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

// 🪐 Saturn
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
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3, 5, 128]} />
        <meshBasicMaterial map={ringTexture} side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>
    </Planet>
  );
}

// Camera follow
function CameraFollow({ earthRef, cameraRef, followEarth }) {
  useFrame(() => {
    if (followEarth && earthRef.current && cameraRef.current) {
      const earthPos = new THREE.Vector3();
      earthRef.current.getWorldPosition(earthPos);

      // Smooth follow
      cameraRef.current.position.lerp(
        new THREE.Vector3(earthPos.x + 10, earthPos.y + 5, earthPos.z + 10),
        0.05
      );

      cameraRef.current.lookAt(earthPos);
    }
  });
  return null;
}

export default function App() {
  const [showOrbits, setShowOrbits] = useState(true);
  const [followEarth, setFollowEarth] = useState(false);

  const cameraRef = useRef();
  const earthRef = useRef();

  return (
    <div className="w-screen h-screen bg-black relative">
      {/* UI */}
      <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
        <label className="flex items-center gap-2 text-white">
          <input
            type="checkbox"
            className="checkbox checkbox-sm checkbox-primary"
            checked={showOrbits}
            onChange={() => setShowOrbits(!showOrbits)}
          />
          Show Orbits
        </label>

        <button
          className="btn btn-xs btn-primary mt-2"
          onClick={() => setFollowEarth(!followEarth)}
        >
          {followEarth ? 'Stop Following Earth' : 'Follow Earth'}
        </button>
      </div>

      <Canvas
        camera={{ position: [0, 40, 80], fov: 60 }}
        onCreated={({ camera }) => {
          cameraRef.current = camera;
        }}
      >
        <color attach="background" args={[0x000000]} />
        <Background />
        <ambientLight intensity={0.4} color={0x222233} />
        <Sun />

        <Planet texturePath="/mercury.jpg" size={0.5} distance={8} orbitSpeed={0.6} spinSpeed={0.01} showOrbit={showOrbits} />
        <Planet texturePath="/venus.jpg" size={1} distance={12} orbitSpeed={0.5} spinSpeed={0.008} showOrbit={showOrbits} />
        <EarthAndMoon showOrbit={showOrbits} ref={earthRef} />
        <Planet texturePath="/mars.jpg" size={0.8} distance={20} orbitSpeed={0.18} spinSpeed={0.015} showOrbit={showOrbits} />
        <Planet texturePath="/jupiter.jpg" size={3} distance={28} orbitSpeed={0.1} spinSpeed={0.02} showOrbit={showOrbits} />
        <Saturn showOrbit={showOrbits} />
        <Planet texturePath="/uranus.jpg" size={2} distance={48} orbitSpeed={0.05} spinSpeed={0.012} showOrbit={showOrbits} />
        <Planet texturePath="/neptune.jpg" size={2} distance={58} orbitSpeed={0.03} spinSpeed={0.01} showOrbit={showOrbits} />

        <CameraFollow earthRef={earthRef} cameraRef={cameraRef} followEarth={followEarth} />
        <OrbitControls enableDamping enablePan minDistance={20} maxDistance={300} />
      </Canvas>

      <LofiPlayer />
    </div>
  );
}
