import * as THREE from 'three';
import { PROFILES } from './PieceProfiles.js';
import { getPieceMaterial } from './Materials.js';
import { boardToWorld } from './SceneSetup.js';
import { PIECE_TYPES } from '../engine/constants.js';

function createLathePiece(profile, material) {
    const geometry = new THREE.LatheGeometry(profile, 32);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function createKnightMesh(color) {
    const group = new THREE.Group();
    const material = getPieceMaterial(color);

    // Body via lathe
    const bodyGeom = new THREE.LatheGeometry(PROFILES.knight, 32);
    const body = new THREE.Mesh(bodyGeom, material);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Head — a box tilted forward
    const headGeom = new THREE.BoxGeometry(0.18, 0.25, 0.22);
    const head = new THREE.Mesh(headGeom, material);
    head.position.set(0, 1.78, 0.08);
    head.rotation.x = -0.3;
    head.castShadow = true;
    head.receiveShadow = true;
    group.add(head);

    // Snout — cylinder sticking forward
    const snoutGeom = new THREE.CylinderGeometry(0.04, 0.05, 0.16, 8);
    const snout = new THREE.Mesh(snoutGeom, material);
    snout.position.set(0, 1.72, 0.17);
    snout.rotation.x = Math.PI / 2;
    snout.castShadow = true;
    snout.receiveShadow = true;
    group.add(snout);

    // Ears — two small cones
    const earGeom = new THREE.ConeGeometry(0.03, 0.1, 8);
    for (const sx of [-1, 1]) {
        const ear = new THREE.Mesh(earGeom, material);
        ear.position.set(sx * 0.07, 1.90, -0.04);
        ear.rotation.z = sx * 0.3;
        ear.castShadow = true;
        ear.receiveShadow = true;
        group.add(ear);
    }

    return group;
}

export function createPieceMesh(pieceType, color) {
    let mesh;

    if (pieceType === PIECE_TYPES.KNIGHT) {
        mesh = createKnightMesh(color);
    } else {
        const profile = PROFILES[pieceType];
        if (!profile) {
            console.warn(`No profile for piece type: ${pieceType}`);
            return null;
        }
        mesh = createLathePiece(profile, getPieceMaterial(color));
    }

    mesh.userData = { pieceType, color, isPiece: true };
    return mesh;
}

export function positionPiece(mesh, row, col) {
    const world = boardToWorld(row, col);
    mesh.position.set(world.x, 0, world.z);
}

export function createAllPieceMeshes(board, scene, pieceGroup) {
    const pieceMeshMap = new Map();

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece) continue;
            const mesh = createPieceMesh(piece.type, piece.color);
            if (!mesh) continue;
            positionPiece(mesh, r, c);
            pieceGroup.add(mesh);
            pieceMeshMap.set(piece.id, mesh);
        }
    }

    scene.add(pieceGroup);
    return pieceMeshMap;
}

export function syncPiecePositions(board, pieceMeshMap, scene) {
    const activeIds = new Set();

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece) continue;
            activeIds.add(piece.id);

            let mesh = pieceMeshMap.get(piece.id);
            if (!mesh) {
                mesh = createPieceMesh(piece.type, piece.color);
                if (!mesh) continue;
                scene.children.find(ch => ch.name === 'pieces')?.add(mesh);
                pieceMeshMap.set(piece.id, mesh);
            }
            const world = boardToWorld(r, c);
            mesh.position.set(world.x, 0, world.z);
        }
    }

    for (const [id, mesh] of pieceMeshMap) {
        if (!activeIds.has(id)) {
            if (mesh.parent) mesh.parent.remove(mesh);
            pieceMeshMap.delete(id);
        }
    }
}
