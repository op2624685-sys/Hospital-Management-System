import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const DNAHelix = () => {
  const groupRef = useRef();
  const helixRef = useRef();
  const backboneARef = useRef();
  const backboneAGlowRef = useRef();
  const backboneASparkRef = useRef();
  const backboneBRef = useRef();
  const backboneBGlowRef = useRef();
  const backboneBSparkRef = useRef();
  const backboneAMaterialRef = useRef();
  const backboneAGlowMaterialRef = useRef();
  const backboneASparkMaterialRef = useRef();
  const backboneBMaterialRef = useRef();
  const backboneBGlowMaterialRef = useRef();
  const backboneBSparkMaterialRef = useRef();
  const backboneARedMaterialRef = useRef();
  const backboneBRedMaterialRef = useRef();
  const basePairMeshRef = useRef();
  const basePairGlowMeshRef = useRef();
  const basePairDotClusterRef = useRef();
  const accentRedRef = useRef();
  const accentCyanRef = useRef();
  const accentRedMaterialRef = useRef();
  const accentCyanMaterialRef = useRef();
  const haloMaterialRef = useRef();
  const haloRef = useRef();
  const bokehRef = useRef();
  const bokehRefLarge = useRef();
  const bokehRefWarm = useRef();

  const helixPoints = 2200;
  const helixRadius = 2.15;
  const helixHeight = 20;
  const basePairCount = 70;
  const dotClusterCount = 40;

  const tempObj = useMemo(() => new THREE.Object3D(), []);
  const tempDir = useMemo(() => new THREE.Vector3(), []);
  const tempMid = useMemo(() => new THREE.Vector3(), []);
  const upVec = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const rand01 = useMemo(() => (i, salt) => {
    const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
    return x - Math.floor(x);
  }, []);
  const dotOffsets = useMemo(() => {
    const offsets = [];
    for (let i = 0; i < dotClusterCount; i++) {
      offsets.push(new THREE.Vector3(
        (rand01(i, 1.1) - 0.5) * 0.12,
        (rand01(i, 2.2) - 0.5) * 0.12,
        (rand01(i, 3.3) - 0.5) * 0.12
      ));
    }
    return offsets;
  }, [dotClusterCount, rand01]);

  const helixData = useMemo(() => {
    const angles = new Float32Array(helixPoints);
    const heights = new Float32Array(helixPoints);
    for (let i = 0; i < helixPoints; i++) {
      angles[i] = (i / helixPoints) * Math.PI * 8;
      heights[i] = (i / helixPoints) * helixHeight - helixHeight / 2;
    }
    return { angles, heights };
  }, [helixPoints, helixHeight]);

  const basePairData = useMemo(() => {
    const angles = new Float32Array(basePairCount);
    const heights = new Float32Array(basePairCount);
    for (let i = 0; i < basePairCount; i++) {
      angles[i] = (i / basePairCount) * Math.PI * 8;
      heights[i] = (i / basePairCount) * helixHeight - helixHeight / 2;
    }
    return { angles, heights };
  }, [basePairCount, helixHeight]);

  const jitter = useMemo(() => {
    const r = new Float32Array(helixPoints);
    const t = new Float32Array(helixPoints);
    const y = new Float32Array(helixPoints);
    for (let i = 0; i < helixPoints; i++) {
      r[i] = (rand01(i, 4.1) - 0.5) * 0.08;
      t[i] = (rand01(i, 5.1) - 0.5) * 0.08;
      y[i] = (rand01(i, 6.1) - 0.5) * 0.05;
    }
    return { r, t, y };
  }, [rand01]);

  const sparkJitter = useMemo(() => {
    const r = new Float32Array(helixPoints);
    const t = new Float32Array(helixPoints);
    const y = new Float32Array(helixPoints);
    for (let i = 0; i < helixPoints; i++) {
      r[i] = (rand01(i, 7.2) - 0.5) * 0.14;
      t[i] = (rand01(i, 8.2) - 0.5) * 0.14;
      y[i] = (rand01(i, 9.2) - 0.5) * 0.08;
    }
    return { r, t, y };
  }, [helixPoints, rand01]);

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
  }, [helixData, helixRadius, helixPoints, jitter]);

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
  }, [helixData, helixRadius, helixPoints, jitter]);

  const backboneASpark = useMemo(() => {
    const positions = new Float32Array(helixPoints * 3);
    for (let i = 0; i < helixPoints; i++) {
      const angle = helixData.angles[i] + sparkJitter.t[i];
      const radius = helixRadius + sparkJitter.r[i];
      const y = helixData.heights[i] + sparkJitter.y[i];
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, [helixData, helixRadius, helixPoints, sparkJitter]);

  const backboneBSpark = useMemo(() => {
    const positions = new Float32Array(helixPoints * 3);
    for (let i = 0; i < helixPoints; i++) {
      const angle = helixData.angles[i] + Math.PI + sparkJitter.t[i];
      const radius = helixRadius + sparkJitter.r[i];
      const y = helixData.heights[i] + sparkJitter.y[i];
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, [helixData, helixRadius, helixPoints, sparkJitter]);

  const accentRedData = useMemo(() => {
    const count = 180;
    const base = new Float32Array(count * 3);
    const positions = new Float32Array(count * 3);
    const drift = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    const speed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = rand01(i, 10.1) * Math.PI * 2;
      const radius = 2.6 + rand01(i, 11.1) * 1.4;
      const y = (rand01(i, 12.1) - 0.5) * 12.5;
      const idx = i * 3;
      base[idx] = Math.cos(angle) * radius;
      base[idx + 1] = y;
      base[idx + 2] = Math.sin(angle) * radius;
      positions[idx] = base[idx];
      positions[idx + 1] = base[idx + 1];
      positions[idx + 2] = base[idx + 2];
      drift[idx] = (rand01(i, 13.1) - 0.5) * 0.25;
      drift[idx + 1] = (rand01(i, 14.1) - 0.5) * 0.35;
      drift[idx + 2] = (rand01(i, 15.1) - 0.5) * 0.25;
      phase[i] = rand01(i, 16.1) * Math.PI * 2;
      speed[i] = 0.3 + rand01(i, 17.1) * 0.6;
    }
    return { count, base, positions, drift, phase, speed };
  }, [rand01]);

  const accentCyanData = useMemo(() => {
    const count = 240;
    const base = new Float32Array(count * 3);
    const positions = new Float32Array(count * 3);
    const drift = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    const speed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = rand01(i, 18.2) * Math.PI * 2;
      const radius = 2.8 + rand01(i, 19.2) * 2;
      const y = (rand01(i, 20.2) - 0.5) * 13;
      const idx = i * 3;
      base[idx] = Math.cos(angle) * radius;
      base[idx + 1] = y;
      base[idx + 2] = Math.sin(angle) * radius;
      positions[idx] = base[idx];
      positions[idx + 1] = base[idx + 1];
      positions[idx + 2] = base[idx + 2];
      drift[idx] = (rand01(i, 21.2) - 0.5) * 0.35;
      drift[idx + 1] = (rand01(i, 22.2) - 0.5) * 0.4;
      drift[idx + 2] = (rand01(i, 23.2) - 0.5) * 0.35;
      phase[i] = rand01(i, 24.2) * Math.PI * 2;
      speed[i] = 0.2 + rand01(i, 25.2) * 0.5;
    }
    return { count, base, positions, drift, phase, speed };
  }, [rand01]);

  const haloPositions = useMemo(() => {
    const count = 160;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = rand01(i, 26.3) * Math.PI * 2;
      const radiusX = 5.8 + rand01(i, 27.3) * 2.6;
      const radiusZ = 4.2 + rand01(i, 28.3) * 2.2;
      const y = (rand01(i, 29.3) - 0.5) * 18;
      positions[i * 3] = Math.cos(angle) * radiusX;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radiusZ;
    }
    return positions;
  }, [rand01]);

  const bokehPositions = useMemo(() => {
    const count = 520;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 6 + rand01(i, 30.4) * 10;
      const angle = rand01(i, 31.4) * Math.PI * 2;
      const y = (rand01(i, 32.4) - 0.5) * 16;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, [rand01]);

  const bokehPositionsLarge = useMemo(() => {
    const count = 140;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 5 + rand01(i, 33.5) * 11;
      const angle = rand01(i, 34.5) * Math.PI * 2;
      const y = (rand01(i, 35.5) - 0.5) * 18;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, [rand01]);

  const bokehPositionsWarm = useMemo(() => {
    const count = 90;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 4 + rand01(i, 36.6) * 10;
      const angle = rand01(i, 37.6) * Math.PI * 2;
      const y = (rand01(i, 38.6) - 0.5) * 18;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, [rand01]);

  const particleTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.9)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.35)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return texture;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (helixRef.current) {
      helixRef.current.rotation.y = t * (Math.PI * 2) / 16;
    }
    if (groupRef.current) {
      groupRef.current.position.y = -0.05 + Math.sin(t * 0.55) * 0.18;
      groupRef.current.position.x = -0.25;
      groupRef.current.position.z = Math.sin(t * 0.4) * 0.04;
    }

    if (backboneARef.current && backboneBRef.current) {
      const a = backboneARef.current.array;
      const b = backboneBRef.current.array;
      for (let i = 0; i < helixPoints; i++) {
        const wave = Math.sin(t * 2 + i * 0.15) * 0.1;
        const angle = helixData.angles[i] + jitter.t[i] + wave;
        const radius = helixRadius + jitter.r[i] + wave * 0.35;
        const y = helixData.heights[i] + jitter.y[i] + Math.sin(t * 1.4 + i * 0.1) * 0.02;
        const yNorm = (y + helixHeight / 2) / helixHeight;
        const bend = Math.sin(yNorm * Math.PI) * 1.15;
        const tilt = (yNorm - 0.5) * 0.65;
        a[i * 3] = Math.cos(angle) * radius + bend;
        a[i * 3 + 1] = y + tilt;
        a[i * 3 + 2] = Math.sin(angle) * radius;
        b[i * 3] = Math.cos(angle + Math.PI) * radius + bend;
        b[i * 3 + 1] = y + tilt;
        b[i * 3 + 2] = Math.sin(angle + Math.PI) * radius;
      }
      backboneARef.current.needsUpdate = true;
      backboneBRef.current.needsUpdate = true;
      if (backboneAGlowRef.current) backboneAGlowRef.current.needsUpdate = true;
      if (backboneBGlowRef.current) backboneBGlowRef.current.needsUpdate = true;
    }

    if (backboneASparkRef.current && backboneBSparkRef.current) {
      const a = backboneASparkRef.current.array;
      const b = backboneBSparkRef.current.array;
      for (let i = 0; i < helixPoints; i++) {
        const wave = Math.sin(t * 2.2 + i * 0.18) * 0.12;
        const angle = helixData.angles[i] + sparkJitter.t[i] + wave;
        const radius = helixRadius + sparkJitter.r[i] + wave * 0.4;
        const y = helixData.heights[i] + sparkJitter.y[i] + Math.sin(t * 1.6 + i * 0.12) * 0.03;
        const yNorm = (y + helixHeight / 2) / helixHeight;
        const bend = Math.sin(yNorm * Math.PI) * 1.15;
        const tilt = (yNorm - 0.5) * 0.65;
        a[i * 3] = Math.cos(angle) * radius + bend;
        a[i * 3 + 1] = y + tilt;
        a[i * 3 + 2] = Math.sin(angle) * radius;
        b[i * 3] = Math.cos(angle + Math.PI) * radius + bend;
        b[i * 3 + 1] = y + tilt;
        b[i * 3 + 2] = Math.sin(angle + Math.PI) * radius;
      }
      backboneASparkRef.current.needsUpdate = true;
      backboneBSparkRef.current.needsUpdate = true;
    }

    if (basePairMeshRef.current && basePairGlowMeshRef.current && basePairDotClusterRef.current) {
      for (let i = 0; i < basePairCount; i++) {
        const wave = Math.sin(t * 1.4 + i * 0.2) * 0.05;
        const angle = basePairData.angles[i] + wave;
        const y = basePairData.heights[i] + Math.sin(t * 1.2 + i * 0.12) * 0.02;
        const yNorm = (y + helixHeight / 2) / helixHeight;
        const bend = Math.sin(yNorm * Math.PI) * 1.15;
        const tilt = (yNorm - 0.5) * 0.65;
        const x1 = Math.cos(angle) * helixRadius + bend;
        const z1 = Math.sin(angle) * helixRadius;
        const x2 = Math.cos(angle + Math.PI) * helixRadius + bend;
        const z2 = Math.sin(angle + Math.PI) * helixRadius;
        tempMid.set((x1 + x2) / 2, y + tilt, (z1 + z2) / 2);
        tempDir.set(x2 - x1, 0, z2 - z1);
        const length = tempDir.length();
        tempDir.normalize();
        tempObj.position.copy(tempMid);
        tempObj.quaternion.setFromUnitVectors(upVec, tempDir);
        tempObj.scale.set(1, length, 1);
        tempObj.updateMatrix();
        basePairMeshRef.current.setMatrixAt(i, tempObj.matrix);
        tempObj.scale.set(1.2, length, 1.2);
        tempObj.updateMatrix();
        basePairGlowMeshRef.current.setMatrixAt(i, tempObj.matrix);

        const leftBaseIndex = i * dotClusterCount * 2;
        const rightBaseIndex = leftBaseIndex + dotClusterCount;
        for (let j = 0; j < dotClusterCount; j++) {
          const offset = dotOffsets[j];
          tempObj.position.set(x1 + offset.x, y + tilt + offset.y, z1 + offset.z);
          tempObj.quaternion.identity();
          tempObj.scale.set(1, 1, 1);
          tempObj.updateMatrix();
          basePairDotClusterRef.current.setMatrixAt(leftBaseIndex + j, tempObj.matrix);
          tempObj.position.set(x2 + offset.x, y + tilt + offset.y, z2 + offset.z);
          tempObj.updateMatrix();
          basePairDotClusterRef.current.setMatrixAt(rightBaseIndex + j, tempObj.matrix);
        }
      }
      basePairMeshRef.current.instanceMatrix.needsUpdate = true;
      basePairGlowMeshRef.current.instanceMatrix.needsUpdate = true;
      basePairDotClusterRef.current.instanceMatrix.needsUpdate = true;
    }

    if (backboneAMaterialRef.current && backboneBMaterialRef.current) {
      const pulse = 0.82 + Math.sin(t * 1.3) * 0.08;
      backboneAMaterialRef.current.opacity = pulse;
      backboneBMaterialRef.current.opacity = pulse * 0.9;
    }
    if (backboneAGlowMaterialRef.current && backboneBGlowMaterialRef.current) {
      const glow = 0.28 + Math.sin(t * 1.1 + 1.2) * 0.08;
      backboneAGlowMaterialRef.current.opacity = glow;
      backboneBGlowMaterialRef.current.opacity = glow * 0.95;
    }
    if (backboneARedMaterialRef.current && backboneBRedMaterialRef.current) {
      const redPulse = 0.22 + Math.sin(t * 1.7 + 0.6) * 0.08;
      backboneARedMaterialRef.current.opacity = redPulse;
      backboneBRedMaterialRef.current.opacity = redPulse * 0.9;
    }
    if (backboneASparkMaterialRef.current && backboneBSparkMaterialRef.current) {
      const sparkle = 0.35 + Math.sin(t * 3) * 0.12;
      backboneASparkMaterialRef.current.opacity = sparkle;
      backboneBSparkMaterialRef.current.opacity = sparkle * 0.9;
    }
    if (accentRedRef.current) {
      const arr = accentRedRef.current.array;
      for (let i = 0; i < accentRedData.count; i++) {
        const idx = i * 3;
        const phase = accentRedData.phase[i];
        const speed = accentRedData.speed[i];
        const oscillation = t * speed + phase;
        arr[idx] = accentRedData.base[idx] + Math.cos(oscillation) * accentRedData.drift[idx];
        arr[idx + 1] = accentRedData.base[idx + 1] + Math.sin(oscillation) * accentRedData.drift[idx + 1];
        arr[idx + 2] = accentRedData.base[idx + 2] + Math.sin(oscillation) * accentRedData.drift[idx + 2];
      }
      accentRedRef.current.needsUpdate = true;
    }

    if (accentCyanRef.current) {
      const arr = accentCyanRef.current.array;
      for (let i = 0; i < accentCyanData.count; i++) {
        const idx = i * 3;
        const phase = accentCyanData.phase[i];
        const speed = accentCyanData.speed[i];
        const oscillation = t * speed + phase;
        arr[idx] = accentCyanData.base[idx] + Math.cos(oscillation) * accentCyanData.drift[idx];
        arr[idx + 1] = accentCyanData.base[idx + 1] + Math.sin(oscillation) * accentCyanData.drift[idx + 1];
        arr[idx + 2] = accentCyanData.base[idx + 2] + Math.cos(oscillation) * accentCyanData.drift[idx + 2];
      }
      accentCyanRef.current.needsUpdate = true;
    }

    if (accentRedMaterialRef.current) {
      accentRedMaterialRef.current.opacity = 0.35 + Math.sin(t * 1.1) * 0.12;
    }
    if (accentCyanMaterialRef.current) {
      accentCyanMaterialRef.current.opacity = 0.28 + Math.sin(t * 1.3 + 1.4) * 0.1;
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
    if (bokehRefLarge.current) {
      bokehRefLarge.current.rotation.y = -t * 0.01;
      bokehRefLarge.current.rotation.x = Math.sin(t * 0.06) * 0.02;
    }
    if (bokehRefWarm.current) {
      bokehRefWarm.current.rotation.y = t * 0.008;
      bokehRefWarm.current.rotation.x = Math.sin(t * 0.05) * 0.02;
    }
  });

  const primaryBlue = '#43b7ff';
  const secondaryCyan = '#a8e6ff';
  const accentRed = '#ff4f63';
  const softRed = '#ff7a86';
  const softWhite = '#eef9ff';

  return (
    <group ref={groupRef} scale={[1.0, 2.2, 1.0]} rotation={[0.1, 0.15, 1.22]}>
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
            color={primaryBlue}
            size={0.045}
            sizeAttenuation
            transparent
            opacity={0.95}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            map={particleTexture || undefined}
            alphaMap={particleTexture || undefined}
          />
        </points>

        {/* Sparkle layer A */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              ref={backboneASparkRef}
              attach="attributes-position"
              array={backboneASpark}
              count={backboneASpark.length / 3}
              itemSize={3}
              usage={THREE.DynamicDrawUsage}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={backboneASparkMaterialRef}
            color={softWhite}
            size={0.08}
            sizeAttenuation
            transparent
            opacity={0.28}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            map={particleTexture || undefined}
            alphaMap={particleTexture || undefined}
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
            size={0.14}
            sizeAttenuation
            transparent
            opacity={0.22}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            map={particleTexture || undefined}
            alphaMap={particleTexture || undefined}
          />
        </points>

        {/* Subtle red spark dots on backbone A */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={backboneA}
              count={backboneA.length / 3}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={backboneARedMaterialRef}
            color={softRed}
            size={0.03}
            sizeAttenuation
            transparent
            opacity={0.24}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            map={particleTexture || undefined}
            alphaMap={particleTexture || undefined}
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
            color={primaryBlue}
            size={0.042}
            sizeAttenuation
            transparent
            opacity={0.92}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            map={particleTexture || undefined}
            alphaMap={particleTexture || undefined}
          />
        </points>

        {/* Sparkle layer B */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              ref={backboneBSparkRef}
              attach="attributes-position"
              array={backboneBSpark}
              count={backboneBSpark.length / 3}
              itemSize={3}
              usage={THREE.DynamicDrawUsage}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={backboneBSparkMaterialRef}
            color={softWhite}
            size={0.078}
            sizeAttenuation
            transparent
            opacity={0.26}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            map={particleTexture || undefined}
            alphaMap={particleTexture || undefined}
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
            size={0.135}
            sizeAttenuation
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            map={particleTexture || undefined}
            alphaMap={particleTexture || undefined}
          />
        </points>

        {/* Subtle red spark dots on backbone B */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={backboneB}
              count={backboneB.length / 3}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={backboneBRedMaterialRef}
            color={softRed}
            size={0.03}
            sizeAttenuation
            transparent
            opacity={0.22}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            map={particleTexture || undefined}
            alphaMap={particleTexture || undefined}
          />
        </points>

        {/* Electric blue base pair sticks */}
        <instancedMesh ref={basePairGlowMeshRef} args={[null, null, basePairCount]}>
          <cylinderGeometry args={[0.028, 0.028, 1, 16]} />
          <meshBasicMaterial
            color={primaryBlue}
            transparent
            opacity={0.12}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </instancedMesh>
        <instancedMesh ref={basePairMeshRef} args={[null, null, basePairCount]}>
          <cylinderGeometry args={[0.016, 0.016, 1, 16]} />
          <meshStandardMaterial
            color={primaryBlue}
            emissive={primaryBlue}
            emissiveIntensity={0.7}
            roughness={0.35}
            metalness={0.1}
          />
        </instancedMesh>
        <instancedMesh ref={basePairDotClusterRef} args={[null, null, basePairCount * dotClusterCount * 2]}>
          <sphereGeometry args={[0.01, 10, 10]} />
          <meshStandardMaterial
            color={softWhite}
            emissive={primaryBlue}
            emissiveIntensity={0.9}
            roughness={0.25}
            metalness={0.05}
          />
        </instancedMesh>

        {/* Red accent particles */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              ref={accentRedRef}
              attach="attributes-position"
              array={accentRedData.positions}
              count={accentRedData.positions.length / 3}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={accentRedMaterialRef}
            color={accentRed}
            size={0.06}
            sizeAttenuation
            transparent
            opacity={0.36}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            map={particleTexture || undefined}
            alphaMap={particleTexture || undefined}
          />
        </points>

        {/* Cyan accent particles */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              ref={accentCyanRef}
              attach="attributes-position"
              array={accentCyanData.positions}
              count={accentCyanData.positions.length / 3}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={accentCyanMaterialRef}
            color={secondaryCyan}
            size={0.055}
            sizeAttenuation
            transparent
            opacity={0.28}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            map={particleTexture || undefined}
            alphaMap={particleTexture || undefined}
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
          size={0.04}
          sizeAttenuation
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          map={particleTexture || undefined}
          alphaMap={particleTexture || undefined}
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
          size={0.36}
          color="#6fb8ff"
          opacity={0.22}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          map={particleTexture || undefined}
          alphaMap={particleTexture || undefined}
        />
      </points>

      {/* Large soft bokeh blobs */}
      <points ref={bokehRefLarge}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={bokehPositionsLarge}
            count={bokehPositionsLarge.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.9}
          color="#8bd4ff"
          opacity={0.14}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          map={particleTexture || undefined}
          alphaMap={particleTexture || undefined}
        />
      </points>

      {/* Warm bokeh accents */}
      <points ref={bokehRefWarm}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={bokehPositionsWarm}
            count={bokehPositionsWarm.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.65}
          color="#ff6b7a"
          opacity={0.12}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          map={particleTexture || undefined}
          alphaMap={particleTexture || undefined}
        />
      </points>
    </group>
  );
};

const Doctor3D = () => {
  return (
    <div className='absolute inset-0 w-full h-full' style={{ width: '100%', height: '100%', overflow: 'hidden', background: '#061a35' }}>
      <Canvas
        className="absolute inset-0 block w-full h-full"
        style={{ width: '100%', height: '100%' }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 13]} />
        <color attach="background" args={['#061a35']} />
        <fog attach="fog" args={['#061a35', 14, 32]} />

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
