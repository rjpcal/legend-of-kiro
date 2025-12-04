// Obstacle - Static obstacle entity for collision testing

class Obstacle extends Entity {
    constructor(scene, x, y, width, height) {
        super(scene, x, y, null);
        
        // Set custom hitbox size
        this.hitbox = {
            width: width || 32,
            height: height || 32,
            offsetX: 0,
            offsetY: 0
        };
        
        // Obstacles don't move
        this.isStatic = true;
    }

    /**
     * Create a visual representation of the obstacle
     */
    createSprite() {
        // Create a simple rectangle graphic for the obstacle
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
