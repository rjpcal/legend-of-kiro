// Collectible - Base class for collectible items
// Includes coins, health power-ups, weapons, and armor

class Collectible {
    constructor(scene, x, y, type, config = {}) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.type = type; // 'coin', 'health', 'weapon', 'armor'
        
        // Collectible properties
        this.value = config.value || 1;
        this.sprite = null;
        this.active = true;
        
        // Hitbox for collection detection
        this.hitbox = {
            width: 24,
            height: 24,
            offsetX: 0,
            offsetY: 0
        };
        
        // Additional properties for specific types
        this.config = config;
    }

    /**
     * Create the sprite for this collectible
     */
    createSprite() {
        if (this.scene) {
            // Use appropriate sprite based on type
            let spriteKey = this.type;
            
            // For now, use placeholder sprites
            // These will be replaced with actual game assets
            this.sprite = this.scene.add.sprite(this.x, this.y, spriteKey);
            this.sprite.setOrigin(0.5, 0.5);
            this.sprite.setDepth(1);
            
            // Add a subtle floating animation
            if (this.scene.tweens) {
                this.scene.tweens.add({
                    targets: this.sprite,
                    y: this.y - 5,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        }
    }

    /**
     * Get the collision hitbox for this collectible
     */
    getHitbox() {
        return {
            x: this.x + this.hitbox.offsetX - this.hitbox.width / 2,
            y: this.y + this.hitbox.offsetY - this.hitbox.height / 2,
            width: this.hitbox.width,
            height: this.hitbox.height
        };
    }

    /**
     * Collect this item
     * @param {Player} player - Player collecting the item
     */
    collect(player) {
        if (!this.active) {
            return false;
        }

        this.active = false;

        // Apply collection effect based on type
        switch (this.type) {
            case 'coin':
                player.inventory.coins += this.value;
                break;
            case 'health':
                // Heal player, respecting max health
                const oldHealth = player.health.current;
                player.health.current = Math.min(
                    player.health.max,
                    player.health.current + this.value
                );
                break;
            case 'weapon':
                player.inventory.items.push({
                    type: 'weapon',
                    ...this.config
                });
                break;
            case 'armor':
                player.inventory.items.push({
                    type: 'armor',
                    ...this.config
                });
                break;
        }

        // Play collection sound effect
        if (this.scene.sound) {
            const soundKey = this.type === 'coin' ? 'coin_collect' : 
                           this.type === 'health' ? 'health_pickup' : 'item_collect';
            if (this.scene.sound.get(soundKey)) {
                this.scene.sound.play(soundKey);
            }
        }

        // Create particle effects
        this.createCollectionEffect();

        // Remove sprite
        this.destroy();

        return true;
    }

    /**
     * Create particle effects for collection
     */
    createCollectionEffect() {
        // Particle effects will be implemented in visual effects task
        // For now, just fade out the sprite
        if (this.sprite && this.scene.tweens) {
            this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0,
                scale: 1.5,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    if (this.sprite) {
                        this.sprite.destroy();
                    }
                }
            });
        }
    }

    /**
     * Update collectible (called each frame)
     * @param {number} delta - Time elapsed since last frame
     */
    update(delta) {
        // Base update - can be extended in subclasses
    }

    /**
     * Destroy the collectible and clean up resources
     */
    destroy() {
        this.active = false;
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
    }

    /**
     * Get position
     */
    getPosition() {
        return { x: this.x, y: this.y };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Collectible;
}
