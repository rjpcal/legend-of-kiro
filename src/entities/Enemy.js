// Enemy - Base enemy class
// Extends Entity with enemy-specific properties including health and attack

import { Entity } from './Entity.js';

export class Enemy extends Entity {
    constructor(scene, x, y, enemyType, config = {}) {
        super(scene, x, y, enemyType);

        // Enemy type (zombie, skeleton, ghoul, spirit)
        this.enemyType = enemyType;

        // Health system
        this.health = {
            current: config.health || 4,
            max: config.health || 4,
        };

        // Attack properties
        this.attackDamage = config.damage || 1;
        this.attackRange = config.range || 32;
        this.attackCooldown = config.attackCooldown || 1000; // milliseconds
        this.canAttack = true;

        // Movement properties
        this.speed = config.speed || 50; // pixels per second
        this.aggroRange = config.aggroRange || 150; // Distance to detect player

        // AI state
        this.aiState = 'idle'; // idle, chase, attack, defeated
        this.target = null; // Reference to player

        // Friendly state (after being defeated)
        this.isFriendly = false;

        // Set enemy-specific hitbox
        this.hitbox = {
            width: 28,
            height: 28,
            offsetX: 0,
            offsetY: 0,
        };

        // XP reward for defeating this enemy
        this.xpReward = config.xpReward || 10;
    }

    /**
     * Initialize the enemy sprite
     */
    createSprite() {
        super.createSprite();
        if (this.sprite) {
            // Set depth for rendering order
            this.sprite.setDepth(5);

            // Initialize animation state
            if (this.scene.animationManager) {
                this.scene.animationManager.initializeEntity(this, 'idle');
            }

            // Create health bar
            this.createHealthBar();

            // Add debug label showing enemy type
            this.label = this.scene.add.text(this.x, this.y - 20, this.enemyType, {
                fontSize: '10px',
                fill: '#ff0000',
                fontFamily: 'Arial',
                backgroundColor: '#000000',
                padding: { x: 2, y: 1 },
            });
            this.label.setOrigin(0.5);
            this.label.setDepth(6);
        }
    }

    /**
     * Create health bar above enemy
     */
    createHealthBar() {
        const barWidth = 40;
        const barHeight = 4;
        const barY = this.y - 35; // Above the label

        // Background (red)
        this.healthBarBg = this.scene.add.rectangle(this.x, barY, barWidth, barHeight, 0xff0000);
        this.healthBarBg.setOrigin(0.5);
        this.healthBarBg.setDepth(6);

        // Foreground (green) - shows current health
        this.healthBarFg = this.scene.add.rectangle(this.x, barY, barWidth, barHeight, 0x00ff00);
        this.healthBarFg.setOrigin(0.5);
        this.healthBarFg.setDepth(7);

        // Update health bar to reflect current health
        this.updateHealthBar();
    }

    /**
     * Update health bar to reflect current health
     */
    updateHealthBar() {
        if (!this.healthBarFg || !this.healthBarBg) return;

        const barWidth = 40;
        const healthPercent = this.health.current / this.health.max;
        const currentWidth = barWidth * healthPercent;

        // Update foreground width
        this.healthBarFg.width = currentWidth;

        // Change color based on health percentage
        if (healthPercent > 0.6) {
            this.healthBarFg.setFillStyle(0x00ff00); // Green
        } else if (healthPercent > 0.3) {
            this.healthBarFg.setFillStyle(0xffff00); // Yellow
        } else {
            this.healthBarFg.setFillStyle(0xff8800); // Orange
        }
    }

    /**
     * AI behavior - determines enemy actions
     * Will be fully implemented in future tasks
     */
    ai() {
        if (this.isFriendly || !this.active) {
            return;
        }

        // AI logic will be implemented in combat system task
        // Basic states: idle, chase player, attack player
    }

    /**
     * Perform an attack
     */
    attack() {
        if (!this.canAttack || this.isFriendly) {
            return;
        }

        this.canAttack = false;

        // Attack logic will be implemented in combat system task

        // Reset attack cooldown
        setTimeout(() => {
            this.canAttack = true;
        }, this.attackCooldown);
    }

    /**
     * Apply damage to the enemy
     * @param {number} amount - Damage amount
     */
    takeDamage(amount) {
        if (this.isFriendly) {
            return;
        }

        this.health.current = Math.max(0, this.health.current - amount);

        // Update health bar
        this.updateHealthBar();

        if (this.health.current === 0) {
            this.defeat();
        }
    }

    /**
     * Defeat the enemy (convert to friendly)
     */
    defeat() {
        this.aiState = 'defeated';
        this.convertToFriendly();
    }

    /**
     * Convert enemy to friendly status
     * Removes from game and marks as defeated
     */
    convertToFriendly() {
        this.isFriendly = true;
        this.active = false;

        // Play defeat animation
        if (this.scene.animationManager) {
            this.scene.animationManager.setState(this, 'defeat');
        }

        // Fade out sprite, label, and health bars
        if (this.sprite && this.scene.tweens) {
            const targets = [this.sprite];
            if (this.label) {
                targets.push(this.label);
            }
            if (this.healthBarBg) {
                targets.push(this.healthBarBg);
            }
            if (this.healthBarFg) {
                targets.push(this.healthBarFg);
            }

            this.scene.tweens.add({
                targets: targets,
                alpha: 0,
                scale: 1.5,
                duration: 500,
                ease: 'Power2',
            });
        }

        // Remove from game after a short delay
        setTimeout(() => {
            this.destroy();
        }, 500);
    }

    /**
     * Get the XP reward for defeating this enemy
     */
    getXPReward() {
        return this.xpReward;
    }

    /**
     * Set the target (player) for AI
     * @param {Player} player - Player entity
     */
    setTarget(player) {
        this.target = player;
    }

    /**
     * Check if player is in aggro range
     */
    isPlayerInRange() {
        if (!this.target) {
            return false;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= this.aggroRange;
    }

    /**
     * Update enemy state
     * @param {number} delta - Time elapsed since last frame
     */
    update(delta) {
        super.update(delta);

        if (!this.isFriendly && this.active) {
            this.ai();
            this.updateAnimationState();
        }

        // Update health bar position
        if (this.healthBarBg && this.healthBarFg) {
            const barY = this.y - 35;
            this.healthBarBg.setPosition(this.x, barY);
            this.healthBarFg.setPosition(this.x, barY);
        }

        // Update label position
        if (this.label) {
            this.label.setPosition(this.x, this.y - 20);
        }
    }

    /**
     * Update animation state based on enemy state
     */
    updateAnimationState() {
        if (!this.scene.animationManager) {
            return;
        }

        // Determine animation state based on AI state
        let animState = 'idle';

        if (this.aiState === 'attack') {
            animState = 'attack';
        } else if (this.aiState === 'chase') {
            animState = 'move';
        } else if (this.aiState === 'defeated') {
            animState = 'defeat';
        }

        // Update animation state
        this.scene.animationManager.setState(this, animState);
    }

    /**
     * Destroy the enemy and clean up resources
     */
    destroy() {
        // Destroy health bars
        if (this.healthBarBg) {
            this.healthBarBg.destroy();
            this.healthBarBg = null;
        }
        if (this.healthBarFg) {
            this.healthBarFg.destroy();
            this.healthBarFg = null;
        }

        // Destroy label
        if (this.label) {
            this.label.destroy();
            this.label = null;
        }

        // Call parent destroy
        super.destroy();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Enemy;
}
