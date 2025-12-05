// Boss - Boss enemy class
// Extends Enemy with enhanced stats and unique attack patterns
// Validates: Requirements 7.1, 7.5

import { Enemy } from './Enemy.js';

export class Boss extends Enemy {
    constructor(scene, x, y, bossType, config = {}) {
        // Boss has enhanced stats compared to regular enemies
        const bossConfig = {
            health: config.health || 20, // Much higher health (20 hits to defeat)
            damage: config.damage || 10, // Higher damage
            speed: config.speed || 60, // Slightly faster
            attackCooldown: config.attackCooldown || 800, // Faster attacks
            aggroRange: config.aggroRange || 300, // Larger aggro range
            xpReward: config.xpReward || 100, // Much higher XP reward
        };

        super(scene, x, y, bossType, bossConfig);

        // Mark as boss
        this.isBoss = true;

        // Attack pattern configuration
        this.attackPattern = config.attackPattern || 'aggressive';
        this.attackPatternState = 0;
        this.attackPatternTimer = 0;
        this.attackPatternInterval = 2000; // Change pattern every 2 seconds

        // Enhanced hitbox for boss
        this.hitbox = {
            width: 40,
            height: 40,
            offsetX: 0,
            offsetY: 0,
        };
    }

    /**
     * Override createSprite to add special boss label and larger health bar
     */
    createSprite() {
        super.createSprite();

        // Update label to show it's a boss
        if (this.label) {
            this.label.setText(`BOSS: ${this.enemyType}`);
            this.label.setStyle({
                fontSize: '12px',
                fill: '#ff0000',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 },
            });
        }
    }

    /**
     * Override createHealthBar to make it larger for bosses
     */
    createHealthBar() {
        const barWidth = 60; // Wider for bosses
        const barHeight = 6; // Taller for bosses
        const barY = this.y - 40; // Higher up to accommodate larger label

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
     * Override updateHealthBar to use boss bar width
     */
    updateHealthBar() {
        if (!this.healthBarFg || !this.healthBarBg) return;

        const barWidth = 60; // Match boss bar width
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
     * Override update to position boss health bar correctly
     */
    update(delta) {
        super.update(delta);

        // Update health bar position for boss (higher up)
        if (this.healthBarBg && this.healthBarFg) {
            const barY = this.y - 40;
            this.healthBarBg.setPosition(this.x, barY);
            this.healthBarFg.setPosition(this.x, barY);
        }
    }

    /**
     * Boss AI with unique attack patterns
     * Implements different behavior than regular enemies
     * Validates: Requirements 7.5
     */
    ai() {
        if (this.isFriendly || !this.active) {
            return;
        }

        // Update attack pattern timer
        this.attackPatternTimer += 16.67; // Approximate frame time

        if (this.attackPatternTimer >= this.attackPatternInterval) {
            this.attackPatternTimer = 0;
            this.attackPatternState = (this.attackPatternState + 1) % 3;
        }

        // Execute attack pattern based on type
        switch (this.attackPattern) {
            case 'aggressive':
                this.aggressivePattern();
                break;
            case 'defensive':
                this.defensivePattern();
                break;
            case 'ranged':
                this.rangedPattern();
                break;
            case 'teleport':
                this.teleportPattern();
                break;
            default:
                this.aggressivePattern();
        }
    }

    /**
     * Aggressive attack pattern - constantly chases and attacks player
     */
    aggressivePattern() {
        if (!this.target) {
            this.aiState = 'idle';
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= this.attackRange) {
            // In attack range
            this.aiState = 'attack';
            this.attack();
        } else if (distance <= this.aggroRange) {
            // Chase player
            this.aiState = 'chase';
            this.chasePlayer();
        } else {
            this.aiState = 'idle';
        }
    }

    /**
     * Defensive attack pattern - circles player and attacks periodically
     */
    defensivePattern() {
        if (!this.target) {
            this.aiState = 'idle';
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (this.attackPatternState === 0) {
            // Circle around player
            this.aiState = 'chase';
            const angle = Math.atan2(dy, dx) + Math.PI / 2;
            const moveX = Math.cos(angle) * this.speed * 0.016;
            const moveY = Math.sin(angle) * this.speed * 0.016;

            this.x += moveX;
            this.y += moveY;

            if (this.sprite) {
                this.sprite.x = this.x;
                this.sprite.y = this.y;
            }
        } else if (distance <= this.attackRange) {
            // Attack when in range
            this.aiState = 'attack';
            this.attack();
        } else {
            // Move closer
            this.aiState = 'chase';
            this.chasePlayer();
        }
    }

    /**
     * Ranged attack pattern - maintains distance and attacks from afar
     */
    rangedPattern() {
        if (!this.target) {
            this.aiState = 'idle';
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const optimalDistance = 150;

        if (distance < optimalDistance) {
            // Move away from player
            this.aiState = 'chase';
            const moveX = (-dx / distance) * this.speed * 0.016;
            const moveY = (-dy / distance) * this.speed * 0.016;

            this.x += moveX;
            this.y += moveY;

            if (this.sprite) {
                this.sprite.x = this.x;
                this.sprite.y = this.y;
            }
        } else if (distance > optimalDistance + 50) {
            // Move closer to player
            this.aiState = 'chase';
            this.chasePlayer();
        } else {
            // At optimal distance, attack
            this.aiState = 'attack';
            this.attack();
        }
    }

    /**
     * Teleport attack pattern - teleports around player and attacks
     */
    teleportPattern() {
        if (!this.target) {
            this.aiState = 'idle';
            return;
        }

        if (this.attackPatternState === 0 && this.attackPatternTimer < 100) {
            // Teleport to random position near player
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 100;

            this.x = this.target.x + Math.cos(angle) * distance;
            this.y = this.target.y + Math.sin(angle) * distance;

            if (this.sprite) {
                this.sprite.x = this.x;
                this.sprite.y = this.y;

                // Teleport effect
                if (this.scene.tweens) {
                    this.sprite.setAlpha(0);
                    this.scene.tweens.add({
                        targets: this.sprite,
                        alpha: 1,
                        duration: 200,
                        ease: 'Power2',
                    });
                }
            }
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= this.attackRange) {
            this.aiState = 'attack';
            this.attack();
        } else {
            this.aiState = 'chase';
            this.chasePlayer();
        }
    }

    /**
     * Chase player
     */
    chasePlayer() {
        if (!this.target) {
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const moveX = (dx / distance) * this.speed * 0.016;
            const moveY = (dy / distance) * this.speed * 0.016;

            this.x += moveX;
            this.y += moveY;

            if (this.sprite) {
                this.sprite.x = this.x;
                this.sprite.y = this.y;
            }
        }
    }

    /**
     * Boss attack - more powerful than regular enemy
     */
    attack() {
        if (!this.canAttack || this.isFriendly) {
            return;
        }

        this.canAttack = false;

        // Boss attack logic would be implemented here
        // For now, just reset cooldown

        // Reset attack cooldown (faster than regular enemies)
        setTimeout(() => {
            this.canAttack = true;
        }, this.attackCooldown);
    }

    /**
     * Override defeat to handle boss-specific behavior
     */
    defeat() {
        console.log(`Boss ${this.enemyType} defeated!`);
        this.aiState = 'defeated';
        this.convertToFriendly();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Boss;
}
