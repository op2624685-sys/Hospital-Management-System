import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const DNAHelix = () => {
  const groupRef = useRef();
  const helixRef = useRef();
  const backboneARef = useRef();
  const backboneAGlowRef = useRef();
  const backboneBRef = useRef();
  const backboneBGlowRef = useRef();
  const backboneAMaterialRef = useRef();
  const backboneAGlowMaterialRef = useRef();
  const backboneBMaterialRef = useRef();
  const backboneBGlowMaterialRef = useRef();
  const basePairRef = useRef();
  const basePairMaterialRef = useRef();
  const redSpeckMaterialRef = useRef();
  const haloMaterialRef = useRef();
  const haloRef = useRef();
  const bokehRef = useRef();

  const helixPoints = 520;
  const helixRadius = 2.15;
  const helixHeight = 12.5;
  const basePairCount = 70;

  const helixData = useMemo(() => {
    const angles = new Float32Array(helixPoints);
    const heights = new Float32Array(helixPoints);
    for (let i = 0; i < helixPoints; i++) {
      angles[i] = (i / helixPoints) * Math.PI * 8;
      heights[i] = (i / helixPoints) * helixHeight - helixHeight / 2;
    }
    return { angles, heights };
  }, []);

  const basePairData = useMemo(() => {
    const angles = new Float32Array(basePairCount);
    const heights = new Float32Array(basePairCount);
    for (let i = 0; i < basePairCount; i++) {
      angles[i] = (i / basePairCount) * Math.PI * 8;
      heights[i] = (i / basePairCount) * helixHeight - helixHeight / 2;
    }
    return { angles, heights };
  }, []);

  const jitter = useMemo(() => {
    const r = new Float32Array(helixPoints);
    const t = new Float32Array(helixPoints);
    const y = new Float32Array(helixPoints);
    for (let i = 0; i < helixPoints; i++) {
      r[i] = (Math.random() - 0.5) * 0.12;
      t[i] = (Math.random() - 0.5) * 0.12;
      y[i] = (Math.random() - 0.5) * 0.08;
    }
    return { r, t, y };
  }, []);

  const backboneA = useMemo(() => {
    const positions = new Float32Array(helixPoints * 3);
    for (let i = 0; i < helixPoints; i++) {
      const angle = helixData.angles[i] + jitter.t[i];
      const radius = helixRadius + jitter.r[i];
      const y = helixData.heights[i] + jitter.y[i];
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, [helixData, jitter]);

  const backboneB = useMemo(() => {
    const positions = new Float32Array(helixPoints * 3);
    for (let i = 0; i < helixPoints; i++) {
      const angle = helixData.angles[i] + Math.PI + jitter.t[i];
      const radius = helixRadius + jitter.r[i];
      const y = helixData.heights[i] + jitter.y[i];
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, [helixData, jitter]);

  const basePairs = useMemo(() => {
    const positions = new Float32Array(basePairCount * 2 * 3);
    for (let i = 0; i < basePairCount; i++) {
      const t = basePairData.angles[i];
      const y = basePairData.heights[i];
      const x1 = Math.cos(t) * helixRadius;
      const z1 = Math.sin(t) * helixRadius;
      const x2 = Math.cos(t + Math.PI) * helixRadius;
      const z2 = Math.sin(t + Math.PI) * helixRadius;
      const idx = i * 6;
      positions[idx] = x1;
      positions[idx + 1] = y;
      positions[idx + 2] = z1;
      positions[idx + 3] = x2;
      positions[idx + 4] = y;
      positions[idx + 5] = z2;
    }
    return positions;
  }, [basePairData]);

  const redSpecks = useMemo(() => {
    const count = 160;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.6 + Math.random() * 1.2;
      const y = (Math.random() - 0.5) * 12;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, []);

  const haloPositions = useMemo(() => {
    const count = 260;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radiusX = 5.2 + Math.random() * 2.2;
      const radiusZ = 3.6 + Math.random() * 1.8;
      const y = (Math.random() - 0.5) * 13.5;
      positions[i * 3] = Math.cos(angle) * radiusX;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radiusZ;
    }
    return positions;
  }, []);

  const bokehPositions = useMemo(() => {
    const count = 320;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 6 + Math.random() * 10;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 16;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (helixRef.current) {
      helixRef.current.rotation.y = t * (Math.PI * 2) / 10;
    }
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.6) * 0.25;
      groupRef.current.position.x = Math.sin(t * 0.3) * 0.08;
    }

    if (backboneARef.current && backboneBRef.current) {
      const a = backboneARef.current.array;
      const b = backboneBRef.current.array;
      for (let i = 0; i < helixPoints; i++) {
        const wave = Math.sin(t * 2 + i * 0.15) * 0.1;
        const angle = helixData.angles[i] + jitter.t[i] + wave;
        const radius = helixRadius + jitter.r[i] + wave * 0.35;
        const y = helixData.heights[i] + jitter.y[i] + Math.sin(t * 1.4 + i * 0.1) * 0.02;
        a[i * 3] = Math.cos(angle) * radius;
        a[i * 3 + 1] = y;
        a[i * 3 + 2] = Math.sin(angle) * radius;
        b[i * 3] = Math.cos(angle + Math.PI) * radius;
        b[i * 3 + 1] = y;
        b[i * 3 + 2] = Math.sin(angle + Math.PI) * radius;
      }
      backboneARef.current.needsUpdate = true;
      backboneBRef.current.needsUpdate = true;
      if (backboneAGlowRef.current) backboneAGlowRef.current.needsUpdate = true;
      if (backboneBGlowRef.current) backboneBGlowRef.current.needsUpdate = true;
    }

    if (basePairRef.current) {
      const arr = basePairRef.current.array;
      for (let i = 0; i < basePairCount; i++) {
        const wave = Math.sin(t * 1.4 + i * 0.2) * 0.05;
        const angle = basePairData.angles[i] + wave;
        const y = basePairData.heights[i] + Math.sin(t * 1.2 + i * 0.12) * 0.02;
        const x1 = Math.cos(angle) * helixRadius;
        const z1 = Math.sin(angle) * helixRadius;
        const x2 = Math.cos(angle + Math.PI) * helixRadius;
        const z2 = Math.sin(angle + Math.PI) * helixRadius;
        const idx = i * 6;
        arr[idx] = x1;
        arr[idx + 1] = y;
        arr[idx + 2] = z1;
        arr[idx + 3] = x2;
        arr[idx + 4] = y;
        arr[idx + 5] = z2;
      }
      basePairRef.current.needsUpdate = true;
    }

    if (backboneAMaterialRef.current && backboneBMaterialRef.current) {
      const pulse = 0.72 + Math.sin(t * 1.4) * 0.1;
      backboneAMaterialRef.current.opacity = pulse;
      backboneBMaterialRef.current.opacity = pulse * 0.9;
    }
    if (backboneAGlowMaterialRef.current && backboneBGlowMaterialRef.current) {
      const glow = 0.22 + Math.sin(t * 1.1 + 1.2) * 0.06;
      backboneAGlowMaterialRef.current.opacity = glow;
      backboneBGlowMaterialRef.current.opacity = glow * 0.95;
    }
    if (basePairMaterialRef.current) {
      basePairMaterialRef.current.opacity = 0.45 + Math.sin(t * 1.5) * 0.08;
    }
    if (redSpeckMaterialRef.current) {
      redSpeckMaterialRef.current.opacity = 0.35 + Math.sin(t * 1.1) * 0.15;
    }
    if (haloRef.current) {
      haloRef.current.rotation.y = t * 0.04;
      haloRef.current.rotation.x = Math.sin(t * 0.2) * 0.03;
    }
    if (haloMaterialRef.current) {
      haloMaterialRef.current.opacity = 0.18 + Math.sin(t * 0.8) * 0.05;
    }
    if (bokehRef.current) {
      bokehRef.current.rotation.y = t * 0.02;
      bokehRef.current.rotation.x = Math.sin(t * 0.08) * 0.03;
    }
  });

  const primaryBlue = '#53b7ff';
  const secondaryCyan = '#9ad5ff';
  const accentRed = '#ff4f63';
  const softWhite = '#d7f0ff';

  return (
    <group ref={groupRef} scale={1.2} rotation={[0.2, -0.3, -0.55]}>
      <group ref={helixRef}>
        {/* Glowing particle backbone A */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              ref={backboneARef}
              attach="attributes-position"
              array={backboneA}
              count={backboneA.length / 3}
              itemSize={3}
              usage={THREE.DynamicDrawUsage}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={backboneAMaterialRef}
            color={softWhite}
            size={0.09}
            sizeAttenuation
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>

        {/* Glow halo A */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              ref={backboneAGlowRef}
              attach="attributes-position"
              array={backboneA}
              count={backboneA.length / 3}
              itemSize={3}
              usage={THREE.DynamicDrawUsage}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={backboneAGlowMaterialRef}
            color={primaryBlue}
            size={0.16}
            sizeAttenuation
            transparent
            opacity={0.22}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>

        {/* Glowing particle backbone B */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              ref={backboneBRef}
              attach="attributes-position"
              array={backboneB}
              count={backboneB.length / 3}
              itemSize={3}
              usage={THREE.DynamicDrawUsage}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={backboneBMaterialRef}
            color={secondaryCyan}
            size={0.085}
            sizeAttenuation
            transparent
            opacity={0.72}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>

        {/* Glow halo B */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              ref={backboneBGlowRef}
              attach="attributes-position"
              array={backboneB}
              count={backboneB.length / 3}
              itemSize={3}
              usage={THREE.DynamicDrawUsage}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={backboneBGlowMaterialRef}
            color={primaryBlue}
            size={0.15}
            sizeAttenuation
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>

        {/* Thin glowing base pair lines */}
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              ref={basePairRef}
              attach="attributes-position"
              array={basePairs}
              count={basePairs.length / 3}
              itemSize={3}
              usage={THREE.DynamicDrawUsage}
            />
          </bufferGeometry>
          <lineBasicMaterial
            ref={basePairMaterialRef}
            color={softWhite}
            transparent
            opacity={0.55}
          />
        </lineSegments>

        {/* Red accent particles */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={redSpecks}
              count={redSpecks.length / 3}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={redSpeckMaterialRef}
            color={accentRed}
            size={0.07}
            sizeAttenuation
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      </group>

      {/* Halo particles around the helix */}
      <points ref={haloRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={haloPositions}
            count={haloPositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={haloMaterialRef}
          color={secondaryCyan}
          size={0.06}
          sizeAttenuation
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Background bokeh particles */}
      <points ref={bokehRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={bokehPositions}
            count={bokehPositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.22}
          color="#7fb7ff"
          opacity={0.22}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

const Doctor3D = () => {
  return (
    <div className='absolute inset-0 w-full h-full'>
      <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
        <PerspectiveCamera makeDefault position={[0, 0, 12]} />
        <color attach="background" args={['#041226']} />
        <fog attach="fog" args={['#041226', 14, 30]} />

        <ambientLight intensity={0.6} color="#9fd7ff" />
        <hemisphereLight intensity={0.5} color="#bfe7ff" groundColor="#061328" />
        <directionalLight position={[8, 10, 8]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-8, -2, 6]} intensity={0.7} color="#6bbdff" />
        <pointLight position={[0, 0, 6]} intensity={1.0} color="#8ed3ff" />
        <pointLight position={[5, -6, -10]} intensity={0.6} color="#3ab0ff" />
        <DNAHelix />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
};

export default Doctor3D;
