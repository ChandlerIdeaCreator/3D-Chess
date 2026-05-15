import { PIECE_TYPES, COLORS } from '../engine/constants.js';

const PIECE_UNICODE = {
    white: { queen: '♕', rook: '♖', bishop: '♗', knight: '♘' },
    black: { queen: '♛', rook: '♜', bishop: '♝', knight: '♞' },
};

export class PromotionDialog {
    constructor() {
        this.element = document.getElementById('promotion-dialog');
        this._resolve = null;
        this._buildUI();
    }

    _buildUI() {
        this.element.innerHTML = `
            <div class="prompt-text">Choose promotion piece:</div>
            <div class="btn-row"></div>
        `;
    }

    show(color) {
        return new Promise((resolve) => {
            this._resolve = resolve;
            this.element.classList.remove('hidden');

            const charMap = PIECE_UNICODE[color];
            const types = [PIECE_TYPES.QUEEN, PIECE_TYPES.ROOK, PIECE_TYPES.BISHOP, PIECE_TYPES.KNIGHT];
            const row = this.element.querySelector('.btn-row');
            row.innerHTML = '';

            for (const type of types) {
                const btn = document.createElement('button');
                btn.textContent = charMap[type];
                btn.title = type.charAt(0).toUpperCase() + type.slice(1);
                btn.addEventListener('click', () => {
                    this.hide();
                    resolve(type);
                });
                row.appendChild(btn);
            }
        });
    }

    hide() {
        this.element.classList.add('hidden');
    }

    get isVisible() {
        return !this.element.classList.contains('hidden');
    }
}
