import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { GEOMETRIC_SHAPES, PARTICLE_COUNT } from '../utils/shapeGenerators';
import { GestureDetectionResult } from '../types';

interface ThreeCanvasProps {
  currentShapeIndex: number;
  color: string;
  particleSize: number;
  rotationSpeed: number;
  gestureData: GestureDetectionResult | null;
  onNextShape: () => void;
  onPrevShape: () => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  currentShapeIndex,
  color,
  particleSize,
  rotationSpeed,
  gestureData,
  onNextShape,
  onPrevShape,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const positionsAttrRef = useRef<THREE.BufferAttribute | null>(null);

  // Buffer arrays for morphing
  const currentPositionsRef = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));
  const targetPositionsRef = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));

  // Dynamic state for animation loop
  const targetScaleRef = useRef<number>(1.0);
  const currentScaleRef = useRef<number>(1.0);
  const targetRotXRef = useRef<number>(0);
  const targetRotYRef = useRef<number>(0);

  // Mouse / Touch drag interaction
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });

  // Generate glowing dot texture procedurally
  const createCircleTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.85)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    camera.position.z = 6.2;
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x05070d, 1);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Geometry and initial shape
    const initialPos = GEOMETRIC_SHAPES[currentShapeIndex].generate(PARTICLE_COUNT);
    currentPositionsRef.current.set(initialPos);
    targetPositionsRef.current.set(initialPos);

    const geometry = new THREE.BufferGeometry();
    const posAttribute = new THREE.BufferAttribute(currentPositionsRef.current, 3);
    geometry.setAttribute('position', posAttribute);
    positionsAttrRef.current = posAttribute;

    // 5. Points Material
    const circleTexture = createCircleTexture();
    const material = new THREE.PointsMaterial({
      size: particleSize,
      map: circleTexture || undefined,
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // 6. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (!particlesRef.current || !positionsAttrRef.current) return;

      const currentPos = currentPositionsRef.current;
      const targetPos = targetPositionsRef.current;
      let needsUpdate = false;

      // Morphing interpolation
      const morphFactor = 0.08;
      for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
        const diff = targetPos[i] - currentPos[i];
        if (Math.abs(diff) > 0.0008) {
          currentPos[i] += diff * morphFactor;
          needsUpdate = true;
        } else {
          currentPos[i] = targetPos[i];
        }
      }

      if (needsUpdate) {
        positionsAttrRef.current.needsUpdate = true;
      }

      // Smooth Scale Lerp
      currentScaleRef.current += (targetScaleRef.current - currentScaleRef.current) * 0.1;
      const s = currentScaleRef.current;
      particlesRef.current.scale.set(s, s, s);

      // Automatic gentle rotation plus gesture-based target rotation
      particlesRef.current.rotation.y += rotationSpeed * 0.015;
      particlesRef.current.rotation.x += rotationSpeed * 0.007;

      // Inertial blend for manual/gesture drag
      particlesRef.current.rotation.x += (targetRotXRef.current - particlesRef.current.rotation.x) * 0.05;
      particlesRef.current.rotation.y += (targetRotYRef.current - particlesRef.current.rotation.y) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Resize observer
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      if (circleTexture) circleTexture.dispose();
      renderer.dispose();
    };
  }, []);

  // Update target shape when currentShapeIndex changes
  useEffect(() => {
    const shapeDef = GEOMETRIC_SHAPES[currentShapeIndex] || GEOMETRIC_SHAPES[0];
    const newPositions = shapeDef.generate(PARTICLE_COUNT);
    targetPositionsRef.current.set(newPositions);
  }, [currentShapeIndex]);

  // Update particle color
  useEffect(() => {
    if (particlesRef.current) {
      const mat = particlesRef.current.material as THREE.PointsMaterial;
      mat.color.set(color);
    }
  }, [color]);

  // Update particle size
  useEffect(() => {
    if (particlesRef.current) {
      const mat = particlesRef.current.material as THREE.PointsMaterial;
      mat.size = particleSize;
    }
  }, [particleSize]);

  // React to hand gesture data
  useEffect(() => {
    if (!gestureData) return;

    if (gestureData.handDetected) {
      // Map hand openness (0 = fist -> scale 0.5, 1 = wide open -> scale 2.3)
      const calculatedScale = 0.5 + gestureData.openness * 1.8;
      targetScaleRef.current = calculatedScale;

      // Steer rotation using hand position:
      // handX from 0 to 1 -> angle from -0.8 to +0.8
      const offsetX = (gestureData.handX - 0.5) * 1.6;
      const offsetY = (gestureData.handY - 0.5) * 1.6;

      targetRotYRef.current = offsetX * 2.0;
      targetRotXRef.current = offsetY * 1.8;
    } else {
      // Reset scale gently when no hand is present
      targetScaleRef.current = 1.0;
    }
  }, [gestureData]);

  // Keyboard navigation fallback (Left / Right arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        onNextShape();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        onPrevShape();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextShape, onPrevShape]);

  // Mouse / Touch drag to rotate & swipe fallback
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !particlesRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    targetRotYRef.current += deltaX * 0.008;
    targetRotXRef.current += deltaY * 0.008;

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Touch handlers for mobile swipe & rotate
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: performance.now(),
      };
      isDraggingRef.current = true;
      previousMousePositionRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1 || !particlesRef.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - previousMousePositionRef.current.x;
    const deltaY = touch.clientY - previousMousePositionRef.current.y;

    targetRotYRef.current += deltaX * 0.008;
    targetRotXRef.current += deltaY * 0.008;

    previousMousePositionRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    isDraggingRef.current = false;
    const touch = e.changedTouches[0];
    if (touch && touchStartRef.current) {
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaTime = performance.now() - touchStartRef.current.time;
      // Fast horizontal swipe
      if (Math.abs(deltaX) > 70 && deltaTime < 350) {
        if (deltaX < 0) {
          onNextShape();
        } else {
          onPrevShape();
        }
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY * -0.0015;
    targetScaleRef.current = Math.min(Math.max(targetScaleRef.current + delta, 0.4), 3.0);
  };

  return (
    <div
      id="three-canvas-viewport"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none select-none"
    />
  );
};
