import React, { useState, useCallback, useEffect } from 'react';
import { ThreeCanvas } from './components/ThreeCanvas';
import { HandTracker } from './components/HandTracker';
import { ControlsOverlay } from './components/ControlsOverlay';
import { AuthModal } from './components/AuthModal';
import { GEOMETRIC_SHAPES, NUMBER_SHAPES, ANIMAL_SHAPES } from './utils/shapeGenerators';
import { GestureDetectionResult, User, ActiveSection } from './types';

// Subtle synthesizer chime for shape transitions using Web Audio API (singleton)
let sharedAudioCtx: AudioContext | null = null;
const playTransitionSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    const ctx = sharedAudioCtx;
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
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('particles_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeSection, setActiveSection] = useState<ActiveSection>('shapes');
  const [shapeIndex, setShapeIndex] = useState<number>(0);
  const [numberIndex, setNumberIndex] = useState<number>(0);
  const [animalIndex, setAnimalIndex] = useState<number>(0);

  const activeShapes =
    activeSection === 'shapes'
      ? GEOMETRIC_SHAPES
      : activeSection === 'numbers'
      ? NUMBER_SHAPES
      : ANIMAL_SHAPES;

  const currentShapeIndex =
    activeSection === 'shapes'
      ? shapeIndex
      : activeSection === 'numbers'
      ? numberIndex
      : animalIndex;

  const [color, setColor] = useState<string>('#00ffff');
  const [particleSize, setParticleSize] = useState<number>(0.024);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1.0);
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);
  const [gestureData, setGestureData] = useState<GestureDetectionResult | null>(null);

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem('particles_current_user');
    } catch {
      // ignore
    }
    setCurrentUser(null);
  }, []);

  const handleSelectSection = useCallback((section: ActiveSection) => {
    setActiveSection(section);
    playTransitionSound();
  }, []);

  const handleNextShape = useCallback(() => {
    if (activeSection === 'shapes') {
      setShapeIndex((prev) => {
        const next = (prev + 1) % GEOMETRIC_SHAPES.length;
        playTransitionSound();
        return next;
      });
    } else if (activeSection === 'numbers') {
      setNumberIndex((prev) => {
        const next = (prev + 1) % NUMBER_SHAPES.length;
        playTransitionSound();
        return next;
      });
    } else {
      setAnimalIndex((prev) => {
        const next = (prev + 1) % ANIMAL_SHAPES.length;
        playTransitionSound();
        return next;
      });
    }
  }, [activeSection]);

  const handlePrevShape = useCallback(() => {
    if (activeSection === 'shapes') {
      setShapeIndex((prev) => {
        const prevIdx = (prev - 1 + GEOMETRIC_SHAPES.length) % GEOMETRIC_SHAPES.length;
        playTransitionSound();
        return prevIdx;
      });
    } else if (activeSection === 'numbers') {
      setNumberIndex((prev) => {
        const prevIdx = (prev - 1 + NUMBER_SHAPES.length) % NUMBER_SHAPES.length;
        playTransitionSound();
        return prevIdx;
      });
    } else {
      setAnimalIndex((prev) => {
        const prevIdx = (prev - 1 + ANIMAL_SHAPES.length) % ANIMAL_SHAPES.length;
        playTransitionSound();
        return prevIdx;
      });
    }
  }, [activeSection]);

  const handleSelectShape = useCallback((index: number) => {
    if (activeSection === 'shapes') {
      setShapeIndex((prev) => {
        if (prev !== index) {
          playTransitionSound();
        }
        return index;
      });
    } else if (activeSection === 'numbers') {
      setNumberIndex((prev) => {
        if (prev !== index) {
          playTransitionSound();
        }
        return index;
      });
    } else {
      setAnimalIndex((prev) => {
        if (prev !== index) {
          playTransitionSound();
        }
        return index;
      });
    }
  }, [activeSection]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-neutral-950 font-sans">
      {/* 3D WebGL Three.js Canvas */}
      <ThreeCanvas
        shapes={activeShapes}
        currentShapeIndex={currentShapeIndex}
        color={color}
        particleSize={particleSize}
        rotationSpeed={rotationSpeed}
        gestureData={gestureData}
        onNextShape={handleNextShape}
        onPrevShape={handlePrevShape}
        isFixed={activeSection === 'numbers'}
      />

      {/* Hand Tracking MediaPipe Video Feed & Gesture Processor */}
      {currentUser && (
        <div className="absolute top-20 right-4 sm:top-24 sm:right-6 z-20 pointer-events-auto">
          <HandTracker
            enabled={cameraEnabled}
            onToggleEnabled={() => setCameraEnabled(!cameraEnabled)}
            onGesture={setGestureData}
            onNextShape={handleNextShape}
            onPrevShape={handlePrevShape}
          />
        </div>
      )}

      {/* Interactive HUD Overlays, Slider & Shape/Number Controller */}
      <ControlsOverlay
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        activeShapes={activeShapes}
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
        user={currentUser}
        onLogout={handleLogout}
      />

      {/* Auth Modal (Register First, then Login) */}
      {!currentUser && (
        <AuthModal
          onLoginSuccess={(user) => {
            setCurrentUser(user);
          }}
        />
      )}
    </main>
  );
}
