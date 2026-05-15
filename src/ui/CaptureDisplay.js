import { COLORS } from '../engine/constants.js';

const PIECE_CHARS = {
    king: { white: '♔', black: '♚' },
    queen: { white: '♕', black: '♛' },
    rook: { white: '♖', black: '♜' },
    bishop: { white: '♗', black: '♝' },
    knight: { white: '♘', black: '♞' },
    pawn: { white: '♙', black: '♟' },
};

const PIECE_VALUE = { queen: 9, rook: 5, bishop: 3, knight: 3, pawn: 1, king: 0 };

export class CaptureDisplay {
    constructor() {
        this.whiteEl = document.getElementById('capture-display-white');
        this.blackEl = document.getElementById('capture-display-black');
    }

    update(capturedPieces) {
        this._renderSide(this.whiteEl, capturedPieces[COLORS.WHITE], COLORS.WHITE);
        this._renderSide(this.blackEl, capturedPieces[COLORS.BLACK], COLORS.BLACK);
    }

    _renderSide(el, pieces, capturingColor) {
        const displayColor = capturingColor === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;

        const sorted = [...pieces].sort((a, b) => {
            // Show highest value first
            return (PIECE_VALUE[b.type] || 0) - (PIECE_VALUE[a.type] || 0);
        });

        el.textContent = sorted.map(p => PIECE_CHARS[p.type]?.[displayColor] || '?').join('');
    }
}
