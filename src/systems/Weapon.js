// Weapon - Weapon class for combat system
// Handles weapon properties, melee attacks, and ranged projectiles

import { Entity } from '../entities/Entity.js';

export class Weapon {
    constructor(config = {}) {
        // Weapon properties
        this.name = config.name || 'Basic Weapon';
        this.damage = config.damage || 1;
        this.range = config.range || 40; // Melee attack range in pixels
        this.attackSpeed = config.attackSpeed || 500; // Cooldown in milliseconds
        this.canThrow = config.canThrow !== false; // Can be thrown as ranged attack

        // Projectile properties (for ranged attacks)
        this.projectileSpeed = config.projectileSpeed || 200; // pixels per second
        this.projectileRange = config.projectileRange || 300; // max distance before returning
    }

    /**
     * Create a melee attack hitbox in the specified direction
     * @param {number} x - Origin x position (player position)
     * @param {number} y - Origin y position (player position)
     * @param {string} direction - Direction of attack ('up', 'down', 'left', 'right')
     * @returns {object} Attack hitbox with x, y, width, height
     */
    createMeleeHitbox(x, y, direction) {
        const hitboxWidth = 32;
        const hitboxHeight = 32;

        let hitboxX = x;
        let hitboxY = y;

        // Position hitbox based on direction
        switch (direction) {
            case 'up':
                hitboxY = y - this.range;
                break;
            case 'down':
                hitboxY = y + this.range;
                break;
            case 'left':
                hitboxX = x - this.range;
                break;
            case 'right':
                hitboxX = x + this.range;
                break;
        }

        return {
            x: hitboxX - hitboxWidth / 2,
            y: hitboxY - hitboxHeight / 2,
            width: hitboxWidth,
            height: hitboxHeight,
            damage: this.damage,
            direction: direction,
        };
    }

    /**
     * Create a ranged attack projectile
     * @param {Phaser.Scene} scene - The scene to create the projectile in
     * @param {number} x - Origin x position (player position)
     * @param {number} y - Origin y position (player position)
     * @param {string} direction - Direction to throw ('up', 'down', 'left', 'right')
     * @param {Player} owner - The player who threw the weapon
     * @returns {Projectile} Projectile entity
     */
    createProjectile(scene, x, y, direction, owner) {
        return new Projectile(scene, x, y, direction, this, owner);
    }

    /**
     * Perform a melee attack
     * @param {number} x - Origin x position
     * @param {number} y - Origin y position
     * @param {string} direction - Direction of attack
     * @returns {object} Attack hitbox
     */
    attack(x, y, direction) {
        return this.createMeleeHitbox(x, y, direction);
    }

    /**
     * Throw the weapon as a projectile
     * @param {Phaser.Scene} scene - The scene
     * @param {number} x - Origin x position
     * @param {number} y - Origin y position
     * @param {string} direction - Direction to throw
     * @param {Player} owner - The player who threw the weapon
     * @returns {Projectile} Projectile entity
     */
    throw(scene, x, y, direction, owner) {
        if (!this.canThrow) {
            return null;
        }
        return this.createProjectile(scene, x, y, direction, owner);
    }
}

/**
 * Projectile - Represents a thrown weapon
 */
export class Projectile extends Entity {
    constructor(scene, x, y, direction, weapon, owner) {
        super(scene, x, y, 'projectile');

        this.direction = direction;
        this.weapon = weapon;
        this.owner = owner; // Reference to player who threw it
        this.speed = weapon.projectileSpeed;
        this.maxDistance = weapon.projectileRange;
        this.distanceTraveled = 0;
        this.startX = x;
        this.startY = y;
        this.returning = false;

        // Smaller hitbox for projectile
        this.hitbox = {
            width: 16,
            height: 16,
            offsetX: 0,
            offsetY: 0,
        };

        // Damage from weapon
        this.damage = weapon.damage;
    }

    /**
     * Create the projectile sprite
     */
    createSprite() {
        // Use a simple circle for projectile (can be replaced with actual sprite)
        if (this.scene && this.scene.add) {
            this.sprite = this.scene.add.circle(this.x, this.y, 8, 0x790ecb);
            this.sprite.setDepth(15);
        }
    }

    /**
     * Update projectile movement
     * @param {number} delta - Time elapsed since last frame
     */
    update(delta) {
        if (!this.active) {
            return;
        }

        const distance = (this.speed * delta) / 1000;

        if (this.returning) {
            // Move back towards owner
            this.moveTowardsOwner(distance);
        } else {
            // Move in throw direction
            this.moveInDirection(distance);
            this.distanceTraveled += distance;

            // Start returning if max distance reached
            if (this.distanceTraveled >= this.maxDistance) {
                this.startReturning();
            }
        }

        // Update sprite position
        super.update(delta);
    }

    /**
     * Move projectile in its direction
     * @param {number} distance - Distance to move
     */
    moveInDirection(distance) {
        switch (this.direction) {
            case 'up':
                this.y -= distance;
                break;
            case 'down':
                this.y += distance;
                break;
            case 'left':
                this.x -= distance;
                break;
            case 'right':
                this.x += distance;
                break;
        }
    }

    /**
     * Move projectile towards owner
     * @param {number} distance - Distance to move
     */
    moveTowardsOwner(distance) {
        if (!this.owner) {
            this.destroy();
            return;
        }

        const dx = this.owner.x - this.x;
        const dy = this.owner.y - this.y;
        const distToOwner = Math.sqrt(dx * dx + dy * dy);

        // If close enough to owner, return weapon and destroy projectile
        if (distToOwner < 20) {
            this.returnToOwner();
            return;
        }

        // Move towards owner
        const angle = Math.atan2(dy, dx);
        this.x += Math.cos(angle) * distance;
        this.y += Math.sin(angle) * distance;
    }

    /**
     * Start returning to owner
     */
    startReturning() {
        this.returning = true;
    }

    /**
     * Return weapon to owner and destroy projectile
     */
    returnToOwner() {
        // Weapon is returned to owner's inventory (already equipped)
        this.destroy();
    }

    /**
     * Handle collision with enemy
     */
    onHitEnemy() {
        // Start returning after hitting enemy
        this.startReturning();
    }
}
