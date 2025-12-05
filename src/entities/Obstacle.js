// Obstacle - Static obstacle entity for collision testing

import { Entity } from './Entity.js';

export class Obstacle extends Entity {
    constructor(scene, x, y, width, height, type = 'wall') {
        super(scene, x, y, null);

        // Set custom hitbox size
        this.hitbox = {
            width: width || 32,
            height: height || 32,
            offsetX: 0,
            offsetY: 0,
        };

        // Store obstacle type
        this.obstacleType = type;

        // Obstacles don't move
        this.isStatic = true;
    }

    /**
     * Create a visual representation of the obstacle
     */
    createSprite() {
        // Try to use sprite texture if available, otherwise use graphics
        const spriteKey = this.obstacleType;

        if (this.scene.textures.exists(spriteKey)) {
            // Use the sprite texture
            this.sprite = this.scene.add.image(this.x, this.y, spriteKey);
            this.sprite.setDisplaySize(this.hitbox.width, this.hitbox.height);
        } else {
            // Fallback to gray rectangle
            const graphics = this.scene.add.graphics();
            graphics.fillStyle(0x555555, 1);
            graphics.fillRect(
                -this.hitbox.width / 2,
                -this.hitbox.height / 2,
                this.hitbox.width,
                this.hitbox.height
            );
            graphics.setPosition(this.x, this.y);
            this.sprite = graphics;
        }
    }

    /**
     * Obstacles don't need to update
     */
    update(delta) {
        // Static obstacles don't update
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Obstacle;
}
