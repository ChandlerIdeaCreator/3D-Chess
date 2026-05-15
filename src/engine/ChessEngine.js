import {
    PIECE_TYPES, COLORS, BOARD_SIZE, INITIAL_FEN,
    PIECE_SYMBOLS, FEN_TO_SYMBOL, oppositeColor,
} from './constants.js';
import { createPiece, clonePiece } from './Piece.js';
import { getLegalMoves, isKingInCheck } from './MoveValidator.js';
import { getGameStatus } from './GameStatus.js';

export class ChessEngine {
    constructor(fen) {
        this.board = Array.from({ length: 8 }, () => Array(8).fill(null));
        this.currentTurn = COLORS.WHITE;
        this.castlingRights = { wK: true, wQ: true, bK: true, bQ: true };
        this.enPassantTarget = null;
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this._pieceCounter = { white: {}, black: {} };

        if (fen) {
            this.fromFEN(fen);
        } else {
            this.fromFEN(INITIAL_FEN);
        }
    }

    _nextId(type, color) {
        if (!this._pieceCounter[color][type]) {
            this._pieceCounter[color][type] = 0;
        }
        return `${color}-${type}-${this._pieceCounter[color][type]++}`;
    }

    getPiece(row, col) {
        return this.board[row][col];
    }

    getPieces(color) {
        const pieces = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.board[r][c];
                if (p && (!color || p.color === color)) {
                    pieces.push(p);
                }
            }
        }
        return pieces;
    }

    getKingPosition(color) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.board[r][c];
                if (p && p.type === PIECE_TYPES.KING && p.color === color) {
                    return { row: r, col: c };
                }
            }
        }
        return null;
    }

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece || piece.color !== this.currentTurn) return [];
        return getLegalMoves(this.board, piece, this.enPassantTarget, this.castlingRights);
    }

    hasAnyLegalMove(color) {
        const pieces = this.getPieces(color);
        for (const piece of pieces) {
            const moves = getLegalMoves(this.board, piece, this.enPassantTarget, this.castlingRights);
            if (moves.length > 0) return true;
        }
        return false;
    }

    isInCheck(color) {
        return isKingInCheck(this.board, color);
    }

    getStatus() {
        return getGameStatus(this.board, this.currentTurn, this.enPassantTarget, this.castlingRights);
    }

    makeMove(fromRow, fromCol, toRow, toCol, promotionType) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return { success: false, reason: 'No piece at source' };
        if (piece.color !== this.currentTurn) return { success: false, reason: 'Not your turn' };

        const legalMoves = getLegalMoves(this.board, piece, this.enPassantTarget, this.castlingRights);
        const move = legalMoves.find(m => m.row === toRow && m.col === toCol &&
            (!m.isPromotion || m.promotionType === promotionType || (m.isPromotion && promotionType)));

        if (!move) return { success: false, reason: 'Illegal move' };

        if (move.isPromotion && !promotionType) {
            return { success: false, reason: 'Promotion type required', needsPromotionChoice: true };
        }
        if (move.isPromotion && promotionType) {
            move.promotionType = promotionType;
        }

        const prevState = {
            piece: { ...piece, row: piece.row, col: piece.col },
            captured: null,
            enPassantTarget: this.enPassantTarget ? { ...this.enPassantTarget } : null,
            castlingRights: { ...this.castlingRights },
            fromRow, fromCol, toRow, toCol,
            wasPromotion: false,
            prevHasMoved: piece.hasMoved,
            castlingRookMove: null,
            capturedWasRemoved: false,
        };

        let captured = this.board[toRow][toCol];

        if (move.isEnPassant) {
            const capturedRow = piece.color === COLORS.WHITE ? toRow + 1 : toRow - 1;
            captured = this.board[capturedRow][toCol];
            prevState.captured = captured ? { ...captured, row: captured.row, col: captured.col } : null;
            prevState.capturedWasRemoved = true;
            this.board[capturedRow][toCol] = null;
        } else if (captured) {
            prevState.captured = { ...captured, row: captured.row, col: captured.col };
        }

        this.board[fromRow][fromCol] = null;
        piece.row = toRow;
        piece.col = toCol;
        piece.hasMoved = true;
        this.board[toRow][toCol] = piece;

        if (move.isCastling) {
            const rook = this.board[move.castlingRook.row][move.castlingRook.col];
            this.board[move.castlingRook.row][move.castlingRook.col] = null;
            rook.col = move.castlingRook.toCol;
            rook.hasMoved = true;
            this.board[move.castlingRook.row][move.castlingRook.toCol] = rook;
            prevState.castlingRookMove = {
                row: move.castlingRook.row,
                fromCol: move.castlingRook.col,
                toCol: move.castlingRook.toCol,
            };
        }

        if (move.isPromotion) {
            prevState.wasPromotion = true;
            prevState.prevType = piece.type;
            piece.type = promotionType;
        }

        this.enPassantTarget = null;
        if (move.isDoublePush) {
            const epRow = piece.color === COLORS.WHITE ? fromRow - 1 : fromRow + 1;
            this.enPassantTarget = { row: epRow, col: fromCol };
        }

        if (piece.type === PIECE_TYPES.KING) {
            if (piece.color === COLORS.WHITE) {
                this.castlingRights.wK = false;
                this.castlingRights.wQ = false;
            } else {
                this.castlingRights.bK = false;
                this.castlingRights.bQ = false;
            }
        }
        if (piece.type === PIECE_TYPES.ROOK) {
            if (piece.color === COLORS.WHITE) {
                if (fromCol === 0) this.castlingRights.wQ = false;
                if (fromCol === 7) this.castlingRights.wK = false;
            } else {
                if (fromCol === 0) this.castlingRights.bQ = false;
                if (fromCol === 7) this.castlingRights.bK = false;
            }
        }
        if (captured && captured.type === PIECE_TYPES.ROOK) {
            if (captured.color === COLORS.WHITE) {
                if (toCol === 0) this.castlingRights.wQ = false;
                if (toCol === 7) this.castlingRights.wK = false;
            } else {
                if (toCol === 0) this.castlingRights.bQ = false;
                if (toCol === 7) this.castlingRights.bK = false;
            }
        }

        if (captured) {
            this.capturedPieces[piece.color].push(captured);
        }

        if (piece.color === COLORS.BLACK) {
            this.fullMoveNumber++;
        }
        this.currentTurn = oppositeColor(piece.color);

        this.moveHistory.push(prevState);

        return {
            success: true,
            captured: prevState.captured,
            isCapture: !!captured || move.isEnPassant,
            isCastling: move.isCastling,
            isEnPassant: move.isEnPassant,
            isPromotion: move.isPromotion,
            castlingRookMove: prevState.castlingRookMove,
        };
    }

    undoMove() {
        if (this.moveHistory.length === 0) return false;
        const prev = this.moveHistory.pop();

        const piece = this.board[prev.toRow][prev.toCol];
        this.board[prev.toRow][prev.toCol] = null;

        piece.row = prev.fromRow;
        piece.col = prev.fromCol;
        piece.hasMoved = prev.prevHasMoved;
        this.board[prev.fromRow][prev.fromCol] = piece;

        if (prev.wasPromotion) {
            piece.type = prev.prevType;
        }

        if (prev.castlingRookMove) {
            const rook = this.board[prev.castlingRookMove.row][prev.castlingRookMove.toCol];
            this.board[prev.castlingRookMove.row][prev.castlingRookMove.toCol] = null;
            rook.col = prev.castlingRookMove.fromCol;
            rook.hasMoved = false;
            this.board[prev.castlingRookMove.row][prev.castlingRookMove.fromCol] = rook;
        }

        if (prev.captured) {
            if (prev.capturedWasRemoved) {
                this.board[prev.captured.row][prev.captured.col] = {
                    ...prev.captured,
                    row: prev.captured.row,
                    col: prev.captured.col,
                };
            } else {
                this.board[prev.toRow][prev.toCol] = {
                    ...prev.captured,
                    row: prev.toRow,
                    col: prev.toCol,
                };
            }
            const capturer = piece.color;
            const arr = this.capturedPieces[capturer];
            arr.pop();
        }

        this.enPassantTarget = prev.enPassantTarget;
        this.castlingRights = prev.castlingRights;
        this.currentTurn = piece.color;

        return true;
    }

    toFEN() {
        let fen = '';
        for (let r = 0; r < 8; r++) {
            let empty = 0;
            for (let c = 0; c < 8; c++) {
                const p = this.board[r][c];
                if (!p) {
                    empty++;
                } else {
                    if (empty > 0) { fen += empty; empty = 0; }
                    fen += FEN_TO_SYMBOL[p.type][p.color];
                }
            }
            if (empty > 0) fen += empty;
            if (r < 7) fen += '/';
        }
        fen += this.currentTurn === COLORS.WHITE ? ' w ' : ' b ';
        let castling = '';
        if (this.castlingRights.wK) castling += 'K';
        if (this.castlingRights.wQ) castling += 'Q';
        if (this.castlingRights.bK) castling += 'k';
        if (this.castlingRights.bQ) castling += 'q';
        fen += (castling || '-') + ' ';
        if (this.enPassantTarget) {
            fen += String.fromCharCode(97 + this.enPassantTarget.col) + (8 - this.enPassantTarget.row) + ' ';
        } else {
            fen += '- ';
        }
        fen += this.halfMoveClock + ' ' + this.fullMoveNumber;
        return fen;
    }

    fromFEN(fen) {
        this.board = Array.from({ length: 8 }, () => Array(8).fill(null));
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this._pieceCounter = { white: {}, black: {} };

        const parts = fen.trim().split(/\s+/);
        const rows = parts[0].split('/');
        for (let r = 0; r < 8; r++) {
            let c = 0;
            for (const ch of rows[r]) {
                if (ch >= '1' && ch <= '8') {
                    c += parseInt(ch);
                } else {
                    const info = PIECE_SYMBOLS[ch];
                    if (info) {
                        const id = this._nextId(info.type, info.color);
                        this.board[r][c] = createPiece(info.type, info.color, r, c, id);
                        c++;
                    }
                }
            }
        }

        this.currentTurn = parts[1] === 'b' ? COLORS.BLACK : COLORS.WHITE;

        this.castlingRights = { wK: false, wQ: false, bK: false, bQ: false };
        if (parts[2] !== '-') {
            for (const ch of parts[2]) {
                if (ch === 'K') this.castlingRights.wK = true;
                if (ch === 'Q') this.castlingRights.wQ = true;
                if (ch === 'k') this.castlingRights.bK = true;
                if (ch === 'q') this.castlingRights.bQ = true;
            }
        }

        if (parts[3] && parts[3] !== '-') {
            const col = parts[3].charCodeAt(0) - 97;
            const row = 8 - parseInt(parts[3][1]);
            this.enPassantTarget = { row, col };
        } else {
            this.enPassantTarget = null;
        }

        this.halfMoveClock = parts[4] ? parseInt(parts[4]) : 0;
        this.fullMoveNumber = parts[5] ? parseInt(parts[5]) : 1;
    }

    reset() {
        this.fromFEN(INITIAL_FEN);
    }
}
