import * as THREE from 'three';
import { boardToWorld, worldToBoard } from './SceneSetup.js';
import {
    highlightMoveMaterial,
    highlightCaptureMaterial,
    highlightSelectedMaterial,
} from './Materials.js';

const _boardPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _intersectPoint = new THREE.Vector3();

export class InteractionManager {
    constructor(camera, renderer, pieceGroup) {
        this.camera = camera;
        this.renderer = renderer;
        this.pieceGroup = pieceGroup;
        this.highlightGroup = new THREE.Group();
        this.highlightGroup.name = 'highlights';

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectedPiece = null;
        this.selectedMesh = null;
        this.validMoves = [];

        // Highlight pool — 64 circular disc meshes, reused
        this.highlightPool = [];
        const ringGeom = new THREE.CylinderGeometry(0.38, 0.38, 0.02, 32);

        for (let i = 0; i < 64; i++) {
            const mesh = new THREE.Mesh(ringGeom, highlightMoveMaterial.clone());
            mesh.userData = { type: 'highlight', row: -1, col: -1 };
            mesh.position.y = -100;
            mesh.renderOrder = 1;
            mesh.material.depthTest = false;
            mesh.material.depthWrite = false;
            this.highlightGroup.add(mesh);
            this.highlightPool.push(mesh);
        }

        this.selectedHighlight = new THREE.Mesh(
            new THREE.CylinderGeometry(0.36, 0.42, 0.02, 32),
            highlightSelectedMaterial.clone()
        );
        this.selectedHighlight.renderOrder = 1;
        this.selectedHighlight.material.depthTest = false;
        this.selectedHighlight.material.depthWrite = false;
        this.selectedHighlight.position.y = -100;
        this.highlightGroup.add(this.selectedHighlight);

        // Bind event handlers
        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        renderer.domElement.addEventListener('pointerdown', this._onPointerDown);
        renderer.domElement.addEventListener('pointermove', this._onPointerMove);

        this.onPieceSelected = null;
        this.onMoveTargetClicked = null;
        this.onDeselect = null;
    }

    attachToScene(scene) {
        scene.add(this.highlightGroup);
    }

    _updateMouse(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    _onPointerDown(event) {
        this._updateMouse(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const pieceHits = this.raycaster.intersectObjects(this.pieceGroup.children, true);
        const highlightHits = this.raycaster.intersectObjects(this.highlightGroup.children);

        const nearestPiece = pieceHits.length > 0 ? pieceHits[0].object : null;
        const nearestHighlight = highlightHits.length > 0 ? highlightHits[0].object : null;
        const pieceDist = pieceHits.length > 0 ? pieceHits[0].distance : Infinity;
        const highlightDist = highlightHits.length > 0 ? highlightHits[0].distance : Infinity;

        let clickedPiece = nearestPiece;
        while (clickedPiece && !clickedPiece.userData?.isPiece) {
            clickedPiece = clickedPiece.parent;
        }

        if (clickedPiece && pieceDist < highlightDist) {
            if (this.onPieceSelected) {
                this.onPieceSelected(clickedPiece);
            }
            return;
        }

        if (nearestHighlight && nearestHighlight.userData.type === 'highlight') {
            if (this.onMoveTargetClicked) {
                this.onMoveTargetClicked(nearestHighlight.userData.row, nearestHighlight.userData.col);
            }
            return;
        }

        // Fallback: intersect with board plane to compute board coords from click
        if (this.validMoves.length > 0 &&
            this.raycaster.ray.intersectPlane(_boardPlane, _intersectPoint)) {
            const board = worldToBoard(_intersectPoint.x, _intersectPoint.z);
            if (board.row >= 0 && board.row < 8 && board.col >= 0 && board.col < 8) {
                const move = this.validMoves.find(m => m.row === board.row && m.col === board.col);
                if (move) {
                    if (this.onMoveTargetClicked) {
                        this.onMoveTargetClicked(move.row, move.col);
                    }
                    return;
                }
            }
        }

        if (this.onDeselect) {
            this.onDeselect();
        }
    }

    _onPointerMove(event) {
        this._updateMouse(event);
    }

    showHighlights(validMoves) {
        this.hideHighlights();
        this.validMoves = validMoves;

        validMoves.forEach((move, i) => {
            if (i >= this.highlightPool.length) return;
            const mesh = this.highlightPool[i];
            const world = boardToWorld(move.row, move.col);
            mesh.position.set(world.x, 0.06, world.z);
            mesh.material = move.isCapture ? highlightCaptureMaterial : highlightMoveMaterial;
            mesh.userData.row = move.row;
            mesh.userData.col = move.col;
        });
    }

    hideHighlights() {
        for (const mesh of this.highlightPool) {
            mesh.position.y = -100;
            mesh.userData.row = -1;
            mesh.userData.col = -1;
        }
        this.validMoves = [];
    }

    selectPiece(mesh) {
        this.clearSelection();
        this.selectedMesh = mesh;
        const world = mesh.position.clone();
        this.selectedHighlight.position.set(world.x, 0.06, world.z);
    }

    clearSelection() {
        this.selectedMesh = null;
        this.selectedHighlight.position.y = -100;
    }

    getSelectedPieceMesh() {
        return this.selectedMesh;
    }

    dispose() {
        const el = this.renderer.domElement;
        el.removeEventListener('pointerdown', this._onPointerDown);
        el.removeEventListener('pointermove', this._onPointerMove);
    }
}
