import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const DNAHelix = () => {
  const groupRef = useRef();
  const helixRef = useRef();
  const timeRef = useRef(0); // Add time ref for animation

  useFrame(() => {
    // Update time ref
    timeRef.current = Date.now();
    
    if (helixRef.current) {
      helixRef.current.rotation.z += 0.008;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
      groupRef.current.position.y = Math.sin(Date.now() * 0.0005) * 0.8;
    }
  });

  const helixPoints = 100;
  const helixRadius = 2.2;
  const helixHeight = 12;

  // Create DNA strands
  const createStrand = (offset = 0) => {
    const points = [];
    for (let i = 0; i < helixPoints; i++) {
      const angle = (i / helixPoints) * Math.PI * 4;
      const x = Math.cos(angle + offset) * helixRadius;
      const y = (i / helixPoints) * helixHeight - helixHeight / 2;
      const z = Math.sin(angle + offset) * helixRadius;
      points.push(new THREE.Vector3(x, y, z));
    }
    return points;
  };

  const strand1Points = createStrand(0);
  const strand2Points = createStrand(Math.PI);

  return (
    <group ref={groupRef} scale={1.2}>
      <group ref={helixRef}>
        {/* First DNA Strand - Cyan/Blue (Real DNA Color) */}
        <mesh>
          <tubeGeometry
            args={[new THREE.CatmullRomCurve3(strand1Points), 50, 0.35, 8]}
          />
          <meshStandardMaterial
            color="#0891b2"
            emissive="#06b6d4"
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>

        {/* Second DNA Strand - Teal/Blue-Green (Real DNA Color) */}
        <mesh>
          <tubeGeometry
            args={[new THREE.CatmullRomCurve3(strand2Points), 50, 0.35, 8]}
          />
          <meshStandardMaterial
            color="#0d9488"
            emissive="#14b8a6"
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>

        {/* Base pairs connecting the strands */}
        {Array.from({ length: helixPoints - 1 }).map((_, i) => {
          const p1 = strand1Points[i];
          const p2 = strand2Points[i];
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          const midZ = (p1.z + p2.z) / 2;

          // Real DNA base pair colors
          const baseColors = [
            '#3b82f6', // Blue - Adenine
            '#8b5cf6', // Purple - Guanine
            '#06b6d4', // Cyan - Thymine
            '#10b981', // Green - Cytosine
          ];
          const pairColor = baseColors[i % 4];

          return (
            <group key={`base-pair-${i}`}>
              {/* Connecting line between strands */}
              <line>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    count={2}
                    array={new Float32Array([p1.x, p1.y, p1.z, p2.x, p2.y, p2.z])}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial color={pairColor} linewidth={2} />
              </line>

              {/* Spheres at connection points - Real DNA base pair nucleotides */}
              {i % 3 === 0 && (
                <mesh position={[midX, midY, midZ]}>
                  <sphereGeometry args={[0.25, 16, 16]} />
                  <meshStandardMaterial
                    color={pairColor}
                    emissive={pairColor}
                    metalness={0.8}
                    roughness={0.15}
                  />
                </mesh>
              )}
            </group>
          );
        })}

        {/* Orbiting energy particles */}
        <OrbitingParticles timeRef={timeRef} />
      </group>

      {/* Glow effect particles along the helix */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const yPos = (i / 6) * helixHeight - helixHeight / 2;
        const angle = (i / 6) * Math.PI * 2;
        const radius = 3.2;
        const glowColors = ['#06b6d4', '#0d9488', '#3b82f6', '#8b5cf6', '#10b981', '#14b8a6'];
        return (
          <mesh key={`glow-${i}`} position={[Math.cos(angle) * radius, yPos, Math.sin(angle) * radius]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial
              color={glowColors[i]}
              emissive={glowColors[i]}
              metalness={0.95}
              roughness={0.05}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// Separate component for orbiting particles to handle animation properly
const OrbitingParticles = ({ timeRef }) => {
  const particlesRef = useRef([]);

  useFrame(() => {
    particlesRef.current.forEach((particle, i) => {
      if (particle) {
        const angle = (i / 5) * Math.PI * 2 + timeRef.current * 0.0008;
        const orbitRadius = 4.2;
        const x = Math.cos(angle) * orbitRadius;
        const z = Math.sin(angle) * orbitRadius;
        particle.position.set(x, 0, z);
      }
    });
  });

  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={`orbit-${i}`}
          ref={(el) => (particlesRef.current[i] = el)}
        >
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#1e40af"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      ))}
    </>
  );
};

const Doctor3D = () => {
  return (
    <div className='absolute inset-0 w-full h-full'>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 12]} />
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 5, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -5, 10]} intensity={1} color="#7c3aed" />
        <pointLight position={[0, 0, 8]} intensity={0.8} color="#06b6d4" />
        <pointLight position={[5, -5, -10]} intensity={0.6} color="#fbbf24" />
        <DNAHelix />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
      </Canvas>
    </div>
  );
};

export default Doctor3D;
