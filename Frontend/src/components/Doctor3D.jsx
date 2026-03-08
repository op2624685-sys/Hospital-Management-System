import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, SoftShadows, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

import { useGLTF, useAnimations } from '@react-three/drei';

const RealDoctorModel = () => {
  const groupRef = useRef();
  
  // Load the actual model
  const { scene, animations } = useGLTF('/free_download_male_surgical_doctor_working_222.glb'); 
  const { actions } = useAnimations(animations, groupRef);

  React.useEffect(() => {
    // Log animations to the browser console for debugging
    console.log("Available animations from GLB:", Object.keys(actions));
    
    const animationNames = Object.keys(actions);
    if (animationNames.length > 0) {
      // Sometimes the walk animation is named "Take 001" or it's simply the last animation
      // Let's try to play "Take 001", or any walk, or just the LAST animation in the list 
      // (as the first one is often a static T-pose or idle pose).
      const walkKey = animationNames.find(n => n.toLowerCase().includes('walk'));
      const takeKey = animationNames.find(n => n.toLowerCase().includes('take'));
      
      const actionKeyToPlay = walkKey || takeKey || animationNames[animationNames.length - 1];
      const actionToPlay = actions[actionKeyToPlay];
      
      console.log("Playing animation:", actionKeyToPlay);
      actionToPlay.reset().fadeIn(0.5).play();
    } else {
      console.log("NO ANIMATIONS FOUND IN THIS GLB FILE!");
    }
  }, [actions]);

  useFrame(() => {
    // We've removed the sliding animation logic here as requested!
    // The doctor will now stand still in the center.
  });

  return (
    // Set X position to 0 so he is centered.
    <group ref={groupRef} position={[0, -2.5, 0]}>
      {/* We need to ensure the model casts and receives shadows. 
          Traverse the scene to apply shadows. */}
      <primitive 
        object={scene} 
        scale={0.03} // Increased a bit more
      />
    </group>
  );
};

const Doctor3D = () => {
  return (
    <div className='absolute inset-0 w-full h-full'>
      {/* Overlay Instructions Removed */}
      
      <Canvas shadows camera={{ position: [0, 2, 8], fov: 45 }}>
        <SoftShadows size={10} samples={16} focus={0.5} />
        
        {/* Environment Lights */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          castShadow 
          position={[5, 10, 5]} 
          intensity={1.5} 
          shadow-mapSize={1024}
        />
        <spotLight position={[-5, 5, 0]} intensity={2} color="#a855f7" />
        <spotLight position={[5, 5, 0]} intensity={2} color="#06b6d4" />
        
        <Environment preset="city" />

        <RealDoctorModel />

        {/* Floor shadow receiver */}
        <ContactShadows 
          position={[0, 0.01, 0]} 
          opacity={0.4} 
          scale={20} 
          blur={2} 
          far={10} 
          color="#000000" 
        />
      </Canvas>
    </div>
  );
};

export default Doctor3D;
