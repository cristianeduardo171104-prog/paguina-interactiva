import React, { useState, useCallback } from 'react';
import { ThreeCanvas } from './components/ThreeCanvas';
import { HandTracker } from './components/HandTracker';
import { ControlsOverlay } from './components/ControlsOverlay';
import { GEOMETRIC_SHAPES } from './utils/shapeGenerators';
import { GestureDetectionResult } from './types';

// Subtle synthesizer chime for shape transitions using Web Audio API
const playTransitionSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    // audio may be disabled until user gesture
  }
};

export default function App() {
  const [currentShapeIndex, setCurrentShapeIndex] = useState<number>(0);
  const [color, setColor] = useState<string>('#00ffff');
  const [particleSize, setParticleSize] = useState<number>(0.024);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1.0);
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);
  const [gestureData, setGestureData] = useState<GestureDetectionResult | null>(null);

  const handleNextShape = useCallback(() => {
    setCurrentShapeIndex((prev) => {
      const next = (prev + 1) % GEOMETRIC_SHAPES.length;
      playTransitionSound();
      return next;
    });
  }, []);

  const handlePrevShape = useCallback(() => {
    setCurrentShapeIndex((prev) => {
      const prevIdx = (prev - 1 + GEOMETRIC_SHAPES.length) % GEOMETRIC_SHAPES.length;
      playTransitionSound();
      return prevIdx;
    });
  }, []);

  const handleSelectShape = useCallback((index: number) => {
    setCurrentShapeIndex((prev) => {
      if (prev !== index) {
        playTransitionSound();
      }
      return index;
    });
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-neutral-950 font-sans">
      {/* 3D WebGL Three.js Canvas */}
      <ThreeCanvas
        currentShapeIndex={currentShapeIndex}
        color={color}
        particleSize={particleSize}
        rotationSpeed={rotationSpeed}
        gestureData={gestureData}
        onNextShape={handleNextShape}
        onPrevShape={handlePrevShape}
      />

      {/* Hand Tracking MediaPipe Video Feed & Gesture Processor */}
      <div className="absolute top-20 right-4 sm:top-24 sm:right-6 z-20 pointer-events-auto">
        <HandTracker
          enabled={cameraEnabled}
          onToggleEnabled={() => setCameraEnabled(!cameraEnabled)}
          onGesture={setGestureData}
          onNextShape={handleNextShape}
          onPrevShape={handlePrevShape}
        />
      </div>

      {/* Interactive HUD Overlays, Slider & Shape Controller */}
      <ControlsOverlay
        currentShapeIndex={currentShapeIndex}
        onSelectShape={handleSelectShape}
        color={color}
        onChangeColor={setColor}
        particleSize={particleSize}
        onChangeParticleSize={setParticleSize}
        rotationSpeed={rotationSpeed}
        onChangeRotationSpeed={setRotationSpeed}
        gestureData={gestureData}
        cameraEnabled={cameraEnabled}
        onToggleCamera={() => setCameraEnabled(!cameraEnabled)}
      />
    </main>
  );
}
