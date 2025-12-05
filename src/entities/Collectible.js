// Collectible - Base class for collectible items
// Includes coins, health power-ups, weapons, and armor

// Sprite configuration constants
const SPRITE_CONFIG = {
    TEXTURE_SIZE: 24,
    get CENTER() {
        return this.TEXTURE_SIZE / 2;
    },
};

export class Collectible {
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
            width: SPRITE_CONFIG.TEXTURE_SIZE,
            height: SPRITE_CONFIG.TEXTURE_SIZE,
            offsetX: 0,
            offsetY: 0,
        };

        // Additional properties for specific types
        this.config = config;
    }

    /**
     * Create the sprite for this collectible
     */
    createSprite() {
        if (!this.scene || !this.scene.add) {
            return;
        }

        // Create visual representation based on type
        switch (this.type) {
            case 'coin':
                this.createCoinSprite();
                break;
            case 'health':
                this.createHealthSprite();
                break;
            case 'weapon':
                this.createWeaponSprite();
                break;
            case 'armor':
                this.createArmorSprite();
                break;
            default:
                this.createDefaultSprite();
        }

        if (this.sprite) {
            this.sprite.setDepth(1);

            // Add a subtle floating animation
            if (this.scene.tweens) {
                this.scene.tweens.add({
                    targets: this.sprite,
                    y: this.y - 5,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                });
            }
        }
    }

    /**
     * Create coin sprite (gold circle)
     */
    createCoinSprite() {
        const graphics = this.scene.add.graphics();
        const center = SPRITE_CONFIG.CENTER;
        const size = SPRITE_CONFIG.TEXTURE_SIZE;

        // Draw gold coin
        const radius = size * 0.42; // 42% of texture size
        graphics.fillStyle(0xffd700, 1); // Gold
        graphics.fillCircle(center, center, radius);
        graphics.lineStyle(2, 0xffa500, 1); // Orange border
        graphics.strokeCircle(center, center, radius);

        // Add shine effect
        graphics.fillStyle(0xffffff, 0.5);
        graphics.fillCircle(center - 3, center - 3, 3);

        graphics.generateTexture('coin_texture', size, size);
        graphics.destroy();

        this.sprite = this.scene.add.sprite(this.x, this.y, 'coin_texture');
        this.sprite.setOrigin(0.5, 0.5);
    }

    /**
     * Create health sprite (red heart)
     */
    createHealthSprite() {
        const graphics = this.scene.add.graphics();
        const center = SPRITE_CONFIG.CENTER;
        const size = SPRITE_CONFIG.TEXTURE_SIZE;

        // Draw heart shape (proportional to texture size)
        const heartRadius = size * 0.25; // 25% of texture size
        const heartWidth = size * 0.42; // 42% of texture size

        graphics.fillStyle(0xff0000, 1); // Red
        graphics.fillCircle(center - heartRadius, center - 2, heartRadius);
        graphics.fillCircle(center + heartRadius, center - 2, heartRadius);
        graphics.beginPath();
        graphics.moveTo(center - heartWidth, center);
        graphics.lineTo(center, center + heartWidth);
        graphics.lineTo(center + heartWidth, center);
        graphics.closePath();
        graphics.fillPath();

        // Add highlight
        graphics.fillStyle(0xff6666, 1);
        graphics.fillCircle(center - 3, center - 4, 2);

        graphics.generateTexture('health_texture', size, size);
        graphics.destroy();

        this.sprite = this.scene.add.sprite(this.x, this.y, 'health_texture');
        this.sprite.setOrigin(0.5, 0.5);
    }

    /**
     * Create weapon sprite (sword)
     */
    createWeaponSprite() {
        const graphics = this.scene.add.graphics();
        const center = SPRITE_CONFIG.CENTER;
        const size = SPRITE_CONFIG.TEXTURE_SIZE;

        // Proportional dimensions
        const bladeWidth = size * 0.17;
        const bladeHeight = size * 0.5;
        const guardWidth = size * 0.5;
        const guardHeight = size * 0.08;
        const handleWidth = size * 0.125;
        const handleHeight = size * 0.25;

        // Draw sword blade
        graphics.fillStyle(0xc0c0c0, 1); // Silver blade
        graphics.fillRect(
            center - bladeWidth / 2,
            center - bladeHeight * 0.67,
            bladeWidth,
            bladeHeight
        );

        // Crossguard
        graphics.fillStyle(0x8b4513, 1); // Brown
        graphics.fillRect(
            center - guardWidth / 2,
            center + bladeHeight * 0.33,
            guardWidth,
            guardHeight
        );

        // Handle
        graphics.fillStyle(0x654321, 1); // Dark brown
        graphics.fillRect(
            center - handleWidth / 2,
            center + bladeHeight * 0.5,
            handleWidth,
            handleHeight
        );

        // Pommel
        graphics.fillStyle(0xffd700, 1); // Gold
        graphics.fillCircle(center, center + size * 0.5, 2);

        graphics.generateTexture('weapon_texture', size, size);
        graphics.destroy();

        this.sprite = this.scene.add.sprite(this.x, this.y, 'weapon_texture');
        this.sprite.setOrigin(0.5, 0.5);
    }

    /**
     * Create armor sprite (shield)
     */
    createArmorSprite() {
        const graphics = this.scene.add.graphics();
        const center = SPRITE_CONFIG.CENTER;
        const size = SPRITE_CONFIG.TEXTURE_SIZE;

        // Proportional dimensions
        const shieldWidth = size * 0.67;
        const shieldHeight = size * 0.92;

        // Draw shield
        graphics.fillStyle(0x4169e1, 1); // Royal blue
        graphics.beginPath();
        graphics.moveTo(center, center - shieldHeight * 0.45);
        graphics.lineTo(center + shieldWidth * 0.4, center - shieldHeight * 0.27);
        graphics.lineTo(center + shieldWidth * 0.4, center + shieldHeight * 0.27);
        graphics.lineTo(center, center + shieldHeight * 0.55);
        graphics.lineTo(center - shieldWidth * 0.4, center + shieldHeight * 0.27);
        graphics.lineTo(center - shieldWidth * 0.4, center - shieldHeight * 0.27);
        graphics.closePath();
        graphics.fillPath();

        // Border
        graphics.lineStyle(2, 0xc0c0c0, 1); // Silver
        graphics.strokePath();

        // Emblem
        graphics.fillStyle(0xffd700, 1); // Gold
        graphics.fillCircle(center, center, 3);

        graphics.generateTexture('armor_texture', size, size);
        graphics.destroy();

        this.sprite = this.scene.add.sprite(this.x, this.y, 'armor_texture');
        this.sprite.setOrigin(0.5, 0.5);
    }

    /**
     * Create default sprite (fallback)
     */
    createDefaultSprite() {
        const graphics = this.scene.add.graphics();
        const center = SPRITE_CONFIG.CENTER;
        const size = SPRITE_CONFIG.TEXTURE_SIZE;

        const boxSize = size * 0.83; // 83% of texture size
        graphics.fillStyle(0x00ff00, 1); // Green
        graphics.fillRect(center - boxSize / 2, center - boxSize / 2, boxSize, boxSize);
        graphics.generateTexture('default_collectible', size, size);
        graphics.destroy();

        this.sprite = this.scene.add.sprite(this.x, this.y, 'default_collectible');
        this.sprite.setOrigin(0.5, 0.5);
    }

    /**
     * Get the collision hitbox for this collectible
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
     * Collect this item
     * @param {Player} player - Player collecting the item
     * @returns {boolean} True if collection was successful
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
                // Heal player, respecting max health (Property 9)
                player.health.current = Math.min(
                    player.health.max,
                    player.health.current + this.value
                );
                break;
            case 'weapon':
                player.inventory.items.push({
                    type: 'weapon',
                    name: this.config.name || 'Weapon',
                    damage: this.config.damage || 1,
                    ...this.config,
                });
                break;
            case 'armor':
                player.inventory.items.push({
                    type: 'armor',
                    name: this.config.name || 'Armor',
                    defense: this.config.defense || 1,
                    ...this.config,
                });
                break;
        }

        // Play collection sound effect
        if (this.scene && this.scene.sound) {
            const soundKey =
                this.type === 'coin'
                    ? 'coin_collect'
                    : this.type === 'health'
                      ? 'health_pickup'
                      : 'item_collect';
            // Only play if sound exists
            try {
                if (this.scene.sound.get && this.scene.sound.get(soundKey)) {
                    this.scene.sound.play(soundKey);
                }
            } catch (e) {
                // Sound not loaded yet, skip
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
     * Validates: Requirements 10.2 (Property 33)
     */
    createCollectionEffect() {
        // Create particle effects based on collectible type
        if (this.scene.particleSystem) {
            switch (this.type) {
                case 'coin':
                    this.scene.particleSystem.createCoinCollectionEffect(this.x, this.y);
                    break;
                case 'health':
                    this.scene.particleSystem.createHealthCollectionEffect(this.x, this.y);
                    break;
                case 'weapon':
                case 'armor':
                    this.scene.particleSystem.createItemCollectionEffect(this.x, this.y);
                    break;
                default:
                    this.scene.particleSystem.createItemCollectionEffect(this.x, this.y);
            }
        }

        // Fade out the sprite
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
                },
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
