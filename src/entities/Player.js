// Player - Kiro character class
// Extends Entity with player-specific properties including health, inventory, and stats

class Player extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, 'kiro');
        
        // Health system
        this.health = {
            current: 6,
            max: 6
        };
        
        // Inventory system
        this.inventory = {
            coins: 0,
            items: [],
            equippedWeapon: null,
            equippedArmor: null
        };
        
        // Stats
        this.stats = {
            damage: 1,        // Base damage
            defense: 0,       // Damage reduction
            speed: 100,       // Movement speed in pixels per second
            xp: 0,           // Experience points
            level: 1         // Current level
        };
        
        // Movement state
        this.facing = 'down'; // Direction player is facing: up, down, left, right
        this.isMoving = false;
        
        // Combat state
        this.isAttacking = false;
        this.canAttack = true;
        this.attackCooldown = 500; // milliseconds
        
        // Set player-specific hitbox
        this.hitbox = {
            width: 24,
            height: 24,
            offsetX: 0,
            offsetY: 0
        };
    }

    /**
     * Initialize the player sprite
     */
    createSprite() {
        super.createSprite();
        if (this.sprite) {
            // Set depth for rendering order
            this.sprite.setDepth(10);
        }
    }

    /**
     * Move the player in a direction
     * @param {string} direction - 'up', 'down', 'left', or 'right'
     */
    move(direction) {
        this.facing = direction;
        this.isMoving = true;
        // Actual movement logic will be implemented in movement system task
    }

    /**
     * Perform a melee attack
     */
    attack() {
        if (!this.canAttack || this.isAttacking) {
            return;
        }
        
        this.isAttacking = true;
        this.canAttack = false;
        
        // Attack logic will be implemented in combat system task
        
        // Reset attack state after cooldown
        setTimeout(() => {
            this.isAttacking = false;
            this.canAttack = true;
        }, this.attackCooldown);
    }

    /**
     * Perform a ranged attack (throw weapon)
     * Only available when health is at maximum
     */
    rangedAttack() {
        if (this.health.current < this.health.max) {
            return; // Can only throw at max health
        }
        
        if (!this.canAttack || this.isAttacking) {
            return;
        }
        
        // Ranged attack logic will be implemented in combat system task
    }

    /**
     * Apply damage to the player
     * @param {number} amount - Damage amount
     */
    takeDamage(amount) {
        // Apply defense reduction
        const actualDamage = Math.max(1, amount - this.stats.defense);
        
        this.health.current = Math.max(0, this.health.current - actualDamage);
        
        // Death logic will be handled in health system task
        if (this.health.current === 0) {
            // Player death
        }
    }

    /**
     * Collect an item
     * @param {object} item - Item to collect
     */
    collectItem(item) {
        if (item.type === 'coin') {
            this.inventory.coins += item.value || 1;
        } else if (item.type === 'health') {
            this.heal(item.value || 1);
        } else {
            this.inventory.items.push(item);
        }
    }

    /**
     * Heal the player
     * @param {number} amount - Healing amount
     */
    heal(amount) {
        this.health.current = Math.min(this.health.max, this.health.current + amount);
    }

    /**
     * Level up the player
     */
    levelUp() {
        this.stats.level++;
        // Increase max health on level up
        this.health.max += 2;
        this.health.current = this.health.max; // Fully heal on level up
    }

    /**
     * Equip a weapon
     * @param {object} weapon - Weapon to equip
     */
    equipWeapon(weapon) {
        this.inventory.equippedWeapon = weapon;
        this.stats.damage = weapon.damage || 1;
    }

    /**
     * Equip armor
     * @param {object} armor - Armor to equip
     */
    equipArmor(armor) {
        this.inventory.equippedArmor = armor;
        this.stats.defense = armor.defense || 0;
    }

    /**
     * Get current health
     */
    getHealth() {
        return this.health.current;
    }

    /**
     * Set health (for testing)
     */
    setHealth(value) {
        this.health.current = Math.max(0, Math.min(this.health.max, value));
    }

    /**
     * Update player state
     * @param {number} delta - Time elapsed since last frame
     */
    update(delta) {
        super.update(delta);
        
        // Additional player-specific update logic will be added in future tasks
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Player;
}
