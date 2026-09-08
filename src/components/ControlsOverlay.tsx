import React, { useState } from 'react';
import { GEOMETRIC_SHAPES } from '../utils/shapeGenerators';
import { GestureDetectionResult } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Palette,
  Sliders,
  Sparkles,
  Info,
  Layers,
  Circle,
  Box,
  Disc,
  Activity,
  Cylinder,
  Hourglass,
  Triangle,
  Infinity as InfinityIcon,
  Dna,
  Hand,
  Compass,
} from 'lucide-react';

interface ControlsOverlayProps {
  currentShapeIndex: number;
  onSelectShape: (index: number) => void;
  color: string;
  onChangeColor: (color: string) => void;
  particleSize: number;
  onChangeParticleSize: (size: number) => void;
  rotationSpeed: number;
  onChangeRotationSpeed: (speed: number) => void;
  gestureData: GestureDetectionResult | null;
  cameraEnabled: boolean;
  onToggleCamera: () => void;
}

const COLOR_PRESETS = [
  { name: 'Cian Neón', hex: '#00ffff' },
  { name: 'Magenta Eléctrico', hex: '#f43f5e' },
  { name: 'Violeta Cósmico', hex: '#a855f7' },
  { name: 'Oro Estelar', hex: '#fbbf24' },
  { name: 'Esmeralda', hex: '#10b981' },
  { name: 'Blanco Puro', hex: '#f8fafc' },
];

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({
  currentShapeIndex,
  onSelectShape,
  color,
  onChangeColor,
  particleSize,
  onChangeParticleSize,
  rotationSpeed,
  onChangeRotationSpeed,
  gestureData,
  cameraEnabled,
  onToggleCamera,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeShape = GEOMETRIC_SHAPES[currentShapeIndex] || GEOMETRIC_SHAPES[0];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const getShapeIcon = (id: string) => {
    switch (id) {
      case 'sphere': return <Circle className="w-3.5 h-3.5" />;
      case 'cube': return <Box className="w-3.5 h-3.5" />;
      case 'torus': return <Disc className="w-3.5 h-3.5" />;
      case 'knot': return <Activity className="w-3.5 h-3.5" />;
      case 'cylinder': return <Cylinder className="w-3.5 h-3.5" />;
      case 'hourglass': return <Hourglass className="w-3.5 h-3.5" />;
      case 'pyramid': return <Triangle className="w-3.5 h-3.5" />;
      case 'mobius': return <InfinityIcon className="w-3.5 h-3.5" />;
      case 'dna': return <Dna className="w-3.5 h-3.5" />;
      case 'galaxy': return <Sparkles className="w-3.5 h-3.5" />;
      default: return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top Bar: Title, Shape Name, Status Badge, Quick Tools */}
      <header className="flex items-start justify-between gap-4 w-full">
        {/* Left: App Title & Active Shape Info */}
        <div className="pointer-events-auto bg-neutral-900/80 backdrop-blur-md border border-white/10 p-3.5 sm:p-4 rounded-2xl shadow-xl max-w-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-wide">
              Partículas 3D con Gestos
            </h1>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              {currentShapeIndex + 1} / {GEOMETRIC_SHAPES.length}
            </span>
            <span className="text-sm font-semibold text-neutral-100">
              {activeShape.name}
            </span>
          </div>

          <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
            {activeShape.description}
          </p>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Help / Gesture Guide Button */}
          <button
            id="toggle-help-btn"
            onClick={() => setShowHelp(!showHelp)}
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-all shadow-lg ${
              showHelp
                ? 'bg-cyan-500 text-neutral-950 border-cyan-400'
                : 'bg-neutral-900/80 text-neutral-300 border-white/10 hover:bg-neutral-800'
            }`}
            title="Guía de Gestos"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            id="toggle-settings-btn"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-all shadow-lg ${
              showSettings
                ? 'bg-cyan-500 text-neutral-950 border-cyan-400'
                : 'bg-neutral-900/80 text-neutral-300 border-white/10 hover:bg-neutral-800'
            }`}
            title="Ajustes de Partículas y Color"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            id="fullscreen-toggle-btn"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-neutral-900/80 text-neutral-300 border border-white/10 backdrop-blur-md hover:bg-neutral-800 transition-all shadow-lg"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Floating Settings Drawer */}
      {showSettings && (
        <div
          id="settings-panel"
          className="pointer-events-auto absolute top-20 right-4 sm:right-6 w-80 bg-neutral-900/95 backdrop-blur-xl border border-white/15 p-4 rounded-2xl shadow-2xl z-30"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Configuración de Partículas
            </h2>
            <button
              onClick={() => setShowSettings(false)}
              className="text-neutral-400 hover:text-white text-xs font-semibold px-1"
            >
              ✕
            </button>
          </div>

          {/* Color Presets */}
          <div className="space-y-1.5 mb-4">
            <label className="text-xs text-neutral-300 font-medium flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              Color de Partículas
            </label>
            <div className="grid grid-cols-6 gap-1.5 pt-1">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  onClick={() => onChangeColor(preset.hex)}
                  style={{ backgroundColor: preset.hex }}
                  className={`h-7 rounded-lg border transition-transform hover:scale-110 ${
                    color.toLowerCase() === preset.hex.toLowerCase()
                      ? 'border-white scale-105 shadow-md shadow-cyan-500/20'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  title={preset.name}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="color"
                value={color}
                onChange={(e) => onChangeColor(e.target.value)}
                className="w-8 h-8 rounded border border-neutral-700 bg-transparent cursor-pointer"
              />
              <span className="text-xs font-mono text-neutral-400 uppercase">
                {color}
              </span>
            </div>
          </div>

          {/* Particle Size */}
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-xs text-neutral-300 font-medium">
              <span>Tamaño de Partícula</span>
              <span className="font-mono text-cyan-400">{particleSize.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.08"
              step="0.002"
              value={particleSize}
              onChange={(e) => onChangeParticleSize(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
            />
          </div>

          {/* Rotation Speed */}
          <div className="space-y-1.5 mb-2">
            <div className="flex justify-between text-xs text-neutral-300 font-medium">
              <span>Velocidad de Giro 3D</span>
              <span className="font-mono text-cyan-400">{rotationSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={rotationSpeed}
              onChange={(e) => onChangeRotationSpeed(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
            />
          </div>
        </div>
      )}

      {/* Floating Gesture Help Guide */}
      {showHelp && (
        <div
          id="gesture-help-panel"
          className="pointer-events-auto absolute top-20 right-4 sm:right-6 w-84 bg-neutral-900/95 backdrop-blur-xl border border-white/15 p-4 rounded-2xl shadow-2xl z-30"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Hand className="w-3.5 h-3.5 text-cyan-400" />
              Gestos Interactivos Disponibles
            </h2>
            <button
              onClick={() => setShowHelp(false)}
              className="text-neutral-400 hover:text-white text-xs font-semibold px-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2.5 text-xs text-neutral-300">
            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-base">👉</span>
              <div>
                <strong className="text-white block font-semibold">Deslizar a la Derecha</strong>
                <span className="text-neutral-400">Pasa a la siguiente figura geométrica en secuencia.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-base">👈</span>
              <div>
                <strong className="text-white block font-semibold">Deslizar a la Izquierda</strong>
                <span className="text-neutral-400">Regresa a la figura geométrica anterior.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-base">🖐️</span>
              <div>
                <strong className="text-white block font-semibold">Mano Abierta</strong>
                <span className="text-neutral-400">Expande y dispersa las partículas 3D hacia el exterior.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-base">✊</span>
              <div>
                <strong className="text-white block font-semibold">Puño Cerrado</strong>
                <span className="text-neutral-400">Contrae y compacta la figura hacia el núcleo.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-base">🧭</span>
              <div>
                <strong className="text-white block font-semibold">Posición de la Mano / Arrastre</strong>
                <span className="text-neutral-400">Mueve la mano en X/Y o arrastra el cursor para rotar en 3D.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Center Feedback / Active Gesture Pill */}
      {gestureData && gestureData.handDetected && (
        <div className="pointer-events-none flex justify-center w-full my-auto">
          <div className="bg-neutral-900/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-lg animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>{gestureData.label}</span>
          </div>
        </div>
      )}

      {/* Bottom Control Bar: Interactive 10-Shape Slider & Navigation */}
      <footer className="w-full flex flex-col items-center gap-3">
        {/* Quick Shape Selector Pills */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto max-w-full px-2 py-1 scrollbar-none">
          {GEOMETRIC_SHAPES.map((shape, idx) => (
            <button
              key={shape.id}
              onClick={() => onSelectShape(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 backdrop-blur-md ${
                idx === currentShapeIndex
                  ? 'bg-cyan-500 text-neutral-950 font-semibold shadow-md shadow-cyan-500/30 scale-105'
                  : 'bg-neutral-900/80 text-neutral-400 border border-white/10 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {getShapeIcon(shape.id)}
              <span>{idx + 1}. {shape.name}</span>
            </button>
          ))}
        </div>

        {/* Main Interactive Shape Slider Container */}
        <div className="pointer-events-auto w-full max-w-2xl bg-neutral-900/85 backdrop-blur-xl border border-white/15 p-4 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between gap-3 mb-2">
            {/* Previous Shape Button */}
            <button
              id="prev-shape-btn"
              onClick={() => onSelectShape((currentShapeIndex - 1 + GEOMETRIC_SHAPES.length) % GEOMETRIC_SHAPES.length)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-semibold transition border border-white/10"
              title="Figura Anterior (o gesto deslizar izquierda)"
            >
              <ChevronLeft className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            {/* Current Shape Indicator Label */}
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 block">
                Figura {currentShapeIndex + 1} de 10
              </span>
              <span className="text-sm font-bold text-white">
                {activeShape.name}
              </span>
            </div>

            {/* Next Shape Button */}
            <button
              id="next-shape-btn"
              onClick={() => onSelectShape((currentShapeIndex + 1) % GEOMETRIC_SHAPES.length)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-semibold transition border border-white/10"
              title="Siguiente Figura (o gesto deslizar derecha)"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>

          {/* Interactive Range Slider for the 10 Geometric Shapes */}
          <div className="relative pt-2 pb-1">
            <input
              id="shape-slider"
              type="range"
              min="0"
              max={GEOMETRIC_SHAPES.length - 1}
              step="1"
              value={currentShapeIndex}
              onChange={(e) => onSelectShape(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-neutral-800 rounded-lg appearance-none"
            />

            {/* Slider 10 Step Tick Marks */}
            <div className="flex justify-between items-center px-1 mt-1.5 text-[10px] font-mono text-neutral-500">
              {GEOMETRIC_SHAPES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectShape(idx)}
                  className={`w-4 text-center cursor-pointer transition-colors ${
                    idx === currentShapeIndex
                      ? 'text-cyan-400 font-bold scale-125'
                      : 'hover:text-neutral-300'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
