import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GestureDetectionResult } from '../types';
import { Camera, CameraOff, AlertCircle, MoveRight, MoveLeft } from 'lucide-react';

interface HandTrackerProps {
  onGesture: (result: GestureDetectionResult) => void;
  onNextShape: () => void;
  onPrevShape?: () => void;
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
  const [actionFeedback, setActionFeedback] = useState<{
    label: string;
    icon: string;
    direction: 'next' | 'prev';
  } | null>(null);
  const [isHandPresent, setIsHandPresent] = useState(false);

  // History tracking for slide/swipe gesture detection
  const historyRef = useRef<{ x: number; time: number }[]>([]);
  const lastActionTimeRef = useRef<number>(0);
  const actionCooldown = 650; // ms between transitions

  const triggerNext = useCallback((label: string, icon: string) => {
    const now = performance.now();
    if (now - lastActionTimeRef.current < actionCooldown) return;
    lastActionTimeRef.current = now;
    historyRef.current = [];
    setActionFeedback({ label, icon, direction: 'next' });
    onNextShape();
    setTimeout(() => setActionFeedback(null), 650);
  }, [onNextShape]);

  const triggerPrev = useCallback((label: string, icon: string) => {
    const now = performance.now();
    if (now - lastActionTimeRef.current < actionCooldown) return;
    lastActionTimeRef.current = now;
    historyRef.current = [];
    setActionFeedback({ label, icon, direction: 'prev' });
    if (onPrevShape) {
      onPrevShape();
    }
    setTimeout(() => setActionFeedback(null), 650);
  }, [onPrevShape]);

  // Check slide/swipe gesture across frame
  const checkSlide = useCallback((x: number, now: number) => {
    const history = historyRef.current;
    history.push({ x, time: now });

    while (history.length > 0 && now - history[0].time > 350) {
      history.shift();
    }

    if (now - lastActionTimeRef.current < actionCooldown) {
      return;
    }

    if (history.length >= 3) {
      const oldest = history[0];
      const deltaX = x - oldest.x;
      const deltaTime = (now - oldest.time) / 1000;
      const velocity = deltaX / (deltaTime || 0.001);

      // Slide hand to the right -> Next shape/number
      if (deltaX > 0.18 || velocity > 0.9) {
        triggerNext('Siguiente (Deslizar 👉)', '👉');
      }
      // Slide hand to the left -> Previous shape/number
      else if (deltaX < -0.18 || velocity < -0.9) {
        triggerPrev('Anterior (Deslizar 👈)', '👈');
      }
    }
  }, [triggerNext, triggerPrev]);

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
        // Poll gracefully until external MediaPipe scripts finish loading
        let attempts = 0;
        while ((!(window as any).Hands || !(window as any).Camera) && attempts < 40) {
          if (!isMounted) return;
          await new Promise((r) => setTimeout(r, 250));
          attempts++;
        }

        const HandsClass = (window as any).Hands;
        const CameraClass = (window as any).Camera;

        if (!HandsClass || !CameraClass) {
          throw new Error('No se pudieron cargar las bibliotecas de MediaPipe. Revisa tu conexión a internet.');
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

            // Landmark distance helper
            const dist = (p1: any, p2: any) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

            // Palm center / wrist
            const wrist = landmarks[0];
            const middleBase = landmarks[9];
            const handCenterX = 1 - (wrist.x + middleBase.x) / 2; // mirror
            const handCenterY = (wrist.y + middleBase.y) / 2;

            // Distance from wrist to all 4 fingertips
            const tipIndices = [8, 12, 16, 20];
            let avgTipDist = 0;
            tipIndices.forEach((idx) => {
              const tip = landmarks[idx];
              avgTipDist += Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
            });
            avgTipDist /= 4;

            // Pinch distance between thumb (4) and index tip (8)
            const pinchDist = dist(landmarks[4], landmarks[8]);
            const isPinch = pinchDist < 0.048;

            // Extension check for each finger compared to its PIP joint
            const isMiddleExtended = dist(wrist, landmarks[12]) > dist(wrist, landmarks[10]) * 1.25;
            const isRingExtended = dist(wrist, landmarks[16]) > dist(wrist, landmarks[14]) * 1.25;
            const isPinkyExtended = dist(wrist, landmarks[20]) > dist(wrist, landmarks[18]) * 1.25;

            // Openness metric (0 = tight fist, 1 = wide open)
            const openness = Math.min(Math.max((avgTipDist - 0.18) / 0.28, 0), 1);

            // Check slide/swipe gesture across frame for shape/number transition
            checkSlide(handCenterX, performance.now());

            let label = 'Mano detectada';
            let gestureType: GestureDetectionResult['gesture'] = 'none';

            // GESTURE RECOGNITION:
            // 1) Closed fist: Contract particles
            if (openness < 0.26) {
              label = '✊ Puño (Contraer)';
              gestureType = 'fist';
            }
            // 2) Wide open hand: Expand particles
            else if (openness > 0.65) {
              label = '🖐️ Abierta (Expandir)';
              gestureType = 'open_hand';
            }
            // 3) Pinch is passive
            else if (isPinch) {
              label = '👌 Pellizco';
              gestureType = 'pinch';
            } else {
              label = '👋 Mano detectada (Desliza para cambiar)';
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
          let userFriendlyMessage = 'No se pudo acceder a la cámara.';
          const rawMsg = err?.message || '';
          if (err?.name === 'NotAllowedError' || rawMsg.includes('Permission denied') || rawMsg.includes('permission')) {
            userFriendlyMessage = 'Permiso de cámara no concedido. Puedes usar los controles táctiles o de ratón.';
          } else if (err?.name === 'NotFoundError' || rawMsg.includes('DevicesNotFoundError')) {
            userFriendlyMessage = 'No se detectó cámara en tu dispositivo. Puedes usar los controles manuales.';
          } else if (err?.name === 'NotReadableError') {
            userFriendlyMessage = 'La cámara está ocupada por otra app.';
          } else if (rawMsg) {
            userFriendlyMessage = rawMsg;
          }
          setErrorMsg(userFriendlyMessage);
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
  }, [enabled, onGesture, checkSlide]);

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
            <div className="absolute inset-0 bg-neutral-950/95 p-3 flex flex-col items-center justify-center text-center gap-1.5 text-rose-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-[11px] text-neutral-200 leading-tight">{errorMsg}</p>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => {
                    setErrorMsg(null);
                    onToggleEnabled();
                    setTimeout(() => onToggleEnabled(), 100);
                  }}
                  className="text-[10px] px-2 py-0.5 rounded bg-cyan-600/30 text-cyan-300 hover:bg-cyan-600/50 transition cursor-pointer"
                >
                  Reintentar
                </button>
                <button
                  onClick={() => {
                    setErrorMsg(null);
                    onToggleEnabled();
                  }}
                  className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 hover:text-white transition cursor-pointer"
                >
                  Ocultar cámara
                </button>
              </div>
            </div>
          )}

          {/* Gesture Action Alert Flash */}
          {actionFeedback && (
            <div className="absolute inset-0 bg-cyan-500/25 backdrop-blur-[2px] flex items-center justify-center z-10 animate-fade-in">
              <div className="bg-neutral-950/90 border border-cyan-400 text-cyan-300 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold shadow-xl scale-105">
                <span className="text-base leading-none">{actionFeedback.icon}</span>
                <span>{actionFeedback.label}</span>
                {actionFeedback.direction === 'next' ? (
                  <MoveRight className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <MoveLeft className="w-3.5 h-3.5 text-cyan-400" />
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
          <div className="mt-1.5 text-[10px] text-neutral-400 flex items-center justify-center gap-1.5 flex-wrap">
            <span className="text-cyan-300 font-medium">👉 Deslizar derecha: Siguiente</span>
            <span>•</span>
            <span className="text-cyan-300 font-medium">👈 Deslizar izq: Anterior</span>
          </div>
        </div>
      </div>
    </div>
  );
};
