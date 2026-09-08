import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GestureDetectionResult } from '../types';
import { Camera, CameraOff, Sparkles, MoveRight, MoveLeft, Hand, AlertCircle } from 'lucide-react';

interface HandTrackerProps {
  onGesture: (result: GestureDetectionResult) => void;
  onNextShape: () => void;
  onPrevShape: () => void;
  enabled: boolean;
  onToggleEnabled: () => void;
}

export const HandTracker: React.FC<HandTrackerProps> = ({
  onGesture,
  onNextShape,
  onPrevShape,
  enabled,
  onToggleEnabled,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraInstanceRef = useRef<any>(null);
  const handsInstanceRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentGestureName, setCurrentGestureName] = useState<string>('Esperando mano...');
  const [swipeFeedback, setSwipeFeedback] = useState<'right' | 'left' | null>(null);
  const [isHandPresent, setIsHandPresent] = useState(false);

  // Position tracking for swipe detection
  const historyRef = useRef<{ x: number; time: number }[]>([]);
  const lastSwipeTimeRef = useRef<number>(0);
  const swipeCooldown = 800; // ms

  // Check and trigger swipe gestures
  const checkSwipe = useCallback((x: number, now: number) => {
    const history = historyRef.current;
    history.push({ x, time: now });

    // Keep history within last 400ms
    while (history.length > 0 && now - history[0].time > 400) {
      history.shift();
    }

    if (now - lastSwipeTimeRef.current < swipeCooldown) {
      return;
    }

    if (history.length >= 3) {
      const oldest = history[0];
      const deltaX = x - oldest.x;
      const deltaTime = (now - oldest.time) / 1000;
      const velocity = deltaX / (deltaTime || 0.001);

      // In mirrored coordinates:
      // moving hand to physical right means x goes from left to right (deltaX > 0.22)
      if (deltaX > 0.25 || velocity > 1.2) {
        lastSwipeTimeRef.current = now;
        setSwipeFeedback('right');
        onNextShape();
        setTimeout(() => setSwipeFeedback(null), 700);
      } else if (deltaX < -0.25 || velocity < -1.2) {
        lastSwipeTimeRef.current = now;
        setSwipeFeedback('left');
        onPrevShape();
        setTimeout(() => setSwipeFeedback(null), 700);
      }
    }
  }, [onNextShape, onPrevShape]);

  // Initialize MediaPipe Hands
  useEffect(() => {
    if (!enabled) {
      if (cameraInstanceRef.current) {
        try {
          cameraInstanceRef.current.stop();
        } catch {
          // ignore
        }
        cameraInstanceRef.current = null;
      }
      setIsHandPresent(false);
      setCurrentGestureName('Cámara desactivada');
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setErrorMsg(null);

    const initMediaPipe = async () => {
      try {
        const HandsClass = (window as any).Hands;
        const CameraClass = (window as any).Camera;

        if (!HandsClass || !CameraClass) {
          throw new Error('Bibliotecas de MediaPipe cargando. Por favor espere.');
        }

        if (!videoRef.current) return;

        const hands = new HandsClass({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results: any) => {
          if (!isMounted) return;

          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');

          if (canvas && ctx && videoRef.current) {
            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw video frame mirrored
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

            // Draw skeleton & landmarks if present
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
              const landmarks = results.multiHandLandmarks[0];

              // Connect lines
              ctx.strokeStyle = '#06b6d4';
              ctx.lineWidth = 2;
              const connections = [
                [0, 1], [1, 2], [2, 3], [3, 4], // thumb
                [0, 5], [5, 6], [6, 7], [7, 8], // index
                [0, 9], [9, 10], [10, 11], [11, 12], // middle
                [0, 13], [13, 14], [14, 15], [15, 16], // ring
                [0, 17], [17, 18], [18, 19], [19, 20], // pinky
                [5, 9], [9, 13], [13, 17] // palm
              ];

              connections.forEach(([i, j]) => {
                const p1 = landmarks[i];
                const p2 = landmarks[j];
                ctx.beginPath();
                ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
                ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
                ctx.stroke();
              });

              // Draw dots
              landmarks.forEach((pt: any, idx: number) => {
                ctx.beginPath();
                ctx.arc(pt.x * canvas.width, pt.y * canvas.height, idx === 4 || idx === 8 ? 5 : 3, 0, 2 * Math.PI);
                ctx.fillStyle = idx === 4 || idx === 8 ? '#f59e0b' : '#38bdf8';
                ctx.fill();
              });
            }
            ctx.restore();
          }

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            setIsHandPresent(true);

            // Palm center / wrist
            const wrist = landmarks[0];
            const middleBase = landmarks[9];
            const handCenterX = 1 - (wrist.x + middleBase.x) / 2; // mirror
            const handCenterY = (wrist.y + middleBase.y) / 2;

            // Compute distance from wrist to all 4 fingertips (8, 12, 16, 20)
            const tipIndices = [8, 12, 16, 20];
            let avgTipDist = 0;
            tipIndices.forEach((idx) => {
              const tip = landmarks[idx];
              avgTipDist += Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
            });
            avgTipDist /= 4;

            // Distance between thumb (4) and index tip (8)
            const pinchDist = Math.hypot(
              landmarks[4].x - landmarks[8].x,
              landmarks[4].y - landmarks[8].y
            );

            // Openness metric (0.15 = tight fist, 0.45+ = wide open)
            const openness = Math.min(Math.max((avgTipDist - 0.18) / 0.28, 0), 1);

            // Check swipe motion with mirrored X
            const now = performance.now();
            checkSwipe(handCenterX, now);

            let label = 'Mano detectada';
            let gestureType: GestureDetectionResult['gesture'] = 'none';

            if (pinchDist < 0.055) {
              label = '👌 Pellizco (Pinch)';
              gestureType = 'pinch';
            } else if (openness < 0.28) {
              label = '✊ Puño (Contraer)';
              gestureType = 'fist';
            } else if (openness > 0.65) {
              label = '🖐️ Abierta (Expandir)';
              gestureType = 'open_hand';
            } else {
              label = '👋 Mano neutral';
            }

            setCurrentGestureName(label);

            onGesture({
              gesture: gestureType,
              label,
              handDetected: true,
              handX: handCenterX,
              handY: handCenterY,
              pinchDistance: pinchDist,
              openness,
            });
          } else {
            setIsHandPresent(false);
            setCurrentGestureName('Muestra tu mano frente a la cámara');
            onGesture({
              gesture: 'none',
              label: 'Sin mano',
              handDetected: false,
              handX: 0.5,
              handY: 0.5,
              pinchDistance: 0.2,
              openness: 0.5,
            });
          }
        });

        const cameraFeed = new CameraClass(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && hands) {
              try {
                await hands.send({ image: videoRef.current });
              } catch {
                // handle occasional frame abort
              }
            }
          },
          width: 320,
          height: 240,
        });

        await cameraFeed.start();
        cameraInstanceRef.current = cameraFeed;
        handsInstanceRef.current = hands;
        if (isMounted) setIsLoading(false);
      } catch (err: any) {
        console.error('Error starting camera/hands:', err);
        if (isMounted) {
          setErrorMsg(err?.message || 'No se pudo acceder a la cámara');
          setIsLoading(false);
        }
      }
    };

    initMediaPipe();

    return () => {
      isMounted = false;
      if (cameraInstanceRef.current) {
        try {
          cameraInstanceRef.current.stop();
        } catch {
          // ignore
        }
        cameraInstanceRef.current = null;
      }
    };
  }, [enabled, checkSwipe, onGesture]);

  return (
    <div id="gesture-tracker-container" className="relative group">
      {/* Video feed corner panel */}
      <div className="relative overflow-hidden rounded-xl border border-white/15 bg-neutral-900/80 backdrop-blur-md shadow-2xl p-2 transition-all duration-300 w-56 sm:w-64">
        <div className="flex items-center justify-between pb-1.5 px-1 border-b border-white/10 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-neutral-200">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                enabled
                  ? isHandPresent
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-amber-400'
                  : 'bg-neutral-500'
              }`}
            />
            <span>Control Gestual</span>
          </div>
          <button
            id="toggle-camera-btn"
            onClick={onToggleEnabled}
            className={`p-1 rounded-md transition-colors ${
              enabled
                ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title={enabled ? 'Apagar cámara' : 'Activar cámara'}
          >
            {enabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Video Canvas viewport */}
        <div className="relative mt-2 aspect-4/3 w-full bg-neutral-950 rounded-lg overflow-hidden flex items-center justify-center border border-white/5">
          {/* Hidden raw video element */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="hidden"
          />

          {/* Rendered canvas with hand skeleton */}
          <canvas
            ref={canvasRef}
            width={320}
            height={240}
            className={`w-full h-full object-cover ${!enabled ? 'hidden' : 'block'}`}
          />

          {/* Camera Disabled State */}
          {!enabled && (
            <div className="flex flex-col items-center justify-center p-3 text-center text-neutral-400 gap-1.5">
              <CameraOff className="w-7 h-7 text-neutral-500" />
              <p className="text-xs">Cámara apagada</p>
              <button
                onClick={onToggleEnabled}
                className="mt-1 text-xs px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md font-medium transition shadow-sm"
              >
                Activar Gestos
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {enabled && isLoading && (
            <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-cyan-400">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-[11px] text-neutral-300">Iniciando MediaPipe...</span>
            </div>
          )}

          {/* Error Message */}
          {enabled && errorMsg && (
            <div className="absolute inset-0 bg-neutral-950/90 p-3 flex flex-col items-center justify-center text-center gap-1.5 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <p className="text-[11px] text-neutral-200 leading-tight">{errorMsg}</p>
              <button
                onClick={() => {
                  setErrorMsg(null);
                  onToggleEnabled();
                  setTimeout(() => onToggleEnabled(), 100);
                }}
                className="text-[10px] text-cyan-400 underline mt-1"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Swipe Detection Alert Flash */}
          {swipeFeedback && (
            <div className="absolute inset-0 bg-cyan-500/30 backdrop-blur-[2px] flex items-center justify-center animate-ping">
              <div className="bg-neutral-950/90 border border-cyan-400 text-cyan-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold shadow-lg">
                {swipeFeedback === 'right' ? (
                  <>
                    <span>Siguiente</span>
                    <MoveRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <MoveLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="mt-2 text-center">
          <div className="text-xs font-semibold text-neutral-200 py-1 px-2 rounded-md bg-white/5 truncate">
            {currentGestureName}
          </div>
          <div className="mt-1 text-[10px] text-neutral-400 flex items-center justify-center gap-2">
            <span>👉 Mueve a la derecha: Sig.</span>
            <span>•</span>
            <span>👈 A la izq: Ant.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
