import * as THREE from 'three';

export const boardLightMaterial = new THREE.MeshStandardMaterial({
    color: 0xF0D9B5,
    roughness: 0.6,
    metalness: 0.05,
});

export const boardDarkMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513,
    roughness: 0.6,
    metalness: 0.05,
});

export const boardBorderMaterial = new THREE.MeshStandardMaterial({
    color: 0x3E2723,
    roughness: 0.4,
    metalness: 0.1,
});

export const whitePieceMaterial = new THREE.MeshStandardMaterial({
    color: 0xF5F5DC,
    roughness: 0.25,
    metalness: 0.1,
});

export const blackPieceMaterial = new THREE.MeshStandardMaterial({
    color: 0x2F1B0E,
    roughness: 0.25,
    metalness: 0.1,
});

export const highlightMoveMaterial = new THREE.MeshBasicMaterial({
    color: 0x00FF00,
    transparent: true,
    opacity: 0.35,
    depthTest: false,
    side: THREE.DoubleSide,
});

export const highlightCaptureMaterial = new THREE.MeshBasicMaterial({
    color: 0xFF4444,
    transparent: true,
    opacity: 0.35,
    depthTest: false,
    side: THREE.DoubleSide,
});

export const highlightSelectedMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFFF00,
    transparent: true,
    opacity: 0.5,
    depthTest: false,
    side: THREE.DoubleSide,
});

export function getPieceMaterial(color) {
    return color === 'white' ? whitePieceMaterial : blackPieceMaterial;
}
