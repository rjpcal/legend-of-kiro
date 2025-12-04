// HealthSystem - Manages health tracking and modifications for entities
// Provides centralized health management with max health tracking and modification methods

class HealthSystem {
    constructor() {
        // Track entities with health
        this.entities = new Map();
    }

    /**
     * Register an entity with the health system
     * @param {Entity} entity - Entity to register
     * @param {number} currentHealth - Initial current health
     * @param {number} maxHealth - Initial max health
     */
    registerEntity(entity, currentHealth, maxHealth) {
        this.entities.set(entity, {
            current: currentHealth,
            max: maxHealth
        });
    }

    /**
     * Unregister an entity from the health system
     * @param {Entity} entity - Entity to unregister
     */
    unregisterEntity(entity) {
        this.entities.delete(entity);
    }

    /**
     * Get current health of an entity
     * @param {Entity} entity - Entity to query
     * @returns {number} Current health
     */
    getCurrentHealth(entity) {
        const health = this.entities.get(entity);
        return health ? health.current : 0;
    }

    /**
     * Get max health of an entity
     * @param {Entity} entity - Entity to query
     * @returns {number} Max health
     */
    getMaxHealth(entity) {
        const health = this.entities.get(entity);
        return health ? health.max : 0;
    }

    /**
     * Set current health of an entity
     * @param {Entity} entity - Entity to modify
     * @param {number} value - New health value
     */
    setCurrentHealth(entity, value) {
        const health = this.entities.get(entity);
        if (health) {
            health.current = Math.max(0, Math.min(health.max, value));
        }
    }

    /**
     * Set max health of an entity
     * @param {Entity} entity - Entity to modify
     * @param {number} value - New max health value
     */
    setMaxHealth(entity, value) {
        const health = this.entities.get(entity);
        if (health) {
            health.max = Math.max(1, value);
            // Ensure current health doesn't exceed new max
            health.current = Math.min(health.current, health.max);
        }
    }

    /**
     * Increase max health of an entity
     * @param {Entity} entity - Entity to modify
     * @param {number} amount - Amount to increase
     */
    increaseMaxHealth(entity, amount) {
        const health = this.entities.get(entity);
        if (health) {
            health.max += amount;
        }
    }

    /**
     * Heal an entity
     * @param {Entity} entity - Entity to heal
     * @param {number} amount - Healing amount
     * @returns {number} Actual amount healed
     */
    heal(entity, amount) {
        const health = this.entities.get(entity);
        if (!health) {
            return 0;
        }

        const oldHealth = health.current;
        health.current = Math.min(health.max, health.current + amount);
        return health.current - oldHealth;
    }

    /**
     * Apply damage to an entity
     * @param {Entity} entity - Entity to damage
     * @param {number} amount - Damage amount
     * @returns {number} Actual damage dealt
     */
    damage(entity, amount) {
        const health = this.entities.get(entity);
        if (!health) {
            return 0;
        }

        const oldHealth = health.current;
        health.current = Math.max(0, health.current - amount);
        return oldHealth - health.current;
    }

    /**
     * Check if an entity is alive
     * @param {Entity} entity - Entity to check
     * @returns {boolean} True if alive (health > 0)
     */
    isAlive(entity) {
        const health = this.entities.get(entity);
        return health ? health.current > 0 : false;
    }

    /**
     * Check if an entity is at max health
     * @param {Entity} entity - Entity to check
     * @returns {boolean} True if at max health
     */
    isAtMaxHealth(entity) {
        const health = this.entities.get(entity);
        return health ? health.current >= health.max : false;
    }

    /**
     * Get health as a percentage
     * @param {Entity} entity - Entity to query
     * @returns {number} Health percentage (0-1)
     */
    getHealthPercentage(entity) {
        const health = this.entities.get(entity);
        if (!health || health.max === 0) {
            return 0;
        }
        return health.current / health.max;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HealthSystem;
}
