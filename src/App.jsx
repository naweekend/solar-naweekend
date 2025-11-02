import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import LofiPlayer from './LofiPlayer';
import EarthAndMoon from './EarthAndMoon';
import Orbit from './Orbit';
import Planet from './Planet';
import { StopCircleIcon } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

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
      ref={ref}
    >
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3, 5, 128]} />
        <meshBasicMaterial map={ringTexture} side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>
    </Planet>
  );
}

// Camera follow & smooth zoom out
function CameraFollow({ targetRef, cameraRef, follow, zoomOut, setZoomOut }) {
  const defaultPos = new THREE.Vector3(0, 40, 80);
  const defaultLookAt = new THREE.Vector3(0, 0, 0);

  useFrame(() => {
    if (!cameraRef.current) return;

    if (follow && targetRef?.current) {
      // Follow a planet
      const pos = new THREE.Vector3();
      targetRef.current.getWorldPosition(pos);

      cameraRef.current.position.lerp(new THREE.Vector3(pos.x + 10, pos.y + 5, pos.z + 10), 0.05);
      cameraRef.current.lookAt(pos);
    } else if (zoomOut) {
      // Smooth zoom-out
      cameraRef.current.position.lerp(defaultPos, 0.05);
      cameraRef.current.lookAt(defaultLookAt);

      if (cameraRef.current.position.distanceTo(defaultPos) < 0.1) {
        setZoomOut(false);
      }
    }
    // ELSE do nothing, OrbitControls is free
  });
}

export default function App() {
  const [showOrbits, setShowOrbits] = useState(true);
  const [followTarget, setFollowTarget] = useState(null);
  const [zoomOut, setZoomOut] = useState(false);

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
    <>
      <Toaster />
      <div className="w-screen h-screen bg-black relative">
        {/* Floating Top Panel */}
        <div className="absolute top-5 left-5 sm:w-100 w-[calc(100vw-2.5rem)] z-20 flex flex-col gap-3 bg-base-200 backdrop-blur-md p-4 rounded-xl shadow-lg text-base-content">
          {/* Heading */}
          <h2 className="text-xs font-semibold opacity-80 -mb-1 uppercase">CLICK A PLANET TO FOLLOW IT</h2>

          {/* Planet Buttons */}
          <div className="flex flex-wrap gap-1">
            {[
              { name: 'mercury', ref: mercuryRef },
              { name: 'venus', ref: venusRef },
              { name: 'earth', ref: earthRef },
              { name: 'mars', ref: marsRef },
              { name: 'jupiter', ref: jupiterRef },
              { name: 'saturn', ref: saturnRef },
              { name: 'uranus', ref: uranusRef },
              { name: 'neptune', ref: neptuneRef },
            ].map((planet) => (
              <button
                key={planet.name}
                className="btn hover:bg-neutral btn-base-300 active:scale-95 transition-all duration-250 btn-xs btn-square flex items-center justify-center"
                onClick={() => {
                  setFollowTarget(planet.ref);
                  toast.success(`Following ${planet.name.charAt(0).toUpperCase() + planet.name.slice(1)}`);
                  setZoomOut(false);
                }}
              >
                <img src={`/planets/${planet.name}.png`} alt={planet.name} width={30} height={30} />
              </button>
            ))}

            {/* Stop Following */}
            <button
              className="btn btn-xs btn-error flex items-center justify-center gap-1"
              onClick={() => {
                setFollowTarget(null);
                toast.success('Stopped Following');
                setZoomOut(true);
              }}
            >
              <StopCircleIcon size={13} /> Stop Following
            </button>
          </div>


          <h2 className='text-xs font-semibold opacity-80 -mb-1 uppercase mt-2'>SETTINGS</h2>
          {/* Show Orbits */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 w-full justify-between text-sm cursor-pointer">
              <span>Show Orbits</span>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-xs"
                checked={showOrbits}
                onChange={() => setShowOrbits(!showOrbits)}
              />
            </label>
          </div>

          {/* Theme Change */}
          <div className="flex items-center justify-between -mt-1">
            <label className="flex items-center gap-2 w-full justify-between text-sm cursor-pointer">
              <span>Light Mode</span>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-xs theme-controller"
                value="autumn"
              />
            </label>
          </div>
        </div>
        {/* Floating Top Panel END */}

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

          <CameraFollow targetRef={followTarget} cameraRef={cameraRef} follow={!!followTarget} zoomOut={zoomOut} setZoomOut={setZoomOut} />
          <OrbitControls enableDamping enablePan minDistance={20} maxDistance={300} />
        </Canvas>

        <LofiPlayer />
      </div>
    </>
  );
}
