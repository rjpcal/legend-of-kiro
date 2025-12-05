// RippleEffect - Creates a rippling animation effect for sprites
// Applies a wave-like distortion to create a ghostly appearance

export class RippleEffect {
    constructor(scene) {
        this.scene = scene;
        this.rippleSprites = new Map(); // Track sprites with ripple effect
    }

    /**
     * Apply ripple effect to a sprite
     * @param {Phaser.GameObjects.Sprite} sprite - Sprite to apply effect to
     * @param {object} config - Configuration options
     */
    applyRipple(sprite, config = {}) {
        if (!sprite) {
            return;
        }

        const rippleConfig = {
            amplitude: config.amplitude || 0.015, // Wave height
            frequency: config.frequency || 3, // Wave frequency
            speed: config.speed || 2, // Animation speed
            enabled: true,
        };

        // Store the sprite's current scale as the base scale
        const baseScaleX = sprite.scaleX;
        const baseScaleY = sprite.scaleY;

        // Store configuration
        this.rippleSprites.set(sprite, {
            config: rippleConfig,
            time: 0,
            baseScaleX: baseScaleX,
            baseScaleY: baseScaleY,
        });

        // Try to use shader pipeline if available (Phaser 3.50+)
        if (this.scene.renderer.pipelines) {
            // For now, we'll use a simpler approach with scale/alpha tweens
            // Full shader implementation can be added later if needed
            this.applySimpleRipple(sprite, rippleConfig, baseScaleX, baseScaleY);
        } else {
            // Fallback to simple animation
            this.applySimpleRipple(sprite, rippleConfig, baseScaleX, baseScaleY);
        }
    }

    /**
     * Apply a simple ripple effect using tweens and transforms
     * @param {Phaser.GameObjects.Sprite} sprite - Sprite to animate
     * @param {object} config - Ripple configuration
     * @param {number} baseScaleX - Base X scale to animate from
     * @param {number} baseScaleY - Base Y scale to animate from
     */
    applySimpleRipple(sprite, config, baseScaleX, baseScaleY) {
        // Create a subtle pulsing/rippling effect using scale
        // Apply amplitude relative to the base scale
        const scaleTween = this.scene.tweens.add({
            targets: sprite,
            scaleX: baseScaleX * (1 + config.amplitude),
            scaleY: baseScaleY * (1 - config.amplitude * 0.5),
            duration: 1000 / config.speed,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
        });

        // Add subtle alpha pulse for ghostly effect
        const alphaTween = this.scene.tweens.add({
            targets: sprite,
            alpha: 0.85,
            duration: 1500 / config.speed,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
        });

        // Store tweens for cleanup
        const rippleData = this.rippleSprites.get(sprite);
        if (rippleData) {
            rippleData.scaleTween = scaleTween;
            rippleData.alphaTween = alphaTween;
        }
    }

    /**
     * Remove ripple effect from a sprite
     * @param {Phaser.GameObjects.Sprite} sprite - Sprite to remove effect from
     */
    removeRipple(sprite) {
        const rippleData = this.rippleSprites.get(sprite);

        if (rippleData) {
            // Stop tweens if they exist
            if (rippleData.scaleTween) {
                rippleData.scaleTween.remove();
            }
            if (rippleData.alphaTween) {
                rippleData.alphaTween.remove();
            }

            // Reset sprite properties to base scale
            sprite.setScale(rippleData.baseScaleX || 1, rippleData.baseScaleY || 1);
            sprite.setAlpha(1);

            // Remove from tracking
            this.rippleSprites.delete(sprite);
        }
    }

    /**
     * Enable/disable ripple effect for a sprite
     * @param {Phaser.GameObjects.Sprite} sprite - Sprite to modify
     * @param {boolean} enabled - Enable or disable
     */
    setEnabled(sprite, enabled) {
        const rippleData = this.rippleSprites.get(sprite);

        if (rippleData) {
            rippleData.config.enabled = enabled;

            if (!enabled) {
                // Reset to normal state
                sprite.setScale(1, 1);
                sprite.setAlpha(1);
            }
        }
    }

    /**
     * Update ripple effects (called each frame)
     * @param {number} delta - Time elapsed since last frame
     */
    update(delta) {
        // Update time for each ripple sprite
        this.rippleSprites.forEach((rippleData, sprite) => {
            if (rippleData.config.enabled) {
                rippleData.time += delta;
            }
        });
    }

    /**
     * Clean up all ripple effects
     */
    destroy() {
        // Remove all ripple effects
        this.rippleSprites.forEach((rippleData, sprite) => {
            this.removeRipple(sprite);
        });

        this.rippleSprites.clear();
    }
}
