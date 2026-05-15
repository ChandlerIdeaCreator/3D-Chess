export const PIECE_TYPES = {
    KING: 'king',
    QUEEN: 'queen',
    ROOK: 'rook',
    BISHOP: 'bishop',
    KNIGHT: 'knight',
    PAWN: 'pawn',
};

export const COLORS = {
    WHITE: 'white',
    BLACK: 'black',
};

export const BOARD_SIZE = 8;

export const PIECE_SYMBOLS = {
    'K': { type: 'king', color: 'white' },
    'Q': { type: 'queen', color: 'white' },
    'R': { type: 'rook', color: 'white' },
    'B': { type: 'bishop', color: 'white' },
    'N': { type: 'knight', color: 'white' },
    'P': { type: 'pawn', color: 'white' },
    'k': { type: 'king', color: 'black' },
    'q': { type: 'queen', color: 'black' },
    'r': { type: 'rook', color: 'black' },
    'b': { type: 'bishop', color: 'black' },
    'n': { type: 'knight', color: 'black' },
    'p': { type: 'pawn', color: 'black' },
};

export const FEN_TO_SYMBOL = {
    king: { white: 'K', black: 'k' },
    queen: { white: 'Q', black: 'q' },
    rook: { white: 'R', black: 'r' },
    bishop: { white: 'B', black: 'b' },
    knight: { white: 'N', black: 'n' },
    pawn: { white: 'P', black: 'p' },
};

export const ORTHOGONAL_DIRECTIONS = [[-1,0],[1,0],[0,-1],[0,1]];
export const DIAGONAL_DIRECTIONS = [[-1,-1],[-1,1],[1,-1],[1,1]];
export const ALL_DIRECTIONS = [...ORTHOGONAL_DIRECTIONS, ...DIAGONAL_DIRECTIONS];
export const KNIGHT_OFFSETS = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];

export const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const COL_NAMES = ['a','b','c','d','e','f','g','h'];

export function squareName(row, col) {
    return COL_NAMES[col] + (8 - row);
}

export function oppositeColor(color) {
    return color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
}
