import { ShapeDefinition } from '../types';

export const PARTICLE_COUNT = 16000;

// 1. Esfera Geodésica
function generateSphere(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const phiSpan = Math.PI * (3 - Math.sqrt(5)); // Golden angle

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phiSpan * i;

    // Introduce subtle depth variation
    const r = 2.4 * (0.9 + Math.random() * 0.2);
    const x = Math.cos(theta) * radiusAtY * r;
    const z = Math.sin(theta) * radiusAtY * r;

    const idx = i * 3;
    positions[idx] = x;
    positions[idx + 1] = y * r;
    positions[idx + 2] = z;
  }
  return positions;
}

// 2. Cubo 3D
function generateCube(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const size = 3.6;
  const half = size / 2;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const choice = Math.random();

    // Distribute 60% on faces/edges, 40% in internal volume
    if (choice < 0.65) {
      // Pick one of the 6 faces
      const face = Math.floor(Math.random() * 6);
      const u = (Math.random() - 0.5) * size;
      const v = (Math.random() - 0.5) * size;

      switch (face) {
        case 0: positions[idx] = half; positions[idx + 1] = u; positions[idx + 2] = v; break;
        case 1: positions[idx] = -half; positions[idx + 1] = u; positions[idx + 2] = v; break;
        case 2: positions[idx] = u; positions[idx + 1] = half; positions[idx + 2] = v; break;
        case 3: positions[idx] = u; positions[idx + 1] = -half; positions[idx + 2] = v; break;
        case 4: positions[idx] = u; positions[idx + 1] = v; positions[idx + 2] = half; break;
        case 5: positions[idx] = u; positions[idx + 1] = v; positions[idx + 2] = -half; break;
      }
    } else {
      // Internal lattice/grid
      positions[idx] = (Math.random() - 0.5) * size * 0.9;
      positions[idx + 1] = (Math.random() - 0.5) * size * 0.9;
      positions[idx + 2] = (Math.random() - 0.5) * size * 0.9;
    }
  }
  return positions;
}

// 3. Toroide (Dona)
function generateTorus(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const R = 2.4; // Radio mayor
  const r = 0.85; // Radio menor

  for (let i = 0; i < count; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI * 2;
    const radialJitter = r * (0.85 + Math.random() * 0.3);

    const x = (R + radialJitter * Math.cos(v)) * Math.cos(u);
    const y = (R + radialJitter * Math.cos(v)) * Math.sin(u);
    const z = radialJitter * Math.sin(v);

    const idx = i * 3;
    positions[idx] = x;
    positions[idx + 1] = z; // Orient flat horizontally
    positions[idx + 2] = y;
  }
  return positions;
}

// 4. Nudo Toroidal (Trefoil Knot 2, 3)
function generateTorusKnot(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
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

    // Approximate normal & binormal offset
    const nx = Math.cos(angle) * rTube;
    const ny = Math.sin(angle) * rTube;

    const idx = i * 3;
    positions[idx] = cx + nx;
    positions[idx + 1] = cz + ny;
    positions[idx + 2] = cy;
  }
  return positions;
}

// 5. Cilindro 3D
function generateCylinder(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const radius = 1.9;
  const height = 4.2;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const type = Math.random();

    if (type < 0.2) {
      // Top disk cap
      const r = Math.sqrt(Math.random()) * radius;
      const theta = Math.random() * Math.PI * 2;
      positions[idx] = r * Math.cos(theta);
      positions[idx + 1] = height / 2;
      positions[idx + 2] = r * Math.sin(theta);
    } else if (type < 0.4) {
      // Bottom disk cap
      const r = Math.sqrt(Math.random()) * radius;
      const theta = Math.random() * Math.PI * 2;
      positions[idx] = r * Math.cos(theta);
      positions[idx + 1] = -height / 2;
      positions[idx + 2] = r * Math.sin(theta);
    } else {
      // Lateral wall
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * height;
      const r = radius * (0.92 + Math.random() * 0.16);
      positions[idx] = r * Math.cos(theta);
      positions[idx + 1] = y;
      positions[idx + 2] = r * Math.sin(theta);
    }
  }
  return positions;
}

// 6. Doble Cono / Reloj de Arena
function generateHourglass(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const totalH = 4.4;
  const maxR = 2.4;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const y = (Math.random() - 0.5) * totalH;
    const normalizedY = Math.abs(y) / (totalH / 2); // 0 at center, 1 at top/bottom
    const currentR = normalizedY * maxR * (0.85 + Math.random() * 0.3);
    const angle = Math.random() * Math.PI * 2;

    positions[idx] = currentR * Math.cos(angle);
    positions[idx + 1] = y;
    positions[idx + 2] = currentR * Math.sin(angle);
  }
  return positions;
}

// 7. Pirámide Cuadrangular
function generatePyramid(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const baseSize = 3.6;
  const height = 3.8;
  const halfBase = baseSize / 2;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const section = Math.random();

    if (section < 0.25) {
      // Base square
      positions[idx] = (Math.random() - 0.5) * baseSize;
      positions[idx + 1] = -height / 2;
      positions[idx + 2] = (Math.random() - 0.5) * baseSize;
    } else {
      // Slanted triangular faces
      const t = Math.random(); // Height progress from 0 (apex) to 1 (base)
      const y = height / 2 - t * height;
      const scaleAtT = t; // Width expands as we go down

      const face = Math.floor(Math.random() * 4);
      const span = (Math.random() - 0.5) * 2 * halfBase * scaleAtT;
      const edgePos = halfBase * scaleAtT;

      switch (face) {
        case 0: positions[idx] = span; positions[idx + 1] = y; positions[idx + 2] = edgePos; break;
        case 1: positions[idx] = span; positions[idx + 1] = y; positions[idx + 2] = -edgePos; break;
        case 2: positions[idx] = edgePos; positions[idx + 1] = y; positions[idx + 2] = span; break;
        case 3: positions[idx] = -edgePos; positions[idx + 1] = y; positions[idx + 2] = span; break;
      }
    }
  }
  return positions;
}

// 8. Cinta de Möbius
function generateMobiusStrip(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const R = 2.2;
  const w = 1.1;

  for (let i = 0; i < count; i++) {
    const u = Math.random() * Math.PI * 2; // Angle along the loop
    const v = (Math.random() - 0.5) * w; // Width along the strip

    const halfU = u / 2;
    const x = (R + v * Math.cos(halfU)) * Math.cos(u);
    const y = (R + v * Math.cos(halfU)) * Math.sin(u);
    const z = v * Math.sin(halfU) * 1.5;

    const idx = i * 3;
    positions[idx] = x;
    positions[idx + 1] = z;
    positions[idx + 2] = y;
  }
  return positions;
}

// 9. Doble Hélice de ADN
function generateDNA(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const totalLength = 5.0;
  const radius = 1.5;
  const turns = 2.8;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const choice = Math.random();
    const t = Math.random(); // 0 to 1
    const y = (t - 0.5) * totalLength;
    const angle = t * Math.PI * 2 * turns;

    if (choice < 0.42) {
      // Strand 1
      const r = radius * (0.92 + Math.random() * 0.16);
      positions[idx] = r * Math.cos(angle);
      positions[idx + 1] = y;
      positions[idx + 2] = r * Math.sin(angle);
    } else if (choice < 0.84) {
      // Strand 2 (offset by PI)
      const r = radius * (0.92 + Math.random() * 0.16);
      positions[idx] = r * Math.cos(angle + Math.PI);
      positions[idx + 1] = y;
      positions[idx + 2] = r * Math.sin(angle + Math.PI);
    } else {
      // Connecting rungs (base pairs)
      const rungT = Math.floor(Math.random() * 24) / 24;
      const rungY = (rungT - 0.5) * totalLength;
      const rungAngle = rungT * Math.PI * 2 * turns;
      const u = (Math.random() - 0.5) * 2; // -1 to 1 across the diameter
      positions[idx] = radius * u * Math.cos(rungAngle);
      positions[idx + 1] = rungY + (Math.random() - 0.5) * 0.05;
      positions[idx + 2] = radius * u * Math.sin(rungAngle);
    }
  }
  return positions;
}

// 10. Galaxia Espiral / Vórtice
function generateGalaxy(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const arms = 4;
  const maxRadius = 3.6;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const arm = Math.floor(Math.random() * arms);
    const r = Math.pow(Math.random(), 1.5) * maxRadius;
    const armOffset = (arm * 2 * Math.PI) / arms;
    const spin = r * 1.8;
    const dispersion = (Math.random() - 0.5) * 0.35 * (1 + r * 0.4);

    const angle = armOffset + spin + dispersion;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    // Core is thicker vertically, arms taper flat
    const verticalSpread = Math.exp(-r * 0.8) * 0.7 + 0.12;
    const y = (Math.random() - 0.5) * verticalSpread;

    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;
  }
  return positions;
}

export const GEOMETRIC_SHAPES: ShapeDefinition[] = [
  {
    id: 'sphere',
    name: 'Esfera Geodésica',
    description: 'Distribución armónica de partículas sobre una superficie esférica con relación áurea.',
    iconName: 'Circle',
    generate: generateSphere,
  },
  {
    id: 'cube',
    name: 'Hipercubo 3D',
    description: 'Enrejado cúbico de 6 caras exteriores y entramado volumétrico ortogonal.',
    iconName: 'Box',
    generate: generateCube,
  },
  {
    id: 'torus',
    name: 'Toroide (Dona)',
    description: 'Superficie de revolución toroidal definida por radio mayor y menor en equilibrio.',
    iconName: 'Disc',
    generate: generateTorus,
  },
  {
    id: 'knot',
    name: 'Nudo Toroidal',
    description: 'Curva tridimensional entrelazada tipo Trefoil Knot con parametrización topológica.',
    iconName: 'Activity',
    generate: generateTorusKnot,
  },
  {
    id: 'cylinder',
    name: 'Cilindro Tubular',
    description: 'Columna geométrica con base circular superior, inferior y manto perimetral.',
    iconName: 'Cylinder',
    generate: generateCylinder,
  },
  {
    id: 'hourglass',
    name: 'Reloj de Arena',
    description: 'Doble cono simétrico invertido convergiendo en un vértice singular central.',
    iconName: 'Hourglass',
    generate: generateHourglass,
  },
  {
    id: 'pyramid',
    name: 'Pirámide Cuadrangular',
    description: 'Base cuadrada regular con cuatro facetas triangulares unidas en la cúspide.',
    iconName: 'Triangle',
    generate: generatePyramid,
  },
  {
    id: 'mobius',
    name: 'Cinta de Möbius',
    description: 'Superficie matemática no orientable con una sola cara y un único borde continuo.',
    iconName: 'Infinity',
    generate: generateMobiusStrip,
  },
  {
    id: 'dna',
    name: 'Doble Hélice (ADN)',
    description: 'Estructura helicoidal doble entrelazada con peldaños de unión transversales.',
    iconName: 'Dna',
    generate: generateDNA,
  },
  {
    id: 'galaxy',
    name: 'Galaxia Espiral',
    description: 'Vórtice cósmico de 4 brazos espirales logarítmicos con núcleo denso gravitacional.',
    iconName: 'Sparkles',
    generate: generateGalaxy,
  },
];
