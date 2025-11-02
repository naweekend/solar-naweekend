import { forwardRef, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import Orbit from './Orbit';

const Planet = forwardRef(
  ({ texturePath, size, distance, orbitSpeed, spinSpeed, showOrbit, children }, ref) => {
    const orbitRef = useRef();
    const localRef = useRef();
    const texture = useLoader(THREE.TextureLoader, texturePath);

    useFrame(({ clock }) => {
      const t = clock.getElapsedTime();
      orbitRef.current.rotation.y = t * orbitSpeed;
      localRef.current.rotation.y += spinSpeed;
    });

    // expose mesh to parent via ref
    if (ref) ref.current = localRef.current;

    return (
      <group ref={orbitRef}>
        {showOrbit && <Orbit radius={distance} />}
        <group position={[distance, 0, 0]}>
          <mesh ref={localRef}>
            <sphereGeometry args={[size, 64, 64]} />
            <meshStandardMaterial map={texture} roughness={1} />
          </mesh>
          {children}
        </group>
      </group>
    );
  }
);

export default Planet;
