import { ShapeDefinition } from '../types';

export const PARTICLE_COUNT = 16000;

// 1. Hiperesfera 4D (Glome / 3-Sphere en R^4)
function generateSphere(count: number): Float32Array {
  const positions = new Float32Array(count * 4);
  const R = 2.4;

  for (let i = 0; i < count; i++) {
    // Uniform sampling on S^3 using Hopf coordinates
    const u1 = Math.random();
    const u2 = Math.random();
    const u3 = Math.random();
    const theta1 = 2 * Math.PI * u1;
    const theta2 = 2 * Math.PI * u2;
    const r1 = Math.sqrt(1 - u3);
    const r2 = Math.sqrt(u3);

    const r = R * (0.92 + Math.random() * 0.16);
    const idx = i * 4;
    positions[idx] = r * r1 * Math.cos(theta1);
    positions[idx + 1] = r * r1 * Math.sin(theta1);
    positions[idx + 2] = r * r2 * Math.cos(theta2);
    positions[idx + 3] = r * r2 * Math.sin(theta2);
  }
  return positions;
}

// 2. Teseracto 4D (Hipercubo / 8-cell)
function generateCube(count: number): Float32Array {
  const positions = new Float32Array(count * 4);
  const size = 3.2;
  const half = size / 2;

  for (let i = 0; i < count; i++) {
    const idx = i * 4;
    const choice = Math.random();

    if (choice < 0.72) {
      // One of the 8 bounding hypercubical cells of the 4D tesseract
      const fixedAxis = Math.floor(Math.random() * 4);
      const fixedSign = Math.random() < 0.5 ? 1 : -1;
      const u = (Math.random() - 0.5) * size;
      const v = (Math.random() - 0.5) * size;
      const s = (Math.random() - 0.5) * size;

      if (fixedAxis === 0) {
        positions[idx] = half * fixedSign;
        positions[idx + 1] = u;
        positions[idx + 2] = v;
        positions[idx + 3] = s;
      } else if (fixedAxis === 1) {
        positions[idx] = u;
        positions[idx + 1] = half * fixedSign;
        positions[idx + 2] = v;
        positions[idx + 3] = s;
      } else if (fixedAxis === 2) {
        positions[idx] = u;
        positions[idx + 1] = v;
        positions[idx + 2] = half * fixedSign;
        positions[idx + 3] = s;
      } else {
        positions[idx] = u;
        positions[idx + 1] = v;
        positions[idx + 2] = s;
        positions[idx + 3] = half * fixedSign;
      }
    } else {
      // 4D internal hypervolume lattice
      positions[idx] = (Math.random() - 0.5) * size * 0.85;
      positions[idx + 1] = (Math.random() - 0.5) * size * 0.85;
      positions[idx + 2] = (Math.random() - 0.5) * size * 0.85;
      positions[idx + 3] = (Math.random() - 0.5) * size * 0.85;
    }
  }
  return positions;
}

// 3. Toro de Clifford 4D (Duocilindro en R^4)
function generateTorus(count: number): Float32Array {
  const positions = new Float32Array(count * 4);
  const R1 = 1.85;
  const R2 = 1.85;

  for (let i = 0; i < count; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI * 2;
    const j1 = 0.88 + Math.random() * 0.24;
    const j2 = 0.88 + Math.random() * 0.24;

    const idx = i * 4;
    positions[idx] = R1 * j1 * Math.cos(u);
    positions[idx + 1] = R1 * j1 * Math.sin(u);
    positions[idx + 2] = R2 * j2 * Math.cos(v);
    positions[idx + 3] = R2 * j2 * Math.sin(v);
  }
  return positions;
}

// 4. Nudo Toroidal 4D
function generateTorusKnot(count: number): Float32Array {
  const positions = new Float32Array(count * 4);
  const p = 2;
  const q = 3;
  const tubeRadius = 0.45;

  for (let i = 0; i < count; i++) {
    const t = Math.random() * Math.PI * 2;
    const angle = Math.random() * Math.PI * 2;
    const rTube = tubeRadius * (0.7 + Math.random() * 0.6);

    const r = 1.8 + 0.8 * Math.cos(q * t);
    const cx = r * Math.cos(p * t);
    const cy = r * Math.sin(p * t);
    const cz = -0.9 * Math.sin(q * t);

    const nx = Math.cos(angle) * rTube;
    const ny = Math.sin(angle) * rTube;

    const idx = i * 4;
    positions[idx] = cx + nx;
    positions[idx + 1] = cz + ny;
    positions[idx + 2] = cy;
    positions[idx + 3] = Math.cos(q * t + angle) * 0.95;
  }
  return positions;
}

// 5. Hipercilindro 4D (Spherinder)
function generateCylinder(count: number): Float32Array {
  const positions = new Float32Array(count * 4);
  const radius = 1.8;
  const height = 3.6;
  const hyperDepth = 2.0;

  for (let i = 0; i < count; i++) {
    const idx = i * 4;
    const theta = Math.random() * Math.PI * 2;
    const r = radius * (0.92 + Math.random() * 0.16);
    const y = (Math.random() - 0.5) * height;
    const w = (Math.random() - 0.5) * hyperDepth;

    positions[idx] = r * Math.cos(theta);
    positions[idx + 1] = y;
    positions[idx + 2] = r * Math.sin(theta);
    positions[idx + 3] = w;
  }
  return positions;
}

// 6. Hipercono Doble 4D
function generateHourglass(count: number): Float32Array {
  const positions = new Float32Array(count * 4);
  const totalH = 4.2;
  const maxR = 2.2;

  for (let i = 0; i < count; i++) {
    const idx = i * 4;
    const y = (Math.random() - 0.5) * totalH;
    const normalizedY = Math.abs(y) / (totalH / 2);
    const currentR = normalizedY * maxR * (0.85 + Math.random() * 0.3);
    const angle1 = Math.random() * Math.PI * 2;
    const angle2 = Math.random() * Math.PI * 2;
    const hyperR = currentR * 0.7;

    positions[idx] = currentR * Math.cos(angle1);
    positions[idx + 1] = y;
    positions[idx + 2] = currentR * Math.sin(angle1);
    positions[idx + 3] = hyperR * Math.sin(angle2);
  }
  return positions;
}

// 7. Pentácoron 4D (5-cell Regular Simplex)
function generatePyramid(count: number): Float32Array {
  const positions = new Float32Array(count * 4);
  const vertices = [
    [1, 1, 1, -1 / Math.sqrt(5)],
    [1, -1, -1, -1 / Math.sqrt(5)],
    [-1, 1, -1, -1 / Math.sqrt(5)],
    [-1, -1, 1, -1 / Math.sqrt(5)],
    [0, 0, 0, Math.sqrt(5) - 1 / Math.sqrt(5)],
  ];
  const scale = 1.9;

  for (let i = 0; i < count; i++) {
    const idx = i * 4;
    const v1Idx = Math.floor(Math.random() * 5);
    let v2Idx = Math.floor(Math.random() * 5);
    while (v2Idx === v1Idx) v2Idx = Math.floor(Math.random() * 5);

    const t = Math.random();
    const v1 = vertices[v1Idx];
    const v2 = vertices[v2Idx];

    const jitter = 0.08;
    positions[idx] = (v1[0] + (v2[0] - v1[0]) * t) * scale + (Math.random() - 0.5) * jitter;
    positions[idx + 1] = (v1[1] + (v2[1] - v1[1]) * t) * scale + (Math.random() - 0.5) * jitter;
    positions[idx + 2] = (v1[2] + (v2[2] - v1[2]) * t) * scale + (Math.random() - 0.5) * jitter;
    positions[idx + 3] = (v1[3] + (v2[3] - v1[3]) * t) * scale + (Math.random() - 0.5) * jitter;
  }
  return positions;
}

// 8. Botella de Klein 4D (Inmersión sin auto-intersección en R^4)
function generateMobiusStrip(count: number): Float32Array {
  const positions = new Float32Array(count * 4);
  const R = 2.0;

  for (let i = 0; i < count; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI * 2;

    const x = (R + Math.cos(u / 2) * Math.sin(v) - Math.sin(u / 2) * Math.sin(2 * v)) * Math.cos(u);
    const y = (R + Math.cos(u / 2) * Math.sin(v) - Math.sin(u / 2) * Math.sin(2 * v)) * Math.sin(u);
    const z = Math.sin(u / 2) * Math.sin(v) + Math.cos(u / 2) * Math.sin(2 * v);
    const w = 1.3 * Math.cos(v);

    const idx = i * 4;
    positions[idx] = x;
    positions[idx + 1] = z;
    positions[idx + 2] = y;
    positions[idx + 3] = w;
  }
  return positions;
}

// 9. Doble Hélice 4D
function generateDNA(count: number): Float32Array {
  const positions = new Float32Array(count * 4);
  const totalLength = 4.8;
  const radius = 1.5;
  const turns = 2.8;

  for (let i = 0; i < count; i++) {
    const idx = i * 4;
    const choice = Math.random();
    const t = Math.random();
    const y = (t - 0.5) * totalLength;
    const angle = t * Math.PI * 2 * turns;

    if (choice < 0.42) {
      const r = radius * (0.92 + Math.random() * 0.16);
      positions[idx] = r * Math.cos(angle);
      positions[idx + 1] = y;
      positions[idx + 2] = r * Math.sin(angle);
      positions[idx + 3] = 0.8 * Math.cos(2 * angle);
    } else if (choice < 0.84) {
      const r = radius * (0.92 + Math.random() * 0.16);
      positions[idx] = -r * Math.cos(angle);
      positions[idx + 1] = y;
      positions[idx + 2] = -r * Math.sin(angle);
      positions[idx + 3] = -0.8 * Math.cos(2 * angle);
    } else {
      const u = (Math.random() - 0.5) * 2;
      positions[idx] = radius * u * Math.cos(angle);
      positions[idx + 1] = y;
      positions[idx + 2] = radius * u * Math.sin(angle);
      positions[idx + 3] = u * 0.5 * Math.sin(angle);
    }
  }
  return positions;
}

// 10. Galaxia Espiral 4D
function generateGalaxy(count: number): Float32Array {
  const positions = new Float32Array(count * 4);
  const arms = 4;
  const maxRadius = 3.6;

  for (let i = 0; i < count; i++) {
    const idx = i * 4;
    const arm = Math.floor(Math.random() * arms);
    const r = Math.pow(Math.random(), 1.5) * maxRadius;
    const armOffset = (arm * 2 * Math.PI) / arms;
    const spin = r * 1.8;
    const dispersion = (Math.random() - 0.5) * 0.35 * (1 + r * 0.4);

    const angle = armOffset + spin + dispersion;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const verticalSpread = Math.exp(-r * 0.8) * 0.7 + 0.12;
    const y = (Math.random() - 0.5) * verticalSpread;
    const w = (Math.random() - 0.5) * (0.4 + (1 - r / maxRadius) * 1.2);

    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;
    positions[idx + 3] = w;
  }
  return positions;
}

export const GEOMETRIC_SHAPES: ShapeDefinition[] = [
  {
    id: 'sphere',
    name: 'Hiperesfera 4D (Glome)',
    description: 'Proyección isoclínica de una 3-esfera uniforme en R^4 distribuida en hipersuperficie armónica.',
    iconName: 'Circle',
    generate: generateSphere,
  },
  {
    id: 'cube',
    name: 'Teseracto 4D (8-Cell)',
    description: 'Policoro regular de 8 celdas cúbicas hiperdimensionales que pliegan su hipervolumen en 4D.',
    iconName: 'Box',
    generate: generateCube,
  },
  {
    id: 'torus',
    name: 'Toro de Clifford 4D',
    description: 'Duocilindro plano en R^4 embebido en la hiperesfera con doble ángulo de rotación independiente.',
    iconName: 'Disc',
    generate: generateTorus,
  },
  {
    id: 'knot',
    name: 'Nudo Toroidal 4D',
    description: 'Curva hiperdimensional entrelazada en R^4 con modulación armónica a través de la cuarta coordenada.',
    iconName: 'Activity',
    generate: generateTorusKnot,
  },
  {
    id: 'cylinder',
    name: 'Hipercilindro 4D (Spherinder)',
    description: 'Cilindro esférico tetradimensional con sección transversal tridimensional extruida en 4D.',
    iconName: 'Cylinder',
    generate: generateCylinder,
  },
  {
    id: 'hourglass',
    name: 'Hipercono Doble 4D',
    description: 'Doble cono hiperdimensional simétrico convergiendo en la singularidad focal del origen 4D.',
    iconName: 'Hourglass',
    generate: generateHourglass,
  },
  {
    id: 'pyramid',
    name: 'Pentácoron 4D (5-Cell)',
    description: 'El símplice regular tetradimensional con 5 vértices, 10 aristas y 10 caras triangulares en R^4.',
    iconName: 'Triangle',
    generate: generatePyramid,
  },
  {
    id: 'mobius',
    name: 'Botella de Klein 4D',
    description: 'Superficie no orientable cerrada inmersa limpiamente en R^4 sin auto-intersecciones espaciales.',
    iconName: 'Infinity',
    generate: generateMobiusStrip,
  },
  {
    id: 'dna',
    name: 'Doble Hélice 4D',
    description: 'Estructura helicoidal doble entrelazada con enrollamiento sincrónico a través del hiperespacio.',
    iconName: 'Dna',
    generate: generateDNA,
  },
  {
    id: 'galaxy',
    name: 'Galaxia Espiral 4D',
    description: 'Vórtice estelar con 4 brazos logarítmicos y halo de materia oscura oscilando en la 4ª dimensión.',
    iconName: 'Sparkles',
    generate: generateGalaxy,
  },
];

// Cache for generated number positions to make switching instantaneous
const numberPositionsCache = new Map<number, Float32Array>();

export function generateNumberShape(num: number, count: number): Float32Array {
  if (numberPositionsCache.has(num)) {
    return new Float32Array(numberPositionsCache.get(num)!);
  }

  const positions = new Float32Array(count * 4);
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return generateSphere(count);
  }

  // Clear background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Set font styling: very bold, modern sans-serif
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 14;
  ctx.lineJoin = 'round';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const text = String(num);
  // Single digit: larger font, two digits: slightly smaller so it stays centered
  const fontSize = text.length === 1 ? 260 : 180;
  ctx.font = `900 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

  // Draw stroke for dense crisp perimeter outline + filled interior
  ctx.strokeText(text, canvas.width / 2, canvas.height / 2 + 8);
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 8);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Collect bright pixel coordinates
  const activePixels: { x: number; y: number; brightness: number }[] = [];
  const step = 2; // sample resolution
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const idx = (y * canvas.width + x) * 4;
      const b = data[idx];
      if (b > 90) {
        activePixels.push({ x, y, brightness: b });
      }
    }
  }

  if (activePixels.length === 0) {
    return generateSphere(count);
  }

  const scale = 0.019;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Extrude in 4D: Sculpted beveled front and back faces, outer chamfer, and 4th dimension hyper-layer
  for (let i = 0; i < count; i++) {
    const p = activePixels[Math.floor(Math.random() * activePixels.length)];
    // Add sub-pixel jitter
    const jitterX = (Math.random() - 0.5) * step * 1.1;
    const jitterY = (Math.random() - 0.5) * step * 1.1;

    const x = (p.x + jitterX - cx) * scale;
    const y = -(p.y + jitterY - cy) * scale; // invert Y for coordinate space

    // 3D extrusion in Z with realistic sculpted beveling
    let z: number;
    const r = Math.random();
    const isEdge = p.brightness < 200;
    const bevelDepth = isEdge ? 0.42 : 0.65;

    if (r < 0.38) {
      z = bevelDepth + (Math.random() - 0.5) * 0.1;
    } else if (r < 0.76) {
      z = -bevelDepth + (Math.random() - 0.5) * 0.1;
    } else {
      z = (Math.random() - 0.5) * (bevelDepth * 1.8);
    }

    // 4D hyper-thickness coordinate W
    const w = (Math.random() - 0.5) * (bevelDepth * 1.6);

    // Atmospheric ambient halo around number (2.5%)
    let finalX = x;
    let finalY = y;
    let finalZ = z;
    if (Math.random() < 0.025) {
      finalX += (Math.random() - 0.5) * 0.35;
      finalY += (Math.random() - 0.5) * 0.35;
      finalZ += (Math.random() - 0.5) * 0.35;
    }

    const idx = i * 4;
    positions[idx] = finalX;
    positions[idx + 1] = finalY;
    positions[idx + 2] = finalZ;
    positions[idx + 3] = w;
  }

  numberPositionsCache.set(num, positions);
  return positions;
}

// 20 volumetric 4D numbers (1 to 20)
export const NUMBER_SHAPES: ShapeDefinition[] = Array.from({ length: 20 }, (_, i) => {
  const num = i + 1;
  return {
    id: `number-${num}`,
    name: `Número ${num} (4D)`,
    description: `Configuración hiperdimensional 4D del número ${num} con extrusión isoclínica y ${PARTICLE_COUNT.toLocaleString()} partículas reactivas.`,
    iconName: 'Hash',
    generate: (count: number) => generateNumberShape(num, count),
  };
});

// Cache for generated animal positions to make switching instantaneous
const animalPositionsCache = new Map<string, Float32Array>();

function drawAnimalToCanvas(ctx: CanvasRenderingContext2D, animalId: string, width: number, height: number): { depthType: string } {
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const cx = width / 2;
  const cy = height / 2;

  switch (animalId) {
    case 'butterfly': {
      // Slender body
      ctx.beginPath();
      ctx.ellipse(cx, cy, 8, 55, 0, 0, Math.PI * 2);
      ctx.fill();
      // Head & Antennae
      ctx.beginPath();
      ctx.arc(cx, cy - 65, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy - 72);
      ctx.bezierCurveTo(cx - 20, cy - 100, cx - 45, cy - 110, cx - 55, cy - 95);
      ctx.moveTo(cx + 4, cy - 72);
      ctx.bezierCurveTo(cx + 20, cy - 100, cx + 45, cy - 110, cx + 55, cy - 95);
      ctx.stroke();

      // Upper wings
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy - 15);
      ctx.bezierCurveTo(cx - 50, cy - 100, cx - 130, cy - 115, cx - 165, cy - 65);
      ctx.bezierCurveTo(cx - 180, cy - 20, cx - 150, cy + 35, cx - 110, cy + 45);
      ctx.bezierCurveTo(cx - 60, cy + 45, cx - 20, cy + 20, cx - 6, cy + 5);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + 6, cy - 15);
      ctx.bezierCurveTo(cx + 50, cy - 100, cx + 130, cy - 115, cx + 165, cy - 65);
      ctx.bezierCurveTo(cx + 180, cy - 20, cx + 150, cy + 35, cx + 110, cy + 45);
      ctx.bezierCurveTo(cx + 60, cy + 45, cx + 20, cy + 20, cx + 6, cy + 5);
      ctx.closePath();
      ctx.fill();

      // Lower wings
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy + 10);
      ctx.bezierCurveTo(cx - 50, cy + 40, cx - 120, cy + 60, cx - 130, cy + 110);
      ctx.bezierCurveTo(cx - 135, cy + 150, cx - 80, cy + 175, cx - 45, cy + 145);
      ctx.bezierCurveTo(cx - 25, cy + 115, cx - 10, cy + 70, cx - 6, cy + 45);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + 6, cy + 10);
      ctx.bezierCurveTo(cx + 50, cy + 40, cx + 120, cy + 60, cx + 130, cy + 110);
      ctx.bezierCurveTo(cx + 135, cy + 150, cx + 80, cy + 175, cx + 45, cy + 145);
      ctx.bezierCurveTo(cx + 25, cy + 115, cx + 10, cy + 70, cx + 6, cy + 45);
      ctx.closePath();
      ctx.fill();

      return { depthType: 'butterfly' };
    }

    case 'dolphin': {
      ctx.beginPath();
      ctx.moveTo(cx + 125, cy - 20);
      ctx.bezierCurveTo(cx + 80, cy - 60, cx + 20, cy - 75, cx - 40, cy - 60);
      ctx.lineTo(cx - 48, cy - 105);
      ctx.bezierCurveTo(cx - 55, cy - 110, cx - 72, cy - 90, cx - 75, cy - 50);
      ctx.bezierCurveTo(cx - 110, cy - 35, cx - 145, cy - 5, cx - 165, cy + 25);
      ctx.lineTo(cx - 185, cy + 5);
      ctx.lineTo(cx - 175, cy + 30);
      ctx.lineTo(cx - 190, cy + 55);
      ctx.lineTo(cx - 160, cy + 38);
      ctx.bezierCurveTo(cx - 120, cy + 25, cx - 60, cy + 35, cx - 10, cy + 30);
      ctx.lineTo(cx + 15, cy + 75);
      ctx.bezierCurveTo(cx + 28, cy + 75, cx + 35, cy + 50, cx + 38, cy + 22);
      ctx.bezierCurveTo(cx + 70, cy + 15, cx + 105, cy + 5, cx + 125, cy - 20);
      ctx.closePath();
      ctx.fill();

      return { depthType: 'dolphin' };
    }

    case 'eagle': {
      ctx.beginPath();
      ctx.arc(cx, cy - 50, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy - 52);
      ctx.lineTo(cx + 34, cy - 45);
      ctx.bezierCurveTo(cx + 35, cy - 36, cx + 20, cy - 32, cx + 8, cy - 38);
      ctx.closePath();
      ctx.fill();

      // Left Wing
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy - 40);
      ctx.bezierCurveTo(cx - 70, cy - 85, cx - 130, cy - 95, cx - 180, cy - 75);
      ctx.lineTo(cx - 190, cy - 50);
      ctx.lineTo(cx - 175, cy - 35);
      ctx.lineTo(cx - 180, cy - 15);
      ctx.lineTo(cx - 160, cy - 5);
      ctx.lineTo(cx - 165, cy + 15);
      ctx.lineTo(cx - 140, cy + 22);
      ctx.bezierCurveTo(cx - 95, cy + 35, cx - 45, cy + 20, cx - 18, cy + 5);
      ctx.closePath();
      ctx.fill();

      // Right Wing
      ctx.beginPath();
      ctx.moveTo(cx + 15, cy - 40);
      ctx.bezierCurveTo(cx + 70, cy - 85, cx + 130, cy - 95, cx + 180, cy - 75);
      ctx.lineTo(cx + 190, cy - 50);
      ctx.lineTo(cx + 175, cy - 35);
      ctx.lineTo(cx + 180, cy - 15);
      ctx.lineTo(cx + 160, cy - 5);
      ctx.lineTo(cx + 165, cy + 15);
      ctx.lineTo(cx + 140, cy + 22);
      ctx.bezierCurveTo(cx + 95, cy + 35, cx + 45, cy + 20, cx + 18, cy + 5);
      ctx.closePath();
      ctx.fill();

      // Torso & Tail
      ctx.beginPath();
      ctx.ellipse(cx, cy, 26, 45, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx - 20, cy + 35);
      ctx.lineTo(cx - 50, cy + 110);
      ctx.lineTo(cx + 50, cy + 110);
      ctx.lineTo(cx + 20, cy + 35);
      ctx.closePath();
      ctx.fill();

      return { depthType: 'eagle' };
    }

    case 'lion': {
      const rays = 28;
      ctx.beginPath();
      for (let r = 0; r <= rays * 2; r++) {
        const angle = (r * Math.PI) / rays;
        const radius = r % 2 === 0 ? 125 : 85;
        const rx = cx + Math.cos(angle) * radius;
        const ry = cy - 20 + Math.sin(angle) * radius;
        if (r === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy - 20, 58, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx - 50, cy - 65, 18, 0, Math.PI * 2);
      ctx.arc(cx + 50, cy - 65, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx - 32, cy + 70, 22, 50, 0.1, 0, Math.PI * 2);
      ctx.ellipse(cx + 32, cy + 70, 22, 50, -0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx - 35, cy + 115, 20, 0, Math.PI * 2);
      ctx.arc(cx + 35, cy + 115, 20, 0, Math.PI * 2);
      ctx.fill();

      return { depthType: 'lion' };
    }

    case 'elephant': {
      ctx.beginPath();
      ctx.ellipse(cx - 45, cy + 5, 80, 65, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillRect(cx - 110, cy + 30, 26, 85);
      ctx.fillRect(cx - 75, cy + 30, 26, 85);
      ctx.fillRect(cx - 15, cy + 30, 26, 85);
      ctx.fillRect(cx + 20, cy + 30, 26, 85);

      ctx.beginPath();
      ctx.arc(cx + 55, cy - 25, 45, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx + 25, cy - 20, 32, 45, -0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.moveTo(cx + 85, cy - 10);
      ctx.bezierCurveTo(cx + 120, cy + 25, cx + 140, cy + 60, cx + 155, cy + 30);
      ctx.bezierCurveTo(cx + 165, cy + 5, cx + 145, cy - 35, cx + 130, cy - 50);
      ctx.stroke();

      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(cx + 80, cy + 8);
      ctx.quadraticCurveTo(cx + 115, cy + 15, cx + 125, cy - 10);
      ctx.stroke();

      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 120, cy - 5);
      ctx.quadraticCurveTo(cx - 135, cy + 35, cx - 130, cy + 70);
      ctx.stroke();

      return { depthType: 'elephant' };
    }

    case 'wolf': {
      ctx.beginPath();
      ctx.moveTo(cx - 120, cy + 100);
      ctx.lineTo(cx - 95, cy + 100);
      ctx.bezierCurveTo(cx - 85, cy + 50, cx - 90, cy + 15, cx - 55, cy - 10);
      ctx.bezierCurveTo(cx - 20, cy - 35, cx + 5, cy - 70, cx + 35, cy - 100);
      ctx.lineTo(cx + 42, cy - 125);
      ctx.lineTo(cx + 55, cy - 105);
      ctx.lineTo(cx + 62, cy - 120);
      ctx.lineTo(cx + 70, cy - 98);
      ctx.lineTo(cx + 125, cy - 110);
      ctx.lineTo(cx + 110, cy - 85);
      ctx.lineTo(cx + 85, cy - 75);
      ctx.bezierCurveTo(cx + 70, cy - 40, cx + 60, cy - 10, cx + 45, cy + 20);
      ctx.lineTo(cx + 40, cy + 100);
      ctx.lineTo(cx + 15, cy + 100);
      ctx.lineTo(cx + 15, cy + 45);
      ctx.bezierCurveTo(cx - 10, cy + 55, cx - 35, cy + 55, cx - 55, cy + 50);
      ctx.bezierCurveTo(cx - 90, cy + 55, cx - 135, cy + 50, cx - 145, cy + 75);
      ctx.bezierCurveTo(cx - 145, cy + 100, cx - 130, cy + 105, cx - 120, cy + 100);
      ctx.closePath();
      ctx.fill();

      return { depthType: 'wolf' };
    }

    case 'cat': {
      ctx.beginPath();
      ctx.arc(cx, cy - 45, 38, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx - 32, cy - 65);
      ctx.lineTo(cx - 30, cy - 115);
      ctx.lineTo(cx - 5, cy - 78);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + 32, cy - 65);
      ctx.lineTo(cx + 30, cy - 115);
      ctx.lineTo(cx + 5, cy - 78);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx, cy + 30, 48, 65, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx - 18, cy + 90, 14, 25, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 18, cy + 90, 14, 25, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy - 40); ctx.lineTo(cx - 75, cy - 48);
      ctx.moveTo(cx - 20, cy - 35); ctx.lineTo(cx - 80, cy - 32);
      ctx.moveTo(cx + 20, cy - 40); ctx.lineTo(cx + 75, cy - 48);
      ctx.moveTo(cx + 20, cy - 35); ctx.lineTo(cx + 80, cy - 32);
      ctx.stroke();

      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(cx + 35, cy + 85);
      ctx.bezierCurveTo(cx + 85, cy + 85, cx + 115, cy + 45, cx + 105, cy - 5);
      ctx.bezierCurveTo(cx + 98, cy - 35, cx + 75, cy - 35, cx + 72, cy - 15);
      ctx.stroke();

      return { depthType: 'cat' };
    }

    case 'bear': {
      ctx.beginPath();
      ctx.moveTo(cx - 120, cy + 85);
      ctx.lineTo(cx - 95, cy + 85);
      ctx.bezierCurveTo(cx - 80, cy + 30, cx - 65, cy - 15, cx - 25, cy - 35);
      ctx.bezierCurveTo(cx - 5, cy - 55, cx + 25, cy - 55, cx + 45, cy - 30);
      ctx.bezierCurveTo(cx + 65, cy - 25, cx + 80, cy - 15, cx + 120, cy - 10);
      ctx.lineTo(cx + 110, cy + 15);
      ctx.bezierCurveTo(cx + 85, cy + 25, cx + 60, cy + 35, cx + 45, cy + 45);
      ctx.lineTo(cx + 42, cy + 95);
      ctx.lineTo(cx + 10, cy + 95);
      ctx.lineTo(cx + 12, cy + 45);
      ctx.bezierCurveTo(cx - 20, cy + 60, cx - 60, cy + 60, cx - 80, cy + 45);
      ctx.lineTo(cx - 85, cy + 95);
      ctx.lineTo(cx - 120, cy + 95);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx + 50, cy - 45, 14, 0, Math.PI * 2);
      ctx.fill();

      return { depthType: 'bear' };
    }

    case 'turtle': {
      ctx.beginPath();
      ctx.ellipse(cx, cy + 10, 62, 85, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx, cy - 95, 20, 26, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx - 45, cy - 40);
      ctx.bezierCurveTo(cx - 110, cy - 75, cx - 165, cy - 55, cx - 175, cy - 15);
      ctx.bezierCurveTo(cx - 160, cy + 5, cx - 100, cy + 5, cx - 48, cy - 10);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + 45, cy - 40);
      ctx.bezierCurveTo(cx + 110, cy - 75, cx + 165, cy - 55, cx + 175, cy - 15);
      ctx.bezierCurveTo(cx + 160, cy + 5, cx + 100, cy + 5, cx + 48, cy - 10);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx - 45, cy + 85, 22, 35, -0.4, 0, Math.PI * 2);
      ctx.ellipse(cx + 45, cy + 85, 22, 35, 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx - 8, cy + 92);
      ctx.lineTo(cx, cy + 115);
      ctx.lineTo(cx + 8, cy + 92);
      ctx.closePath();
      ctx.fill();

      return { depthType: 'turtle' };
    }

    case 'horse': {
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy - 115);
      ctx.lineTo(cx - 8, cy - 135);
      ctx.lineTo(cx + 5, cy - 118);
      ctx.bezierCurveTo(cx + 25, cy - 110, cx + 65, cy - 90, cx + 85, cy - 65);
      ctx.lineTo(cx + 70, cy - 45);
      ctx.bezierCurveTo(cx + 45, cy - 50, cx + 25, cy - 35, cx + 15, cy - 15);
      ctx.bezierCurveTo(cx + 35, cy + 20, cx + 45, cy + 60, cx + 35, cy + 105);
      ctx.lineTo(cx + 15, cy + 105);
      ctx.lineTo(cx + 5, cy + 45);
      ctx.bezierCurveTo(cx - 30, cy + 50, cx - 75, cy + 45, cx - 95, cy + 25);
      ctx.lineTo(cx - 100, cy + 105);
      ctx.lineTo(cx - 120, cy + 105);
      ctx.bezierCurveTo(cx - 120, cy + 45, cx - 115, cy + 5, cx - 85, cy - 15);
      ctx.bezierCurveTo(cx - 65, cy - 45, cx - 45, cy - 85, cx - 15, cy - 115);
      ctx.closePath();
      ctx.fill();

      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 110); ctx.quadraticCurveTo(cx - 35, cy - 95, cx - 50, cy - 80);
      ctx.moveTo(cx - 20, cy - 80); ctx.quadraticCurveTo(cx - 50, cy - 65, cx - 65, cy - 45);
      ctx.moveTo(cx - 35, cy - 50); ctx.quadraticCurveTo(cx - 65, cy - 35, cx - 80, cy - 15);
      ctx.stroke();

      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(cx - 95, cy + 10);
      ctx.bezierCurveTo(cx - 135, cy + 25, cx - 150, cy + 70, cx - 140, cy + 115);
      ctx.stroke();

      return { depthType: 'horse' };
    }

    default: {
      ctx.beginPath();
      ctx.arc(cx, cy, 100, 0, Math.PI * 2);
      ctx.fill();
      return { depthType: 'default' };
    }
  }
}

export function generateAnimalShape(animalId: string, count: number): Float32Array {
  if (animalPositionsCache.has(animalId)) {
    return new Float32Array(animalPositionsCache.get(animalId)!);
  }

  const positions = new Float32Array(count * 4);
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return generateSphere(count);
  }

  // Clear background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const { depthType } = drawAnimalToCanvas(ctx, animalId, canvas.width, canvas.height);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Collect active pixel coordinates
  const activePixels: { x: number; y: number }[] = [];
  const step = 2;
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const idx = (y * canvas.width + x) * 4;
      if (data[idx] > 100) {
        activePixels.push({ x, y });
      }
    }
  }

  if (activePixels.length === 0) {
    return generateSphere(count);
  }

  const scale = 0.0185;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  for (let i = 0; i < count; i++) {
    const p = activePixels[Math.floor(Math.random() * activePixels.length)];
    const jitterX = (Math.random() - 0.5) * step * 1.1;
    const jitterY = (Math.random() - 0.5) * step * 1.1;

    const x = (p.x + jitterX - cx) * scale;
    const y = -(p.y + jitterY - cy) * scale;

    const r = Math.random();
    let z: number;

    if (depthType === 'butterfly') {
      if (Math.abs(x) < 0.22) {
        // Cylindrical body & head
        const bodyRad = 0.2;
        const angle = Math.random() * Math.PI * 2;
        z = Math.sin(angle) * bodyRad;
      } else {
        // Wings held at 3D dihedral V-angle like a real butterfly in flight
        const wingDist = Math.abs(x);
        const dihedral = wingDist * 0.48; // angle upward in Z
        const ripple = Math.sin(wingDist * 3.5 + y * 1.8) * 0.12;
        z = (r < 0.5 ? 1 : -1) * 0.08 + dihedral + ripple;
      }
    } else if (depthType === 'dolphin') {
      // Hydrodynamic streamline spindle
      const distAlongBody = Math.abs(x) / 2.4;
      const bodyRadius = Math.max(0.12, 0.78 * (1 - distAlongBody * distAlongBody));
      if (y < -0.7) {
        // Dorsal fin: thin and upright
        z = (Math.random() - 0.5) * 0.12;
      } else if (x < -1.8) {
        // Tail fluke: spreads horizontally in Z
        z = (Math.random() - 0.5) * 0.95;
      } else {
        // Organic rounded spindle body
        const phi = Math.random() * Math.PI * 2;
        const rad = Math.sqrt(Math.random()) * bodyRadius;
        z = Math.sin(phi) * rad;
      }
    } else if (depthType === 'eagle') {
      if (Math.abs(x) > 0.4) {
        // Aerodynamic wings with camber and upward dihedral sweep
        const camber = Math.sin((Math.abs(x) - 0.4) * 1.6) * 0.42;
        const sweep = (Math.abs(x) - 0.4) * 0.22;
        z = (r < 0.5 ? 0.08 : -0.08) + camber - sweep + (Math.random() - 0.5) * 0.12;
      } else if (y < -0.7) {
        // Hooked beak projecting forward in +Z
        z = 0.35 + Math.random() * 0.35;
      } else {
        // Volumetric torso and fan tail
        z = (Math.random() - 0.5) * 0.65;
      }
    } else if (depthType === 'lion') {
      const distFromFace = Math.sqrt(x * x + (y + 0.3) * (y + 0.3));
      if (distFromFace < 0.55 && y > -0.6 && y < 0.1) {
        // Muzzle and nose projecting prominently forward
        z = 0.45 + (Math.random() - 0.5) * 0.3;
      } else if (distFromFace < 1.8) {
        // Huge 3D spherical layered mane
        const maneShell = Math.sqrt(Math.max(0, 1.8 * 1.8 - distFromFace * distFromFace));
        z = (Math.random() - 0.5) * maneShell * 1.25;
      } else {
        // Muscular torso and paws
        z = (Math.random() - 0.5) * 0.85;
      }
    } else if (depthType === 'elephant') {
      if (x > 1.1 && y > -0.5) {
        // Trunk curving in a 3D arch forward into +Z
        z = 0.35 + Math.sin((y + 0.5) * 3) * 0.45 + (Math.random() - 0.5) * 0.2;
      } else if (x > 0.9 && y > 0 && y < 0.4) {
        // Tusks projecting outward and forward
        z = (r < 0.5 ? 0.45 : 0.75) + (Math.random() - 0.5) * 0.15;
      } else if (x > 0.2 && x < 0.8 && y > -0.7 && y < 0.1) {
        // Large ears flared backward in -Z
        z = -0.45 - Math.random() * 0.45;
      } else if (y > 0.4) {
        // 4 heavy columnar legs (front pair at +Z, back pair at -Z)
        const isForeLeg = r < 0.5;
        z = (isForeLeg ? 0.42 : -0.42) + (Math.random() - 0.5) * 0.22;
      } else {
        // Massive barrel body
        z = (Math.random() - 0.5) * 1.45;
      }
    } else if (depthType === 'turtle') {
      const distFromCenter = Math.sqrt(x * x + (y + 0.1) * (y + 0.1));
      if (distFromCenter < 1.4 && y < 0.6) {
        // High domed shell carapace (convex on top +Z, flatter plastron on bottom -Z)
        const shellHeight = Math.sqrt(Math.max(0, 1.4 * 1.4 - distFromCenter * distFromCenter));
        z = r < 0.7 ? shellHeight * 0.75 : -0.3 + (Math.random() - 0.5) * 0.15;
      } else {
        // Swimming flippers and outstretched head
        z = (Math.random() - 0.5) * 0.32;
      }
    } else if (depthType === 'wolf') {
      if (x > 0.7 && y < -0.8) {
        // Howling muzzle pointing forward and upward
        z = 0.35 + (Math.random() - 0.5) * 0.25;
      } else if (x < -1.4) {
        // Volumetric bushy tail with 3D spiral curve
        z = Math.sin((y - 0.5) * 2.5) * 0.45 + (Math.random() - 0.5) * 0.25;
      } else {
        // Ribcage and athletic wolf flanks
        z = (Math.random() - 0.5) * 0.85;
      }
    } else if (depthType === 'cat') {
      if (x < -0.9 && y > 0.2) {
        // Graceful 3D curled tail
        z = Math.cos(y * 3.2) * 0.5 + (Math.random() - 0.5) * 0.15;
      } else if (y < -0.5) {
        // Rounded feline head and perked ears
        z = (Math.random() - 0.5) * 0.65;
      } else {
        // Rounded feline torso
        z = (Math.random() - 0.5) * 0.75;
      }
    } else if (depthType === 'bear') {
      // Massive barrel chest and heavy muscular bulk
      const dist = Math.sqrt(x * x + y * y);
      const bulk = Math.sqrt(Math.max(0, 2.0 * 2.0 - dist * dist));
      z = (Math.random() - 0.5) * bulk * 0.8;
    } else if (depthType === 'horse') {
      if (x < -1.2) {
        // Flowing 3D tail in the wind
        z = Math.sin(y * 2) * 0.4 + (Math.random() - 0.5) * 0.3;
      } else if (x > 0.4 && y < -0.8) {
        // Chiseled equine head and muzzle
        z = (Math.random() - 0.5) * 0.55;
      } else {
        // Muscular barrel ribcage and haunches
        z = (Math.random() - 0.5) * 0.95;
      }
    } else {
      // General volumetric depth
      if (r < 0.38) {
        z = 0.55 + (Math.random() - 0.5) * 0.15;
      } else if (r < 0.76) {
        z = -0.55 + (Math.random() - 0.5) * 0.15;
      } else {
        z = (Math.random() - 0.5) * 1.1;
      }
    }

    // Subtle ambient particle halo around animal (3%)
    let finalX = x;
    let finalY = y;
    let finalZ = z;
    if (Math.random() < 0.03) {
      finalX += (Math.random() - 0.5) * 0.4;
      finalY += (Math.random() - 0.5) * 0.4;
      finalZ += (Math.random() - 0.5) * 0.4;
    }

    // 4D biological hyper-coordinate W
    let w: number;
    if (depthType === 'butterfly') {
      w = Math.sin((Math.abs(x) + y) * 2.2) * 0.55;
    } else if (depthType === 'lion') {
      w = (Math.random() - 0.5) * 1.15;
    } else if (depthType === 'dolphin') {
      w = Math.sin(x * 1.6) * 0.6;
    } else if (depthType === 'eagle') {
      w = Math.cos(Math.abs(x) * 1.8) * 0.52;
    } else if (depthType === 'elephant') {
      w = Math.sin(y * 2.6) * 0.5;
    } else {
      w = (Math.random() - 0.5) * 0.85;
    }

    const idx = i * 4;
    positions[idx] = finalX;
    positions[idx + 1] = finalY;
    positions[idx + 2] = finalZ;
    positions[idx + 3] = w;
  }

  animalPositionsCache.set(animalId, positions);
  return positions;
}

// 10 distinct volumetric 4D animals
export const ANIMAL_SHAPES: ShapeDefinition[] = [
  {
    id: 'animal-lion',
    name: 'León (4D)',
    description: 'Silueta 4D del rey de la selva con melena hiperdimensional esférica radiante y proyección coronal.',
    iconName: 'PawPrint',
    generate: (count: number) => generateAnimalShape('lion', count),
  },
  {
    id: 'animal-elephant',
    name: 'Elefante (4D)',
    description: 'Estructura tetradimensional del gran elefante con trompa resonante en 4D, colmillos y grandes orejas.',
    iconName: 'PawPrint',
    generate: (count: number) => generateAnimalShape('elephant', count),
  },
  {
    id: 'animal-dolphin',
    name: 'Delfín (4D)',
    description: 'Líneas hiper-hidrodinámicas de un delfín surcando el hiperespacio 4D con aletas en vórtice.',
    iconName: 'Fish',
    generate: (count: number) => generateAnimalShape('dolphin', count),
  },
  {
    id: 'animal-eagle',
    name: 'Águila Real (4D)',
    description: 'Ave rapaz en vuelo hiperdimensional con envergadura alar extendida a través de la cuarta coordenada.',
    iconName: 'Bird',
    generate: (count: number) => generateAnimalShape('eagle', count),
  },
  {
    id: 'animal-wolf',
    name: 'Lobo Gris (4D)',
    description: 'Perfil cósmico del lobo aullando hacia el hiperespacio con pelaje volumétrico tetradimensional.',
    iconName: 'Dog',
    generate: (count: number) => generateAnimalShape('wolf', count),
  },
  {
    id: 'animal-butterfly',
    name: 'Mariposa (4D)',
    description: 'Estructura alar con doble par de alas con aleteo hiperdimensional a través de la coordenada W.',
    iconName: 'Bug',
    generate: (count: number) => generateAnimalShape('butterfly', count),
  },
  {
    id: 'animal-cat',
    name: 'Gato Felino (4D)',
    description: 'Silueta ágil y elegante con biomecánica 4D, lomo arqueado y cola sinuosa en el hiperespacio.',
    iconName: 'Cat',
    generate: (count: number) => generateAnimalShape('cat', count),
  },
  {
    id: 'animal-bear',
    name: 'Oso Pardo (4D)',
    description: 'Volumen macizo y poderoso con densidad hiperdimensional y masa volumétrica en R^4.',
    iconName: 'PawPrint',
    generate: (count: number) => generateAnimalShape('bear', count),
  },
  {
    id: 'animal-turtle',
    name: 'Tortuga Marina (4D)',
    description: 'Caparazón hiper-abovedado en 4D con aletas natatorias extendidas en navegación cuántica.',
    iconName: 'Turtle',
    generate: (count: number) => generateAnimalShape('turtle', count),
  },
  {
    id: 'animal-horse',
    name: 'Caballo Corcel (4D)',
    description: 'Noble corcel al galope cósmico con crines ondeantes y potente anatomía proyectada en 4D.',
    iconName: 'Feather',
    generate: (count: number) => generateAnimalShape('horse', count),
  },
];
