import {
    PIECE_TYPES, COLORS, ORTHOGONAL_DIRECTIONS, DIAGONAL_DIRECTIONS,
    ALL_DIRECTIONS, KNIGHT_OFFSETS, oppositeColor,
} from './constants.js';

function inBounds(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function getPawnMoves(board, piece, enPassantTarget) {
    const moves = [];
    const dir = piece.color === COLORS.WHITE ? -1 : 1;
    const startRow = piece.color === COLORS.WHITE ? 6 : 1;
    const promoRow = piece.color === COLORS.WHITE ? 0 : 7;
    const { row, col } = piece;

    const forward = row + dir;
    if (inBounds(forward, col) && !board[forward][col]) {
        if (forward === promoRow) {
            for (const type of [PIECE_TYPES.QUEEN, PIECE_TYPES.ROOK, PIECE_TYPES.BISHOP, PIECE_TYPES.KNIGHT]) {
                moves.push({ row: forward, col, isCapture: false, isPromotion: true, promotionType: type });
            }
        } else {
            moves.push({ row: forward, col, isCapture: false });
        }

        const doubleRow = row + 2 * dir;
        if (row === startRow && !board[doubleRow][col]) {
            moves.push({ row: doubleRow, col, isCapture: false, isDoublePush: true });
        }
    }

    for (const dc of [-1, 1]) {
        const nc = col + dc;
        if (inBounds(forward, nc)) {
            const target = board[forward][nc];
            if (target && target.color !== piece.color) {
                if (forward === promoRow) {
                    for (const type of [PIECE_TYPES.QUEEN, PIECE_TYPES.ROOK, PIECE_TYPES.BISHOP, PIECE_TYPES.KNIGHT]) {
                        moves.push({ row: forward, col: nc, isCapture: true, isPromotion: true, promotionType: type });
                    }
                } else {
                    moves.push({ row: forward, col: nc, isCapture: true });
                }
            }
        }
    }

    if (enPassantTarget && enPassantTarget.row === forward &&
        Math.abs(enPassantTarget.col - col) === 1) {
        moves.push({ row: forward, col: enPassantTarget.col, isCapture: true, isEnPassant: true });
    }

    return moves;
}

function getKnightMoves(board, piece) {
    const moves = [];
    for (const [dr, dc] of KNIGHT_OFFSETS) {
        const r = piece.row + dr;
        const c = piece.col + dc;
        if (!inBounds(r, c)) continue;
        const target = board[r][c];
        if (!target || target.color !== piece.color) {
            moves.push({ row: r, col: c, isCapture: !!target });
        }
    }
    return moves;
}

function getSlidingMoves(board, piece, directions) {
    const moves = [];
    for (const [dr, dc] of directions) {
        let r = piece.row + dr;
        let c = piece.col + dc;
        while (inBounds(r, c)) {
            const target = board[r][c];
            if (!target) {
                moves.push({ row: r, col: c, isCapture: false });
            } else {
                if (target.color !== piece.color) {
                    moves.push({ row: r, col: c, isCapture: true });
                }
                break;
            }
            r += dr;
            c += dc;
        }
    }
    return moves;
}

function getKingMoves(board, piece, castlingRights) {
    const moves = [];
    for (const [dr, dc] of ALL_DIRECTIONS) {
        const r = piece.row + dr;
        const c = piece.col + dc;
        if (!inBounds(r, c)) continue;
        const target = board[r][c];
        if (!target || target.color !== piece.color) {
            moves.push({ row: r, col: c, isCapture: !!target });
        }
    }

    // Castling
    if (castlingRights) {
        const row = piece.color === COLORS.WHITE ? 7 : 0;
        if (piece.row === row && piece.col === 4) {
            // King-side
            const ksKey = piece.color === COLORS.WHITE ? 'wK' : 'bK';
            if (castlingRights[ksKey]) {
                if (!board[row][5] && !board[row][6]) {
                    if (!isSquareAttacked(board, row, 4, oppositeColor(piece.color)) &&
                        !isSquareAttacked(board, row, 5, oppositeColor(piece.color)) &&
                        !isSquareAttacked(board, row, 6, oppositeColor(piece.color))) {
                        moves.push({ row, col: 6, isCapture: false, isCastling: true, castlingRook: { row, col: 7, toCol: 5 } });
                    }
                }
            }
            // Queen-side
            const qsKey = piece.color === COLORS.WHITE ? 'wQ' : 'bQ';
            if (castlingRights[qsKey]) {
                if (!board[row][3] && !board[row][2] && !board[row][1]) {
                    if (!isSquareAttacked(board, row, 4, oppositeColor(piece.color)) &&
                        !isSquareAttacked(board, row, 3, oppositeColor(piece.color)) &&
                        !isSquareAttacked(board, row, 2, oppositeColor(piece.color))) {
                        moves.push({ row, col: 2, isCapture: false, isCastling: true, castlingRook: { row, col: 0, toCol: 3 } });
                    }
                }
            }
        }
    }

    return moves;
}

function getPseudoLegalMoves(board, piece, enPassantTarget, castlingRights) {
    switch (piece.type) {
        case PIECE_TYPES.PAWN:   return getPawnMoves(board, piece, enPassantTarget);
        case PIECE_TYPES.KNIGHT: return getKnightMoves(board, piece);
        case PIECE_TYPES.BISHOP: return getSlidingMoves(board, piece, DIAGONAL_DIRECTIONS);
        case PIECE_TYPES.ROOK:   return getSlidingMoves(board, piece, ORTHOGONAL_DIRECTIONS);
        case PIECE_TYPES.QUEEN:  return getSlidingMoves(board, piece, ALL_DIRECTIONS);
        case PIECE_TYPES.KING:   return getKingMoves(board, piece, castlingRights);
        default: return [];
    }
}

function simulateMove(board, piece, move) {
    const newBoard = board.map(r => r.map(c => c ? { ...c } : null));
    newBoard[piece.row][piece.col] = null;

    if (move.isEnPassant) {
        const capturedRow = piece.color === COLORS.WHITE ? move.row + 1 : move.row - 1;
        newBoard[capturedRow][move.col] = null;
    }

    newBoard[move.row][move.col] = { ...piece, row: move.row, col: move.col };
    return newBoard;
}

function findKing(board, color) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.type === PIECE_TYPES.KING && p.color === color) {
                return { row: r, col: c };
            }
        }
    }
    return null;
}

function getPawnAttacks(board, piece) {
    const attacks = [];
    const dir = piece.color === COLORS.WHITE ? -1 : 1;
    const forward = piece.row + dir;
    for (const dc of [-1, 1]) {
        const nc = piece.col + dc;
        if (inBounds(forward, nc)) {
            attacks.push({ row: forward, col: nc });
        }
    }
    return attacks;
}

function isSquareAttacked(board, row, col, byColor) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p || p.color !== byColor) continue;

            if (p.type === PIECE_TYPES.PAWN) {
                const attacks = getPawnAttacks(board, p);
                for (const a of attacks) {
                    if (a.row === row && a.col === col) return true;
                }
            } else {
                const moves = getPseudoLegalMoves(board, p, null, null);
                for (const m of moves) {
                    if (m.row === row && m.col === col) return true;
                }
            }
        }
    }
    return false;
}

function isKingInCheck(board, color) {
    const kingPos = findKing(board, color);
    if (!kingPos) return false;
    return isSquareAttacked(board, kingPos.row, kingPos.col, oppositeColor(color));
}

export function getLegalMoves(board, piece, enPassantTarget, castlingRights) {
    const pseudo = getPseudoLegalMoves(board, piece, enPassantTarget, castlingRights);
    const legal = [];
    for (const move of pseudo) {
        const simBoard = simulateMove(board, piece, move);
        if (!isKingInCheck(simBoard, piece.color)) {
            legal.push(move);
        }
    }
    return legal;
}

export { getPseudoLegalMoves, isSquareAttacked, isKingInCheck, findKing };
