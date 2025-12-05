// Switch - Pressure plate switch entity for puzzle mechanics

import { Entity } from './Entity.js';

export class Switch extends Entity {
    constructor(scene, x, y, activates = null) {
        super(scene, x, y, 'switch');

        // Set hitbox
        this.hitbox = {
            width: 50,
            height: 50,
            offsetX: 0,
            offsetY: 0,
        };

        // Switch state
        this.isActivated = false;
        this.activates = activates; // ID of door or mechanism this switch activates
    }

    /**
     * Create sprite for the switch
     */
    createSprite() {
        // Create a visual representation
        const graphics = this.scene.add.graphics();

        // Draw switch plate
        graphics.fillStyle(this.isActivated ? 0x00ff00 : 0x666666, 1);
        graphics.fillCircle(0, 0, 20);

        // Add border
        graphics.lineStyle(2, 0x333333, 1);
        graphics.strokeCircle(0, 0, 20);

        graphics.setPosition(this.x, this.y);
        graphics.setDepth(1); // Below blocks and player

        this.sprite = graphics;
    }

    /**
     * Activate the switch
     */
    activate() {
        if (!this.isActivated) {
            this.isActivated = true;
            this.updateSprite();
        }
    }

    /**
     * Deactivate the switch
     */
    deactivate() {
        if (this.isActivated) {
            this.isActivated = false;
            this.updateSprite();
        }
    }

    /**
     * Update sprite appearance based on activation state
     */
    updateSprite() {
        if (this.sprite) {
            this.sprite.destroy();
            this.createSprite();
        }
    }

    /**
     * Update switch state
     */
    update(_delta) {
        super.update(_delta);
    }
}
