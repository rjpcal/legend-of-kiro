// PushableBlock - Movable block entity for puzzle mechanics

import { Entity } from './Entity.js';

export class PushableBlock extends Entity {
    constructor(scene, x, y, width = 50, height = 50) {
        super(scene, x, y, 'block');

        // Set hitbox
        this.hitbox = {
            width: width,
            height: height,
            offsetX: 0,
            offsetY: 0,
        };

        // Push state
        this.isPushing = false;
        this.pushSpeed = 100; // pixels per second
    }

    /**
     * Create sprite for the block
     */
    createSprite() {
        // Create a visual representation
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0x8b4513, 1); // Brown color
        graphics.fillRect(
            -this.hitbox.width / 2,
            -this.hitbox.height / 2,
            this.hitbox.width,
            this.hitbox.height
        );
        // Add border
        graphics.lineStyle(2, 0x654321, 1);
        graphics.strokeRect(
            -this.hitbox.width / 2,
            -this.hitbox.height / 2,
            this.hitbox.width,
            this.hitbox.height
        );
        graphics.setPosition(this.x, this.y);
        graphics.setDepth(5);

        this.sprite = graphics;
    }

    /**
     * Push the block in a direction
     * @param {string} direction - Direction to push ('up', 'down', 'left', 'right')
     * @param {number} distance - Distance to push
     * @returns {boolean} True if push was successful
     */
    push(direction, distance) {
        // Store intended position
        this.intendedX = this.x;
        this.intendedY = this.y;

        switch (direction) {
            case 'up':
                this.intendedY -= distance;
                break;
            case 'down':
                this.intendedY += distance;
                break;
            case 'left':
                this.intendedX -= distance;
                break;
            case 'right':
                this.intendedX += distance;
                break;
        }

        return true;
    }

    /**
     * Apply the intended push movement
     */
    applyPush() {
        if (this.intendedX !== undefined) {
            this.x = this.intendedX;
        }
        if (this.intendedY !== undefined) {
            this.y = this.intendedY;
        }

        // Update sprite position
        if (this.sprite) {
            this.sprite.setPosition(this.x, this.y);
        }

        this.intendedX = undefined;
        this.intendedY = undefined;
    }

    /**
     * Cancel the intended push
     */
    cancelPush() {
        this.intendedX = undefined;
        this.intendedY = undefined;
    }

    /**
     * Get intended position after push
     */
    getIntendedPosition() {
        return {
            x: this.intendedX !== undefined ? this.intendedX : this.x,
            y: this.intendedY !== undefined ? this.intendedY : this.y,
        };
    }

    /**
     * Update block state
     */
    update(_delta) {
        super.update(_delta);
    }
}
