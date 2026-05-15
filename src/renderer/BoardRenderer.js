import * as THREE from 'three';
import { boardLightMaterial, boardDarkMaterial, boardBorderMaterial } from './Materials.js';

export function createBoard(scene) {
    const boardGroup = new THREE.Group();
    boardGroup.name = 'board';

    const squareGeom = new THREE.BoxGeometry(0.94, 0.06, 0.94);

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const material = (row + col) % 2 === 0
                ? boardLightMaterial
                : boardDarkMaterial;
            const square = new THREE.Mesh(squareGeom, material);
            square.position.set(col - 3.5, -0.03, 3.5 - row);
            square.receiveShadow = true;
            square.castShadow = false;
            square.userData = { type: 'square', row, col };
            boardGroup.add(square);
        }
    }

    const borderGeomH = new THREE.BoxGeometry(8.4, 0.12, 0.3);
    const borderGeomV = new THREE.BoxGeometry(0.3, 0.12, 8.4);

    const borders = [
        { x: 0, z: 4.15, geom: borderGeomH },
        { x: 0, z: -4.15, geom: borderGeomH },
        { x: -4.15, z: 0, geom: borderGeomV },
        { x: 4.15, z: 0, geom: borderGeomV },
    ];

    for (const { x, z, geom } of borders) {
        const border = new THREE.Mesh(geom, boardBorderMaterial);
        border.position.set(x, -0.06, z);
        border.receiveShadow = true;
        border.castShadow = true;
        boardGroup.add(border);
    }

    scene.add(boardGroup);
    return boardGroup;
}
