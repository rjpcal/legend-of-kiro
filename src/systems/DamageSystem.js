// DamageSystem - Handles damage application and enemy collision with player
// Manages damage events, health meter pulse triggers, and damage cooldowns

export class DamageSystem {
    constructor(scene, collisionSystem, healthSystem) {
        this.scene = scene;
        this.collisionSystem = collisionSystem;
        this.healthSystem = healthSystem;

        // Track entities that can deal damage
        this.enemies = [];

        // Damage cooldown tracking (prevent rapid repeated damage)
        this.damageCooldowns = new Map();
        this.defaultCooldown = 1000; // 1 second between damage applications

        // Health meter pulse callback
        this.onHealthMeterPulse = null;
    }

    /**
     * Register an enemy that can deal damage
     * @param {Enemy} enemy - Enemy entity
     */
    registerEnemy(enemy) {
        if (!this.enemies.includes(enemy)) {
            this.enemies.push(enemy);
        }
    }

    /**
     * Unregister an enemy
     * @param {Enemy} enemy - Enemy entity
     */
    unregisterEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
        this.damageCooldowns.delete(enemy);
    }

    /**
     * Set callback for health meter pulse
     * @param {Function} callback - Function to call when health meter should pulse
     */
    setHealthMeterPulseCallback(callback) {
        this.onHealthMeterPulse = callback;
    }

    /**
     * Check if an enemy can deal damage (not on cooldown)
     * @param {Enemy} enemy - Enemy to check
     * @returns {boolean} True if can deal damage
     */
    canDealDamage(enemy) {
        const cooldown = this.damageCooldowns.get(enemy);
        if (!cooldown) {
            return true;
        }
        return Date.now() >= cooldown;
    }

    /**
     * Set damage cooldown for an enemy
     * @param {Enemy} enemy - Enemy to set cooldown for
     * @param {number} duration - Cooldown duration in milliseconds
     */
    setDamageCooldown(enemy, duration = this.defaultCooldown) {
        this.damageCooldowns.set(enemy, Date.now() + duration);
    }

    /**
     * Apply damage to player from an enemy
     * @param {Player} player - Player entity
     * @param {Enemy} enemy - Enemy dealing damage
     * @returns {boolean} True if damage was applied
     */
    applyDamageToPlayer(player, enemy) {
        // Check if enemy can deal damage
        if (!this.canDealDamage(enemy)) {
            return false;
        }

        // Check collision
        if (!this.collisionSystem.checkCollision(player, enemy)) {
            return false;
        }

        // Calculate damage (considering player's defense)
        const baseDamage = enemy.attackDamage || 1;
        const defense = player.stats ? player.stats.defense : 0;
        const actualDamage = Math.max(1, baseDamage - defense);

        // Apply damage
        const oldHealth = player.health.current;
        player.health.current = Math.max(0, player.health.current - actualDamage);

        // Set cooldown to prevent rapid damage
        this.setDamageCooldown(enemy);

        // Trigger health meter pulse
        if (this.onHealthMeterPulse) {
            this.onHealthMeterPulse();
        }

        // Play damage sound effect using AudioManager
        const audioManager = this.scene.registry.get('audioManager');
        if (audioManager) {
            audioManager.playKiroDamage();
        }

        return true;
    }

    /**
     * Check and apply damage from all enemies to player
     * @param {Player} player - Player entity
     */
    checkEnemyCollisions(player) {
        if (!player || !player.active) {
            return;
        }

        // Check collision with each enemy
        for (const enemy of this.enemies) {
            if (!enemy.active || enemy.isFriendly) {
                continue;
            }

            this.applyDamageToPlayer(player, enemy);
        }
    }

    /**
     * Update damage system (called each frame)
     * @param {Player} player - Player entity
     */
    update(player) {
        this.checkEnemyCollisions(player);
    }

    /**
     * Clear all enemies and cooldowns
     */
    clear() {
        this.enemies = [];
        this.damageCooldowns.clear();
    }
}
