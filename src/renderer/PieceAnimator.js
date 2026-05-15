import * as THREE from 'three';

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export class PieceAnimator {
    constructor() {
        this.animations = [];
    }

    animateMove(mesh, fromWorld, toWorld, duration = 300, onComplete) {
        if (!mesh) return;
        this.animations.push({
            mesh,
            startPos: fromWorld.clone(),
            endPos: toWorld.clone(),
            elapsed: 0,
            duration,
            onComplete,
            type: 'move',
        });
    }

    animateCapture(mesh, duration = 250, onComplete) {
        if (!mesh) {
            if (onComplete) onComplete();
            return;
        }
        this.animations.push({
            mesh,
            startScale: mesh.scale.x,
            elapsed: 0,
            duration,
            onComplete,
            type: 'capture',
        });
    }

    animateLiftAndMove(mesh, fromWorld, toWorld, duration = 350, onComplete) {
        if (!mesh) return;
        const midY = Math.max(fromWorld.y, toWorld.y) + 2.0;
        this.animations.push({
            mesh,
            startPos: fromWorld.clone(),
            endPos: toWorld.clone(),
            midY,
            elapsed: 0,
            duration,
            onComplete,
            type: 'lift',
        });
    }

    update(deltaTime) {
        const deltaMs = deltaTime * 1000;
        for (let i = this.animations.length - 1; i >= 0; i--) {
            const anim = this.animations[i];
            anim.elapsed += deltaMs;
            const t = Math.min(anim.elapsed / anim.duration, 1.0);
            const eased = easeInOutCubic(t);

            switch (anim.type) {
                case 'move':
                    anim.mesh.position.lerpVectors(anim.startPos, anim.endPos, eased);
                    break;
                case 'capture': {
                    const s = (1 - eased);
                    anim.mesh.scale.setScalar(s);
                    anim.mesh.position.y = anim.mesh.position.y || 0;
                    anim.mesh.position.y = eased * 2;
                    break;
                }
                case 'lift': {
                    anim.mesh.position.lerpVectors(anim.startPos, anim.endPos, eased);
                    anim.mesh.position.y += Math.sin(eased * Math.PI) * anim.midY;
                    break;
                }
            }

            if (t >= 1.0) {
                if (anim.onComplete) {
                    anim.onComplete();
                }
                this.animations.splice(i, 1);
            }
        }
    }

    get isAnimating() {
        return this.animations.length > 0;
    }

    clear() {
        for (const anim of this.animations) {
            if (anim.type === 'capture' && anim.onComplete) {
                anim.onComplete();
            }
        }
        this.animations = [];
    }
}
