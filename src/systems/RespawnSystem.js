// RespawnSystem - Handles player death detection and respawning
// Preserves collectibles and coins on respawn

export class RespawnSystem {
    constructor(scene) {
        this.scene = scene;

        // Starting position for respawn
        this.spawnPoint = { x: 400, y: 300 };

        // Track if player is currently dead
        this.isDead = false;

        // Respawn delay in milliseconds
        this.respawnDelay = 2000;
    }

    /**
     * Set the spawn point for respawning
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    setSpawnPoint(x, y) {
        this.spawnPoint = { x, y };
    }

    /**
     * Check if player should die
     * @param {Player} player - Player entity
     * @returns {boolean} True if player died this frame
     */
    checkDeath(player) {
        if (!player || this.isDead) {
            return false;
        }

        // Check if health reached zero
        if (player.health.current <= 0) {
            this.handleDeath(player);
            return true;
        }

        return false;
    }

    /**
     * Handle player death
     * @param {Player} player - Player entity
     */
    handleDeath(player) {
        this.isDead = true;

        // Play death animation if available
        if (this.scene.animationManager) {
            this.scene.animationManager.setState(player, 'defeat');
        }

        // Fade out player sprite
        if (player.sprite && this.scene.tweens) {
            this.scene.tweens.add({
                targets: player.sprite,
                alpha: 0,
                duration: 1000,
                ease: 'Power2',
            });
        }

        // Schedule respawn
        setTimeout(() => {
            this.respawn(player);
        }, this.respawnDelay);
    }

    /**
     * Respawn the player
     * @param {Player} player - Player entity
     */
    respawn(player) {
        // Reset position to spawn point
        player.setPosition(this.spawnPoint.x, this.spawnPoint.y);

        // Restore health to maximum
        player.health.current = player.health.max;

        // Restore sprite visibility
        if (player.sprite) {
            player.sprite.setAlpha(1);
        }

        // Reset animation state
        if (this.scene.animationManager) {
            this.scene.animationManager.setState(player, 'idle');
        }

        // Preserve collectibles and coins (they are already in player.inventory)
        // No need to reset inventory - this is the key requirement

        // Reset dead flag
        this.isDead = false;

        // Optional: brief invincibility period could be added here
    }

    /**
     * Update respawn system (called each frame)
     * @param {Player} player - Player entity
     */
    update(player) {
        if (!this.isDead) {
            this.checkDeath(player);
        }
    }

    /**
     * Check if player is currently dead
     * @returns {boolean} True if dead
     */
    isPlayerDead() {
        return this.isDead;
    }

    /**
     * Force respawn (for testing or special cases)
     * @param {Player} player - Player entity
     */
    forceRespawn(player) {
        if (this.isDead) {
            this.respawn(player);
        }
    }
}
