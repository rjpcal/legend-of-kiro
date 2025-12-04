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
            
            // Apply ripple effect to Kiro sprite
            if (this.scene.rippleEffect) {
                this.scene.rippleEffect.applyRipple(this.sprite, {
                    amplitude: 0.02,
                    frequency: 3,
                    speed: 1.5
                });
            }
            
            // Initialize animation state
            if (this.scene.animationManager) {
                this.scene.animationManager.initializeEntity(this, 'idle');
            }
        }
    }

    /**
     * Move the player in a direction
     * @param {string} direction - 'up', 'down', 'left', or 'right'
     * @param {number} delta - Time elapsed since last frame in milliseconds
     */
    move(direction, delta) {
        this.facing = direction;
        this.isMoving = true;
        
        // Calculate movement distance based on speed and delta time
        // Convert delta from milliseconds to seconds, then multiply by speed (pixels per second)
        const distance = (this.stats.speed * delta) / 1000;
        
        // Store intended new position
        this.intendedX = this.x;
        this.intendedY = this.y;
        
        // Calculate new position based on direction
        switch(direction) {
            case 'up':
                this.intendedY -= distance;
                break;
            case 'down':
                this.intendedY += distance;
                break;
            case 'left':
                this.intendedX -= distance;
                break;
            case 'right':
                this.intendedX += distance;
                break;
        }
    }
    
    /**
     * Apply the intended movement (called after collision check)
     */
    applyMovement() {
        if (this.intendedX !== undefined) {
            this.x = this.intendedX;
        }
        if (this.intendedY !== undefined) {
            this.y = this.intendedY;
        }
        this.intendedX = undefined;
        this.intendedY = undefined;
    }
    
    /**
     * Cancel the intended movement (called when collision detected)
     */
    cancelMovement() {
        this.intendedX = undefined;
        this.intendedY = undefined;
        this.isMoving = false;
    }
    
    /**
     * Get the intended position after movement
     */
    getIntendedPosition() {
        return {
            x: this.intendedX !== undefined ? this.intendedX : this.x,
            y: this.intendedY !== undefined ? this.intendedY : this.y
        };
    }

    /**
     * Perform a melee attack
     * @returns {object|null} Attack hitbox if attack was performed, null otherwise
     */
    attack() {
        if (!this.canAttack || this.isAttacking) {
            return null;
        }
        
        this.isAttacking = true;
        this.canAttack = false;
        
        // Get equipped weapon or use default
        const weapon = this.inventory.equippedWeapon || this.getDefaultWeapon();
        
        // Create attack hitbox in facing direction
        const attackHitbox = weapon.attack(this.x, this.y, this.facing);
        
        // Trigger attack animation
        if (this.scene.animationManager) {
            this.scene.animationManager.setState(this, 'attack');
        }
        
        // Reset attack state after cooldown
        setTimeout(() => {
            this.isAttacking = false;
            this.canAttack = true;
        }, this.attackCooldown);
        
        return attackHitbox;
    }
    
    /**
     * Get default weapon if none equipped
     * @returns {Weapon} Default weapon
     */
    getDefaultWeapon() {
        // Create default weapon if not cached
        if (!this._defaultWeapon) {
            // Weapon class will be loaded via script tag in HTML
            this._defaultWeapon = new Weapon({
                name: 'Fists',
                damage: 1,
                range: 35,
                attackSpeed: 500,
                canThrow: false
            });
        }
        return this._defaultWeapon;
    }

    /**
     * Perform a ranged attack (throw weapon)
     * Only available when health is at maximum
     * @returns {Projectile|null} Projectile if thrown, null otherwise
     */
    rangedAttack() {
        // Check health requirement
        if (this.health.current < this.health.max) {
            return null; // Can only throw at max health
        }
        
        if (!this.canAttack || this.isAttacking) {
            return null;
        }
        
        // Get equipped weapon or use default
        const weapon = this.inventory.equippedWeapon || this.getDefaultWeapon();
        
        // Check if weapon can be thrown
        if (!weapon.canThrow) {
            return null;
        }
        
        this.isAttacking = true;
        this.canAttack = false;
        
        // Create projectile
        const projectile = weapon.throw(this.scene, this.x, this.y, this.facing, this);
        
        if (projectile) {
            projectile.createSprite();
        }
        
        // Reset attack state after cooldown
        setTimeout(() => {
            this.isAttacking = false;
            this.canAttack = true;
        }, this.attackCooldown);
        
        return projectile;
    }

    /**
     * Apply damage to the player
     * @param {number} amount - Damage amount
     */
    takeDamage(amount) {
        // Apply defense reduction
        const actualDamage = Math.max(1, amount - this.stats.defense);
        
        this.health.current = Math.max(0, this.health.current - actualDamage);
        
        // Death is handled by RespawnSystem
        // No need to handle death here - system will detect health === 0
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
     * Calculate XP threshold for a given level
     * @param {number} level - Level to calculate threshold for
     * @returns {number} XP required for next level
     */
    calculateLevelThreshold(level) {
        // Simple formula: level * 10
        return level * 10;
    }

    /**
     * Check if player should level up and handle it
     */
    checkLevelUp() {
        const threshold = this.calculateLevelThreshold(this.stats.level);
        if (this.stats.xp >= threshold) {
            this.levelUp();
            return true;
        }
        return false;
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
     * Handle keyboard input for movement
     * @param {object} cursors - Phaser cursor keys object
     * @param {object} wasd - WASD keys object
     * @param {number} delta - Time elapsed since last frame
     */
    handleInput(cursors, wasd, delta) {
        this.isMoving = false;
        
        // Check for movement input (arrow keys or WASD)
        if (cursors.up.isDown || wasd.W.isDown) {
            this.move('up', delta);
        } else if (cursors.down.isDown || wasd.S.isDown) {
            this.move('down', delta);
        } else if (cursors.left.isDown || wasd.A.isDown) {
            this.move('left', delta);
        } else if (cursors.right.isDown || wasd.D.isDown) {
            this.move('right', delta);
        }
    }
    
    /**
     * Update player state
     * @param {number} delta - Time elapsed since last frame
     */
    update(delta) {
        super.update(delta);
        
        // Update animation state based on current state
        this.updateAnimationState();
    }
    
    /**
     * Update animation state based on player state
     */
    updateAnimationState() {
        if (!this.scene.animationManager) {
            return;
        }
        
        // Determine animation state based on player state
        let animState = 'idle';
        
        if (this.isAttacking) {
            animState = 'attack';
        } else if (this.isMoving) {
            animState = 'move';
        }
        
        // Update animation state
        this.scene.animationManager.setState(this, animState);
        
        // Update sprite facing direction (flip sprite for left/right)
        if (this.sprite) {
            if (this.facing === 'left') {
                this.sprite.setFlipX(true);
            } else if (this.facing === 'right') {
                this.sprite.setFlipX(false);
            }
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Player;
}
