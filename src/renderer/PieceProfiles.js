import * as THREE from 'three';

// Each profile is an array of Vector2(xRadius, yHeight) from bottom (y=0) to top.
// Revolved around Y-axis with LatheGeometry.

export const KING_PROFILE = [
    new THREE.Vector2(0.38, 0.00),
    new THREE.Vector2(0.38, 0.10),
    new THREE.Vector2(0.34, 0.16),
    new THREE.Vector2(0.24, 0.30),
    new THREE.Vector2(0.20, 0.40),
    new THREE.Vector2(0.18, 1.80),
    new THREE.Vector2(0.20, 1.90),
    new THREE.Vector2(0.27, 2.00),
    new THREE.Vector2(0.29, 2.08),
    new THREE.Vector2(0.17, 2.16),
    new THREE.Vector2(0.17, 2.45),
    new THREE.Vector2(0.32, 2.55),
    new THREE.Vector2(0.32, 2.60),
    new THREE.Vector2(0.06, 2.68),
    new THREE.Vector2(0.00, 2.76),
];

export const QUEEN_PROFILE = [
    new THREE.Vector2(0.38, 0.00),
    new THREE.Vector2(0.38, 0.10),
    new THREE.Vector2(0.33, 0.18),
    new THREE.Vector2(0.24, 0.35),
    new THREE.Vector2(0.20, 0.45),
    new THREE.Vector2(0.18, 1.60),
    new THREE.Vector2(0.22, 1.70),
    new THREE.Vector2(0.28, 1.78),
    new THREE.Vector2(0.22, 1.86),
    new THREE.Vector2(0.28, 1.94),
    new THREE.Vector2(0.21, 2.02),
    new THREE.Vector2(0.27, 2.10),
    new THREE.Vector2(0.19, 2.18),
    new THREE.Vector2(0.25, 2.26),
    new THREE.Vector2(0.16, 2.34),
    new THREE.Vector2(0.10, 2.48),
    new THREE.Vector2(0.06, 2.58),
    new THREE.Vector2(0.00, 2.68),
];

export const BISHOP_PROFILE = [
    new THREE.Vector2(0.34, 0.00),
    new THREE.Vector2(0.34, 0.10),
    new THREE.Vector2(0.27, 0.20),
    new THREE.Vector2(0.20, 0.38),
    new THREE.Vector2(0.17, 0.50),
    new THREE.Vector2(0.15, 1.55),
    new THREE.Vector2(0.14, 1.70),
    new THREE.Vector2(0.12, 1.90),
    new THREE.Vector2(0.09, 2.10),
    new THREE.Vector2(0.06, 2.30),
    new THREE.Vector2(0.03, 2.50),
    new THREE.Vector2(0.00, 2.65),
];

export const ROOK_PROFILE = [
    new THREE.Vector2(0.36, 0.00),
    new THREE.Vector2(0.36, 0.08),
    new THREE.Vector2(0.30, 0.18),
    new THREE.Vector2(0.26, 0.28),
    new THREE.Vector2(0.25, 1.55),
    new THREE.Vector2(0.24, 1.65),
    new THREE.Vector2(0.34, 1.74),
    new THREE.Vector2(0.34, 1.80),
    new THREE.Vector2(0.28, 1.86),
    new THREE.Vector2(0.28, 1.94),
    new THREE.Vector2(0.34, 2.00),
    new THREE.Vector2(0.34, 2.08),
    new THREE.Vector2(0.00, 2.16),
];

export const PAWN_PROFILE = [
    new THREE.Vector2(0.30, 0.00),
    new THREE.Vector2(0.30, 0.08),
    new THREE.Vector2(0.21, 0.18),
    new THREE.Vector2(0.16, 0.30),
    new THREE.Vector2(0.14, 1.00),
    new THREE.Vector2(0.16, 1.08),
    new THREE.Vector2(0.21, 1.18),
    new THREE.Vector2(0.25, 1.28),
    new THREE.Vector2(0.27, 1.40),
    new THREE.Vector2(0.25, 1.52),
    new THREE.Vector2(0.19, 1.62),
    new THREE.Vector2(0.11, 1.70),
    new THREE.Vector2(0.04, 1.76),
    new THREE.Vector2(0.00, 1.84),
];

// Knight uses a composite approach: lathe body + box head + cylinder snout
export const KNIGHT_BODY_PROFILE = [
    new THREE.Vector2(0.32, 0.00),
    new THREE.Vector2(0.32, 0.10),
    new THREE.Vector2(0.25, 0.22),
    new THREE.Vector2(0.19, 0.42),
    new THREE.Vector2(0.17, 0.55),
    new THREE.Vector2(0.16, 1.35),
    new THREE.Vector2(0.14, 1.55),
    new THREE.Vector2(0.11, 1.72),
    new THREE.Vector2(0.07, 1.88),
    new THREE.Vector2(0.00, 1.98),
];

export const PROFILES = {
    king: KING_PROFILE,
    queen: QUEEN_PROFILE,
    rook: ROOK_PROFILE,
    bishop: BISHOP_PROFILE,
    knight: KNIGHT_BODY_PROFILE,
    pawn: PAWN_PROFILE,
};
