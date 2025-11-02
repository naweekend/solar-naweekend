import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import LofiPlayer from './LofiPlayer';
import EarthAndMoon from './EarthAndMoon';
import Orbit from './Orbit';
import Planet from './Planet';

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

function Saturn({ showOrbit, ref }) {
  const ringTexture = useLoader(THREE.TextureLoader, '/saturn-rings.png');

  return (
    <Planet
      texturePath="/saturn.jpg"
      size={2.5}
      distance={38}
      orbitSpeed={0.08}
      spinSpeed={0.018}
      showOrbit={showOrbit}
      ref={ref} // pass ref here
    >
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3, 5, 128]} />
        <meshBasicMaterial map={ringTexture} side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>
    </Planet>
  );
}


// Camera follow
function CameraFollow({ targetRef, cameraRef, follow }) {
  useFrame(() => {
    if (follow && targetRef.current && cameraRef.current) {
      const pos = new THREE.Vector3();
      targetRef.current.getWorldPosition(pos);

      cameraRef.current.position.lerp(new THREE.Vector3(pos.x + 10, pos.y + 5, pos.z + 10), 0.05);
      cameraRef.current.lookAt(pos);
    }
  });
  return null;
}

export default function App() {
  const [showOrbits, setShowOrbits] = useState(true);
  const [followTarget, setFollowTarget] = useState(null);

  const cameraRef = useRef();
  const earthRef = useRef();
  const mercuryRef = useRef();
  const venusRef = useRef();
  const marsRef = useRef();
  const jupiterRef = useRef();
  const saturnRef = useRef();
  const uranusRef = useRef();
  const neptuneRef = useRef();

  return (
    <div className="w-screen h-screen bg-black relative">
      {/* Floating Top Panel */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-gray-900/80 backdrop-blur-md p-3 rounded-xl shadow-lg text-white">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            className="checkbox checkbox-sm checkbox-primary"
            checked={showOrbits}
            onChange={() => setShowOrbits(!showOrbits)}
          />
          Show Orbits
        </label>

        {/* Planet buttons */}
        <div className="flex gap-1">
          <button className="btn btn-xs btn-outline" onClick={() => setFollowTarget(mercuryRef)}>Mercury</button>
          <button className="btn btn-xs btn-outline" onClick={() => setFollowTarget(venusRef)}>Venus</button>
          <button className="btn btn-xs btn-outline" onClick={() => setFollowTarget(earthRef)}>Earth</button>
          <button className="btn btn-xs btn-outline" onClick={() => setFollowTarget(marsRef)}>Mars</button>
          <button className="btn btn-xs btn-outline" onClick={() => setFollowTarget(jupiterRef)}>Jupiter</button>
          <button className="btn btn-xs btn-outline" onClick={() => setFollowTarget(saturnRef)}>Saturn</button>
          <button className="btn btn-xs btn-outline" onClick={() => setFollowTarget(uranusRef)}>Uranus</button>
          <button className="btn btn-xs btn-outline" onClick={() => setFollowTarget(neptuneRef)}>Neptune</button>
          <button className="btn btn-xs btn-outline" onClick={() => setFollowTarget(null)}>Stop</button>
        </div>
      </div>

      <Canvas
        camera={{ position: [0, 40, 80], fov: 60 }}
        onCreated={({ camera }) => (cameraRef.current = camera)}
      >
        <color attach="background" args={[0x000000]} />
        <Background />
        <ambientLight intensity={0.4} color={0x222233} />
        <Sun />

        <Planet texturePath="/mercury.jpg" size={0.5} distance={8} orbitSpeed={0.6} spinSpeed={0.01} showOrbit={showOrbits} ref={mercuryRef} />
        <Planet texturePath="/venus.jpg" size={1} distance={12} orbitSpeed={0.5} spinSpeed={0.008} showOrbit={showOrbits} ref={venusRef} />
        <EarthAndMoon showOrbit={showOrbits} ref={earthRef} />
        <Planet texturePath="/mars.jpg" size={0.8} distance={20} orbitSpeed={0.18} spinSpeed={0.015} showOrbit={showOrbits} ref={marsRef} />
        <Planet texturePath="/jupiter.jpg" size={3} distance={28} orbitSpeed={0.1} spinSpeed={0.02} showOrbit={showOrbits} ref={jupiterRef} />
        <Saturn showOrbit={showOrbits} ref={saturnRef} />
        <Planet texturePath="/uranus.jpg" size={2} distance={48} orbitSpeed={0.05} spinSpeed={0.012} showOrbit={showOrbits} ref={uranusRef} />
        <Planet texturePath="/neptune.jpg" size={2} distance={58} orbitSpeed={0.03} spinSpeed={0.01} showOrbit={showOrbits} ref={neptuneRef} />


        <CameraFollow targetRef={followTarget} cameraRef={cameraRef} follow={!!followTarget} />
        <OrbitControls enableDamping enablePan minDistance={20} maxDistance={300} />
      </Canvas>

      <LofiPlayer />
    </div>
  );
}
