import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { GEOMETRIC_SHAPES, PARTICLE_COUNT } from '../utils/shapeGenerators';
import { GestureDetectionResult, ShapeDefinition } from '../types';

interface ThreeCanvasProps {
  shapes?: ShapeDefinition[];
  currentShapeIndex: number;
  color: string;
  particleSize: number;
  rotationSpeed: number;
  gestureData: GestureDetectionResult | null;
  onNextShape: () => void;
  onPrevShape: () => void;
  isFixed?: boolean;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  shapes = GEOMETRIC_SHAPES,
  currentShapeIndex,
  color,
  particleSize,
  rotationSpeed,
  gestureData,
  onNextShape,
  onPrevShape,
  isFixed = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const positionsAttrRef = useRef<THREE.BufferAttribute | null>(null);
  const colorsAttrRef = useRef<THREE.BufferAttribute | null>(null);

  const isFixedRef = useRef<boolean>(isFixed);
  useEffect(() => {
    isFixedRef.current = isFixed;
    if (isFixed && particlesRef.current) {
      particlesRef.current.rotation.set(0, 0, 0);
      targetRotXRef.current = 0;
      targetRotYRef.current = 0;
    }
  }, [isFixed]);

  // Compute realistic volumetric physical lighting per particle taking 4D into account
  const computeVolumetricColors = useCallback((positions4D: Float32Array, baseHex: string, count: number, output: Float32Array) => {
    const baseColor = new THREE.Color(baseHex);
    const hsl = { h: 0, s: 0, l: 0 };
    baseColor.getHSL(hsl);

    // 4D key directional hyper-light vector
    const lx = 0.42;
    const ly = 0.76;
    const lz = 0.44;
    const lw = 0.32;

    for (let i = 0; i < count; i++) {
      const idx4 = i * 4;
      const x = positions4D[idx4];
      const y = positions4D[idx4 + 1];
      const z = positions4D[idx4 + 2];
      const w = positions4D[idx4 + 3];

      const dist = Math.sqrt(x * x + y * y + z * z + w * w) || 1.0;
      const nx = x / dist;
      const ny = y / dist;
      const nz = z / dist;
      const nw = w / dist;

      // 4D Diffuse key light dot product
      const dot = nx * lx + ny * ly + nz * lz + nw * lw;
      const diffuse = Math.max(0, dot);

      // Rim lighting on particle silhouettes facing perpendicular to camera
      const viewDot = Math.abs(nz);
      const rim = Math.pow(Math.max(0, 1 - viewDot), 2.2) * 0.48;

      // Specular highlight glint
      const spec = Math.pow(Math.max(0, nx * 0.25 + ny * 0.45 + nz * 0.85), 7) * 0.52;

      // 4D Hyper-layer depth luminance modulation
      const hyperLuminance = nw * 0.16;

      // Subtle height gradient
      const heightFactor = Math.max(-0.12, Math.min(0.2, y * 0.07));

      // Realistic volumetric luminance
      const finalLightness = Math.min(
        0.96,
        Math.max(0.18, hsl.l * (0.55 + diffuse * 0.65 + rim) + spec + heightFactor + hyperLuminance)
      );

      // Specular desaturation towards hot white highlights
      const finalSaturation = Math.max(0.15, hsl.s * (1.0 - spec * 0.75));

      // 4D hyperdimensional chromatic dispersion (Hopf fiber dispersion)
      const hueShift = (nz - 0.2) * 0.035 + nw * 0.045;
      const finalHue = (hsl.h + hueShift + 1.0) % 1.0;

      const pColor = new THREE.Color().setHSL(finalHue, finalSaturation, finalLightness);
      const idx3 = i * 3;
      output[idx3] = pColor.r;
      output[idx3 + 1] = pColor.g;
      output[idx3 + 2] = pColor.b;
    }
  }, []);

  // Buffer arrays for 4D morphing and 3D projected rendering
  const currentPositions4DRef = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 4));
  const targetPositions4DRef = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 4));
  const projectedPositionsRef = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));
  const currentColorsRef = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));
  const targetColorsRef = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));

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

    // Optical star/bokeh point: intense luminous core, soft Gaussian falloff
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.12, 'rgba(255, 255, 255, 0.96)');
    gradient.addColorStop(0.32, 'rgba(255, 255, 255, 0.52)');
    gradient.addColorStop(0.62, 'rgba(255, 255, 255, 0.15)');
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
    const initialShape = (shapes && shapes[currentShapeIndex]) || shapes[0] || GEOMETRIC_SHAPES[0];
    const initialPos = initialShape.generate(PARTICLE_COUNT);
    currentPositions4DRef.current.set(initialPos);
    targetPositions4DRef.current.set(initialPos);

    computeVolumetricColors(initialPos, color, PARTICLE_COUNT, currentColorsRef.current);
    targetColorsRef.current.set(currentColorsRef.current);

    // Initial 4D to 3D stereographic hyper-projection
    const D_init = 6.0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i4 = i * 4;
      const x = initialPos[i4];
      const y = initialPos[i4 + 1];
      const z = initialPos[i4 + 2];
      const w = initialPos[i4 + 3];
      const denom = Math.max(0.6, D_init - w);
      const s = D_init / denom;
      const i3 = i * 3;
      const px = x * s;
      const py = y * s;
      const pz = z * s;
      projectedPositionsRef.current[i3] = Number.isFinite(px) ? px : x;
      projectedPositionsRef.current[i3 + 1] = Number.isFinite(py) ? py : y;
      projectedPositionsRef.current[i3 + 2] = Number.isFinite(pz) ? pz : z;
    }

    const geometry = new THREE.BufferGeometry();
    const posAttribute = new THREE.BufferAttribute(projectedPositionsRef.current, 3);
    geometry.setAttribute('position', posAttribute);
    positionsAttrRef.current = posAttribute;

    const colorsAttribute = new THREE.BufferAttribute(currentColorsRef.current, 3);
    geometry.setAttribute('color', colorsAttribute);
    colorsAttrRef.current = colorsAttribute;

    // 5. Points Material with Volumetric Vertex Shading
    const circleTexture = createCircleTexture();
    const material = new THREE.PointsMaterial({
      size: particleSize,
      map: circleTexture || undefined,
      vertexColors: true,
      transparent: true,
      opacity: 0.94,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // 6. Animation Loop with 4D Hyper-Rotation and Stereographic Projection
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (!particlesRef.current || !positionsAttrRef.current) return;

      const currentPos4D = currentPositions4DRef.current;
      const targetPos4D = targetPositions4DRef.current;
      const currentCols = currentColorsRef.current;
      const targetCols = targetColorsRef.current;
      const projPositions = projectedPositionsRef.current;
      let needsColUpdate = false;

      // Morphing interpolation in 4D space
      const morphFactor = 0.085;
      for (let i = 0; i < PARTICLE_COUNT * 4; i++) {
        const diff = targetPos4D[i] - currentPos4D[i];
        if (Math.abs(diff) > 0.0008) {
          currentPos4D[i] += diff * morphFactor;
        } else {
          currentPos4D[i] = targetPos4D[i];
        }
      }

      // Morphing volumetric 4D colors
      for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
        const cDiff = targetCols[i] - currentCols[i];
        if (Math.abs(cDiff) > 0.002) {
          currentCols[i] += cDiff * morphFactor;
          needsColUpdate = true;
        } else {
          currentCols[i] = targetCols[i];
        }
      }

      // 4D Planar Hyper-Rotations (XW, ZW, YW planes)
      let angleXW = 0;
      let angleZW = 0;
      let angleYW = 0;

      if (!isFixedRef.current) {
        const hyperTime = time * 0.45 * Math.max(0.2, rotationSpeed);
        angleXW = hyperTime * 0.75;
        angleZW = hyperTime * 0.55;
        angleYW = hyperTime * 0.35;
      } else {
        // Subtle harmonic breathing in 4D when fixed, keeping frontal readability
        const gentleBreath = Math.sin(time * 0.8) * 0.08;
        angleXW = gentleBreath;
        angleZW = gentleBreath * 0.5;
      }

      const cosXW = Math.cos(angleXW);
      const sinXW = Math.sin(angleXW);
      const cosZW = Math.cos(angleZW);
      const sinZW = Math.sin(angleZW);
      const cosYW = Math.cos(angleYW);
      const sinYW = Math.sin(angleYW);

      const D = 6.0; // 4D hyper-camera focal distance
      const minDenom = 0.6;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i4 = i * 4;
        const x0 = currentPos4D[i4];
        const y0 = currentPos4D[i4 + 1];
        const z0 = currentPos4D[i4 + 2];
        const w0 = currentPos4D[i4 + 3];

        // Hyper-rotation in XW plane
        const x1 = x0 * cosXW - w0 * sinXW;
        const w1 = x0 * sinXW + w0 * cosXW;

        // Hyper-rotation in ZW plane
        const z1 = z0 * cosZW - w1 * sinZW;
        const w2 = z0 * sinZW + w1 * cosZW;

        // Hyper-rotation in YW plane
        const y1 = y0 * cosYW - w2 * sinYW;
        const w3 = y0 * sinYW + w2 * cosYW;

        // Stereographic / perspective 4D-to-3D projection
        const denom = Math.max(minDenom, D - w3);
        const hypScale = D / denom;

        const i3 = i * 3;
        const px = x1 * hypScale;
        const py = y1 * hypScale;
        const pz = z1 * hypScale;
        projPositions[i3] = Number.isFinite(px) ? px : x1;
        projPositions[i3 + 1] = Number.isFinite(py) ? py : y1;
        projPositions[i3 + 2] = Number.isFinite(pz) ? pz : z1;
      }

      if (positionsAttrRef.current) {
        positionsAttrRef.current.needsUpdate = true;
      }
      if (needsColUpdate && colorsAttrRef.current) {
        colorsAttrRef.current.needsUpdate = true;
      }

      // Smooth Scale Lerp
      currentScaleRef.current += (targetScaleRef.current - currentScaleRef.current) * 0.1;
      const s = currentScaleRef.current;
      particlesRef.current.scale.set(s, s, s);

      // Handle 3D rotation: when isFixed is true, keep strictly stationary facing frontally
      if (isFixedRef.current) {
        particlesRef.current.rotation.set(0, 0, 0);
        targetRotXRef.current = 0;
        targetRotYRef.current = 0;
      } else {
        // Automatic gentle rotation plus gesture-based target rotation
        particlesRef.current.rotation.y += rotationSpeed * 0.015;
        particlesRef.current.rotation.x += rotationSpeed * 0.007;

        // Inertial blend for manual/gesture drag
        particlesRef.current.rotation.x += (targetRotXRef.current - particlesRef.current.rotation.x) * 0.05;
        particlesRef.current.rotation.y += (targetRotYRef.current - particlesRef.current.rotation.y) * 0.05;
      }

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

  // Update target shape and volumetric lighting when shape, index or color changes
  useEffect(() => {
    const shapeDef = (shapes && shapes[currentShapeIndex]) || (shapes && shapes[0]) || GEOMETRIC_SHAPES[0];
    const newPositions = shapeDef.generate(PARTICLE_COUNT);
    targetPositions4DRef.current.set(newPositions);
    computeVolumetricColors(newPositions, color, PARTICLE_COUNT, targetColorsRef.current);
  }, [shapes, currentShapeIndex, color, computeVolumetricColors]);

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

      // Steer rotation using hand position only if not fixed
      if (!isFixedRef.current) {
        const offsetX = (gestureData.handX - 0.5) * 1.6;
        const offsetY = (gestureData.handY - 0.5) * 1.6;

        targetRotYRef.current = offsetX * 2.0;
        targetRotXRef.current = offsetY * 1.8;
      }
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
    if (isFixedRef.current || !isDraggingRef.current || !particlesRef.current) return;
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
    if (isFixedRef.current || !isDraggingRef.current || e.touches.length !== 1 || !particlesRef.current) return;
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
