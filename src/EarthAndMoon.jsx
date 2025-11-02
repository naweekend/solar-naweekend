import { forwardRef, useRef, useEffect } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Orbit from './Orbit'; // Orbit component moved to its own file

const EarthAndMoon = forwardRef(({ showOrbit }, ref) => {
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

  useEffect(() => {
    if (!ref) return;
    ref.current = earthRef.current;
  }, []);

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
});

export default EarthAndMoon;
