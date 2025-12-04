// CollectionSystem - Manages collectible detection and collection
// Handles collision detection between player and collectibles

class CollectionSystem {
    constructor(scene, collisionSystem) {
        this.scene = scene;
        this.collisionSystem = collisionSystem;
        
        // Track all collectibles in the scene
        this.collectibles = [];
    }

    /**
     * Add a collectible to the system
     * @param {Collectible} collectible - Collectible to add
     */
    addCollectible(collectible) {
        if (!this.collectibles.includes(collectible)) {
            this.collectibles.push(collectible);
        }
    }

    /**
     * Remove a collectible from the system
     * @param {Collectible} collectible - Collectible to remove
     */
    removeCollectible(collectible) {
        const index = this.collectibles.indexOf(collectible);
        if (index > -1) {
            this.collectibles.splice(index, 1);
        }
    }

    /**
     * Check for collisions between player and collectibles
     * @param {Player} player - Player entity
     */
    checkCollections(player) {
        if (!player || !player.active) {
            return;
        }

        const playerHitbox = player.getHitbox();

        // Check each collectible
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            
            if (!collectible.active) {
                continue;
            }

            const collectibleHitbox = collectible.getHitbox();

            // Check collision using AABB
            if (this.collisionSystem.checkAABB(playerHitbox, collectibleHitbox)) {
                // Collect the item
                collectible.collect(player);
                
                // Remove from tracking
                this.removeCollectible(collectible);
            }
        }
    }

    /**
     * Update collection system (called each frame)
     * @param {Player} player - Player entity
     */
    update(player) {
        this.checkCollections(player);
    }

    /**
     * Clear all collectibles
     */
    clear() {
        // Destroy all collectibles
        for (let collectible of this.collectibles) {
            collectible.destroy();
        }
        this.collectibles = [];
    }

    /**
     * Get all active collectibles
     * @returns {Array} Array of active collectibles
     */
    getCollectibles() {
        return this.collectibles.filter(c => c.active);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CollectionSystem;
}
