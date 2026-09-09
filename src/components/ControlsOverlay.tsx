import React, { useState } from 'react';
import { GEOMETRIC_SHAPES } from '../utils/shapeGenerators';
import { GestureDetectionResult, User, ActiveSection, ShapeDefinition } from '../types';
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
  LogOut,
  Hash,
  Lock,
  PawPrint,
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
  user: User | null;
  onLogout: () => void;
  activeSection: ActiveSection;
  onSelectSection: (section: ActiveSection) => void;
  activeShapes: ShapeDefinition[];
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
  user,
  onLogout,
  activeSection,
  onSelectSection,
  activeShapes,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const safeIndex = Math.max(0, Math.min(currentShapeIndex, activeShapes.length - 1));
  const activeShape = activeShapes[safeIndex] || activeShapes[0] || GEOMETRIC_SHAPES[0];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const getShapeIcon = (shape: ShapeDefinition, index: number) => {
    if (activeSection === 'numbers') {
      return (
        <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center font-mono font-bold text-[10px]">
          {index + 1}
        </span>
      );
    }
    if (activeSection === 'animals') {
      const animalEmojis: Record<string, string> = {
        'animal-lion': '🦁',
        'animal-elephant': '🐘',
        'animal-dolphin': '🐬',
        'animal-eagle': '🦅',
        'animal-wolf': '🐺',
        'animal-butterfly': '🦋',
        'animal-cat': '🐱',
        'animal-bear': '🐻',
        'animal-turtle': '🐢',
        'animal-horse': '🐴',
      };
      return (
        <span className="text-xs leading-none">
          {animalEmojis[shape.id] || '🐾'}
        </span>
      );
    }
    switch (shape.id) {
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
        {/* Left: App Title & Active Shape/Number Info */}
        <div className="pointer-events-auto bg-neutral-900/80 backdrop-blur-md border border-white/10 p-3.5 sm:p-4 rounded-2xl shadow-xl max-w-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-1.5">
              Partículas 4D con Gestos
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                4D
              </span>
            </h1>
          </div>

          {/* Section Switcher Tabs: Figuras Geométricas vs Números 4D vs 10 Animales */}
          <div className="flex rounded-xl bg-neutral-950/80 p-1 border border-white/10 mt-2.5 gap-0.5">
            <button
              id="section-shapes-btn"
              type="button"
              onClick={() => onSelectSection('shapes')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                activeSection === 'shapes'
                  ? 'bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Figuras 4D</span>
            </button>
            <button
              id="section-numbers-btn"
              type="button"
              onClick={() => onSelectSection('numbers')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                activeSection === 'numbers'
                  ? 'bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Hash className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Números 4D</span>
            </button>
            <button
              id="section-animals-btn"
              type="button"
              onClick={() => onSelectSection('animals')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                activeSection === 'animals'
                  ? 'bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <PawPrint className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Animales 4D</span>
            </button>
          </div>

          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              {currentShapeIndex + 1} / {activeShapes.length}
            </span>
            <span className="text-sm font-semibold text-neutral-100">
              {activeShape.name}
            </span>
            {activeSection === 'numbers' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-xs">
                <Lock className="w-2.5 h-2.5" />
                Fijo frontal · Resonancia 4D
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-xs">
                <InfinityIcon className="w-2.5 h-2.5" />
                Rotación 4D en XW/ZW/YW
              </span>
            )}
          </div>

          <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
            {activeShape.description}
          </p>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* User Profile Badge & Logout */}
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-white/10 backdrop-blur-md shadow-lg">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold uppercase border border-cyan-500/30">
                {user.username.slice(0, 2)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-neutral-200 leading-none">
                  {user.name || user.username}
                </p>
                <p className="text-[10px] text-neutral-400 leading-none mt-0.5">
                  @{user.username}
                </p>
              </div>
              <button
                id="logout-btn"
                onClick={onLogout}
                className="p-1 rounded-md text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition ml-0.5 cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

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
              <span>Velocidad de Giro 4D / 3D</span>
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
                <strong className="text-white block font-semibold">Deslizar la Mano (Swipe)</strong>
                <span className="text-neutral-400">Desliza la mano horizontalmente hacia la derecha para avanzar al siguiente elemento en 3D (figura, número o animal), o a la izquierda para retroceder.</span>
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

      {/* Bottom Control Bar: Interactive Slider & Navigation */}
      <footer className="w-full flex flex-col items-center gap-3">
        {/* Quick Selector Pills */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto max-w-full px-2 py-1 scrollbar-none">
          {activeShapes.map((shape, idx) => (
            <button
              key={shape.id}
              onClick={() => onSelectShape(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 backdrop-blur-md cursor-pointer ${
                idx === safeIndex
                  ? 'bg-cyan-500 text-neutral-950 font-semibold shadow-md shadow-cyan-500/30 scale-105'
                  : 'bg-neutral-900/80 text-neutral-400 border border-white/10 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {getShapeIcon(shape, idx)}
              <span>
                {activeSection === 'numbers'
                  ? `Nº ${idx + 1}`
                  : activeSection === 'animals'
                  ? `${idx + 1}. ${shape.name}`
                  : `${idx + 1}. ${shape.name}`}
              </span>
            </button>
          ))}
        </div>

        {/* Main Interactive Shape / Number / Animal Slider Container */}
        <div className="pointer-events-auto w-full max-w-2xl bg-neutral-900/85 backdrop-blur-xl border border-white/15 p-4 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between gap-3 mb-2">
            {/* Previous Button */}
            <button
              id="prev-shape-btn"
              onClick={() => onSelectShape((safeIndex - 1 + activeShapes.length) % activeShapes.length)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-semibold transition border border-white/10 cursor-pointer"
              title={
                activeSection === 'numbers'
                  ? 'Número Anterior (o deslizar mano 👈)'
                  : activeSection === 'animals'
                  ? 'Animal Anterior (o deslizar mano 👈)'
                  : 'Figura Anterior (o deslizar mano 👈)'
              }
            >
              <ChevronLeft className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            {/* Current Item Indicator Label */}
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 block">
                {activeSection === 'numbers'
                  ? `Número ${safeIndex + 1} de ${activeShapes.length}`
                  : activeSection === 'animals'
                  ? `Animal ${safeIndex + 1} de ${activeShapes.length}`
                  : `Figura ${safeIndex + 1} de ${activeShapes.length}`}
              </span>
              <span className="text-sm font-bold text-white">
                {activeShape.name}
              </span>
            </div>

            {/* Next Button */}
            <button
              id="next-shape-btn"
              onClick={() => onSelectShape((safeIndex + 1) % activeShapes.length)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-semibold transition border border-white/10 cursor-pointer"
              title={
                activeSection === 'numbers'
                  ? 'Siguiente Número (o deslizar mano 👉)'
                  : activeSection === 'animals'
                  ? 'Siguiente Animal (o deslizar mano 👉)'
                  : 'Siguiente Figura (o deslizar mano 👉)'
              }
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>

          {/* Interactive Range Slider */}
          <div className="relative pt-2 pb-1">
            <input
              id="shape-slider"
              type="range"
              min="0"
              max={activeShapes.length - 1}
              step="1"
              value={safeIndex}
              onChange={(e) => onSelectShape(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-neutral-800 rounded-lg appearance-none"
            />

            {/* Slider Step Tick Marks */}
            <div className="flex justify-between items-center px-1 mt-1.5 text-[10px] font-mono text-neutral-500 overflow-x-auto">
              {activeShapes.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectShape(idx)}
                  className={`min-w-[14px] text-center cursor-pointer transition-colors ${
                    activeShapes.length > 10 ? 'text-[9px]' : 'text-[10px]'
                  } ${
                    idx === safeIndex
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
