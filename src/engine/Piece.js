export function createPiece(type, color, row, col, id) {
    return {
        type,
        color,
        row,
        col,
        hasMoved: false,
        id,
    };
}

export function clonePiece(piece) {
    return {
        type: piece.type,
        color: piece.color,
        row: piece.row,
        col: piece.col,
        hasMoved: piece.hasMoved,
        id: piece.id,
    };
}
