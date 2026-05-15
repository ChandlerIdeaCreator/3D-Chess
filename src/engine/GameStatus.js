import { getLegalMoves, isKingInCheck } from './MoveValidator.js';

export function getGameStatus(board, currentTurn, enPassantTarget, castlingRights) {
    let hasLegalMove = false;
    const inCheck = isKingInCheck(board, currentTurn);

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece || piece.color !== currentTurn) continue;
            const moves = getLegalMoves(board, piece, enPassantTarget, castlingRights);
            if (moves.length > 0) {
                hasLegalMove = true;
                break;
            }
        }
        if (hasLegalMove) break;
    }

    if (!hasLegalMove) {
        return inCheck ? 'checkmate' : 'stalemate';
    }
    return inCheck ? 'check' : 'playing';
}
