import * as THREE from 'three';
import { ChessEngine } from '../engine/ChessEngine.js';
import { COLORS } from '../engine/constants.js';
import { createScene, boardToWorld } from '../renderer/SceneSetup.js';
import { setupLighting } from '../renderer/Lighting.js';
import { createBoard } from '../renderer/BoardRenderer.js';
import { createPieceMesh, createAllPieceMeshes, positionPiece } from '../renderer/PieceRenderer.js';
import { PieceAnimator } from '../renderer/PieceAnimator.js';
import { InteractionManager } from '../renderer/InteractionManager.js';
import { StatusBar } from '../ui/StatusBar.js';
import { PromotionDialog } from '../ui/PromotionDialog.js';
import { CaptureDisplay } from '../ui/CaptureDisplay.js';

export class GameController {
    constructor() {
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.pieceGroup = null;
        this.pieceMeshMap = null;
        this.animator = null;
        this.interaction = null;
        this.statusBar = null;
        this.promotionDialog = null;
        this.captureDisplay = null;
        this.selectedPieceData = null;
        this.isAnimating = false;
        this.gameOver = false;
        this._lastTime = performance.now();
    }

    init() {
        // Engine
        this.engine = new ChessEngine();

        // Three.js scene
        const setup = createScene();
        this.scene = setup.scene;
        this.camera = setup.camera;
        this.renderer = setup.renderer;
        this.controls = setup.controls;

        // Lighting
        setupLighting(this.scene);

        // Board
        createBoard(this.scene);

        // Piece group
        this.pieceGroup = new THREE.Group();
        this.pieceGroup.name = 'pieces';

        // Pieces
        this.pieceMeshMap = createAllPieceMeshes(this.engine.board, this.scene, this.pieceGroup);

        // Animation
        this.animator = new PieceAnimator();

        // Interaction
        this.interaction = new InteractionManager(this.camera, this.renderer, this.pieceGroup);
        this.interaction.attachToScene(this.scene);

        this.interaction.onPieceSelected = (mesh) => this._handlePieceClick(mesh);
        this.interaction.onMoveTargetClicked = (row, col) => this._handleMoveClick(row, col);
        this.interaction.onDeselect = () => this._deselect();

        // UI
        this.statusBar = new StatusBar();
        this.promotionDialog = new PromotionDialog();
        this.captureDisplay = new CaptureDisplay();

        this.statusBar._newGameCallback = () => this.resetGame();

        // Initial status
        this.statusBar.update('playing', COLORS.WHITE);

        // Start loop
        this._animate();
    }

    _animate() {
        requestAnimationFrame(() => this._animate());

        const now = performance.now();
        const dt = Math.min((now - this._lastTime) / 1000, 0.1);
        this._lastTime = now;
        this.controls.update();
        this.animator.update(dt);
        this.renderer.render(this.scene, this.camera);
    }

    _handlePieceClick(mesh) {
        if (this.isAnimating || this.gameOver) return;
        if (!mesh?.userData?.isPiece) return;

        const pieceId = this._findPieceIdByMesh(mesh);
        if (!pieceId) return;

        const piece = this._findPieceById(pieceId);
        if (!piece) return;

        if (piece.color === this.engine.currentTurn) {
            this._selectPiece(piece, mesh);
        } else if (this.selectedPieceData) {
            this._handleMoveClick(piece.row, piece.col);
        }
    }

    _selectPiece(piece, mesh) {
        this.selectedPieceData = piece;
        this.interaction.selectPiece(mesh);

        const moves = this.engine.getValidMoves(piece.row, piece.col);
        this.interaction.showHighlights(moves);
    }

    _deselect() {
        this.selectedPieceData = null;
        this.interaction.clearSelection();
        this.interaction.hideHighlights();
    }

    async _handleMoveClick(row, col) {
        if (this.isAnimating || this.gameOver) return;
        if (!this.selectedPieceData) return;

        const piece = this.selectedPieceData;
        const fromRow = piece.row;
        const fromCol = piece.col;

        const moves = this.engine.getValidMoves(fromRow, fromCol);
        const move = moves.find(m => m.row === row && m.col === col);
        if (!move) {
            const targetPiece = this.engine.getPiece(row, col);
            if (targetPiece && targetPiece.color === this.engine.currentTurn) {
                const mesh = this._findMeshByPieceId(targetPiece.id);
                if (mesh) this._selectPiece(targetPiece, mesh);
                return;
            }
            return;
        }

        let promotionType = null;
        if (move.isPromotion) {
            promotionType = await this.promotionDialog.show(piece.color);
        }

        const pieceId = piece.id;
        const pieceColor = piece.color;
        this._deselect();
        this._executeMove(fromRow, fromCol, row, col, promotionType, move, pieceId, pieceColor);
    }

    _executeMove(fromRow, fromCol, toRow, toCol, promotionType, moveInfo, pieceId, pieceColor) {
        this.isAnimating = true;

        const pieceMesh = this._findMeshByPieceId(pieceId);
        const targetPiece = this.engine.getPiece(toRow, toCol);

        let capturedMesh = null;
        if (targetPiece) {
            capturedMesh = this._findMeshByPieceId(targetPiece.id);
        }
        if (moveInfo?.isEnPassant) {
            const capRow = pieceColor === COLORS.WHITE ? toRow + 1 : toRow - 1;
            const capPiece = this.engine.getPiece(capRow, toCol);
            if (capPiece) capturedMesh = this._findMeshByPieceId(capPiece.id);
        }

        // Execute the move in engine
        const result = this.engine.makeMove(fromRow, fromCol, toRow, toCol, promotionType);
        if (!result.success) {
            this.isAnimating = false;
            return;
        }

        // Animate captured piece
        if (capturedMesh && result.isCapture) {
            this.animator.animateCapture(capturedMesh, 250, () => {
                if (capturedMesh.parent) capturedMesh.parent.remove(capturedMesh);
                const pieceId = this._findPieceIdByMesh(capturedMesh);
                if (pieceId) this.pieceMeshMap.delete(pieceId);
            });
        }

        // Animate the moving piece
        const fromWorld = boardToWorld(fromRow, fromCol);
        const toWorld = boardToWorld(toRow, toCol);

        if (pieceMesh) {
            this.animator.animateLiftAndMove(pieceMesh, fromWorld, toWorld, 350, () => {
                this._finishMove(result, fromRow, fromCol, toRow, toCol);
            });
        } else {
            this._finishMove(result, fromRow, fromCol, toRow, toCol);
        }
    }

    _finishMove(result, fromRow, fromCol, toRow, toCol) {
        // Also animate castling rook if needed
        if (result.isCastling && result.castlingRookMove) {
            const { row: rRow, fromCol: rFromCol, toCol: rToCol } = result.castlingRookMove;
            const rookPiece = this.engine.getPiece(rRow, rToCol);
            if (rookPiece) {
                const rookMesh = this._findMeshByPieceId(rookPiece.id);
                if (rookMesh) {
                    const rFromWorld = boardToWorld(rRow, rFromCol);
                    const rToWorld = boardToWorld(rRow, rToCol);
                    rookMesh.position.copy(rToWorld);
                }
            }
        }

        // Handle promotion: replace pawn mesh with promoted piece mesh
        if (result.isPromotion) {
            const promotedPiece = this.engine.getPiece(toRow, toCol);
            if (promotedPiece) {
                const oldMesh = this._findMeshByPieceId(promotedPiece.id);
                if (oldMesh && oldMesh.parent) {
                    oldMesh.parent.remove(oldMesh);
                }
                this.pieceMeshMap.delete(promotedPiece.id);

                const newMesh = createPieceMesh(promotedPiece.type, promotedPiece.color);
                if (newMesh) {
                    positionPiece(newMesh, toRow, toCol);
                    this.pieceGroup.add(newMesh);
                    this.pieceMeshMap.set(promotedPiece.id, newMesh);
                }
            }
        }

        // Update capture display
        this.captureDisplay.update(this.engine.capturedPieces);

        // Check game status
        const status = this.engine.getStatus();
        if (status === 'checkmate' || status === 'stalemate') {
            this.gameOver = true;
            this.statusBar.showGameOver(status, this.engine.currentTurn);
        } else {
            this.statusBar.update(status, this.engine.currentTurn);
        }

        this.isAnimating = false;
        this.selectedPieceData = null;
    }

    _findPieceById(id) {
        const pieces = this.engine.getPieces();
        return pieces.find(p => p.id === id) || null;
    }

    _findMeshByPieceId(id) {
        return this.pieceMeshMap.get(id) || null;
    }

    _findPieceIdByMesh(mesh) {
        for (const [id, m] of this.pieceMeshMap) {
            if (m === mesh) return id;
        }
        return null;
    }

    resetGame() {
        this.gameOver = false;
        this.isAnimating = false;
        this.selectedPieceData = null;
        this.animator.clear();

        // Remove all piece meshes
        for (const [, mesh] of this.pieceMeshMap) {
            if (mesh.parent) mesh.parent.remove(mesh);
        }
        this.pieceMeshMap.clear();

        // Reset engine
        this.engine.reset();

        // Recreate pieces
        this.pieceMeshMap = createAllPieceMeshes(this.engine.board, this.scene, this.pieceGroup);

        // Clear UI
        this.interaction.clearSelection();
        this.interaction.hideHighlights();
        this.statusBar.update('playing', COLORS.WHITE);
        this.captureDisplay.update({ white: [], black: [] });

        // Remove new game button if present
        const btn = this.statusBar.element.querySelector('button');
        if (btn) btn.remove();
    }
}
