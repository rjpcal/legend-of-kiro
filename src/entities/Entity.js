// Entity - Base class for all game entities
// Provides position, sprite, and collision properties for all game objects

export class Entity {
    constructor(scene, x, y, spriteKey) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.spriteKey = spriteKey;

        // Sprite object (Phaser sprite)
        this.sprite = null;

        // Collision properties
        this.hitbox = {
            width: 32,
            height: 32,
            offsetX: 0,
            offsetY: 0,
        };

        // Active state
        this.active = true;
    }

    /**
     * Initialize the sprite in the scene
     */
    createSprite() {
        if (this.spriteKey && this.scene) {
            // Create sprite at entity position
            this.sprite = this.scene.add.sprite(this.x, this.y, this.spriteKey);
            this.sprite.setOrigin(0.5, 0.5);

            // Scale sprite to reasonable game size (32x32 pixels default)
            // This can be overridden in subclasses
            if (this.sprite.width > 64 || this.sprite.height > 64) {
                const scale = 32 / Math.max(this.sprite.width, this.sprite.height);
                this.sprite.setScale(scale);
            }
        }
    }

    /**
     * Get the collision hitbox for this entity
     */
    getHitbox() {
        return {
            x: this.x + this.hitbox.offsetX - this.hitbox.width / 2,
            y: this.y + this.hitbox.offsetY - this.hitbox.height / 2,
            width: this.hitbox.width,
            height: this.hitbox.height,
        };
    }

    /**
     * Set the position of the entity
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        if (this.sprite) {
            this.sprite.setPosition(x, y);
        }
    }

    /**
     * Get the current position
     */
    getPosition() {
        return { x: this.x, y: this.y };
    }

    /**
     * Update method called every frame
     * @param {number} delta - Time elapsed since last frame in milliseconds
     */
    update(delta) {
        // Base update - override in subclasses
        if (this.sprite && this.active) {
            // Sync sprite position with entity position
            this.sprite.setPosition(this.x, this.y);
        }
    }

    /**
     * Destroy the entity and clean up resources
     */
    destroy() {
        this.active = false;
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
    }
}

// Entity is now exported as ES6 module at the top of the file
