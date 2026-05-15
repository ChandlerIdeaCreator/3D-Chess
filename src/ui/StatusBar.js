import { COLORS } from '../engine/constants.js';

export class StatusBar {
    constructor() {
        this.element = document.getElementById('status-bar');
        this._newGameCallback = null;
    }

    update(status, currentTurn) {
        this.element.className = '';

        if (status === 'checkmate') {
            const winner = currentTurn === COLORS.WHITE ? 'Black' : 'White';
            this.element.textContent = `Checkmate! ${winner} wins!`;
            this.element.classList.add('checkmate');
        } else if (status === 'stalemate') {
            this.element.textContent = 'Stalemate! Draw!';
            this.element.classList.add('stalemate');
        } else if (status === 'check') {
            this.element.textContent = `${currentTurn === COLORS.WHITE ? 'White' : 'Black'} is in Check!`;
            this.element.classList.add('check');
            this.element.classList.add(`turn-${currentTurn}`);
        } else {
            this.element.textContent = `${currentTurn === COLORS.WHITE ? 'White' : 'Black'}'s turn`;
            this.element.classList.add(`turn-${currentTurn}`);
        }
    }

    showGameOver(status, currentTurn) {
        this.update(status, currentTurn);

        const existingBtn = this.element.querySelector('button');
        if (existingBtn) existingBtn.remove();

        const btn = document.createElement('button');
        btn.textContent = 'New Game';
        btn.style.cssText = `
            display: block; margin: 10px auto 0;
            padding: 8px 20px; font-size: 15px; font-weight: 600;
            border: none; border-radius: 6px; cursor: pointer;
            background: #4CAF50; color: #fff;
            transition: background 0.15s;
        `;
        btn.addEventListener('mouseenter', () => btn.style.background = '#45a049');
        btn.addEventListener('mouseleave', () => btn.style.background = '#4CAF50');
        btn.addEventListener('click', () => {
            if (this._newGameCallback) this._newGameCallback();
        });
        this.element.appendChild(btn);
    }
}
