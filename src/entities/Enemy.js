// Enemy - Base enemy class
// Extends Entity with enemy-specific properties including health and attack

class Enemy extends Entity {
    constructor(scene, x, y, enemyType, config = {}) {
        super(scene, x, y, enemyType);
        
        // Enemy type (zombie, skeleton, ghoul, spirit)
        this.enemyType = enemyType;
        
        // Health system
        this.health = {
            current: config.health || 3,
            max: config.health || 3
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
            offsetY: 0
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
        
        // Play defeat animation (will be implemented in animation task)
        
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
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Enemy;
}
