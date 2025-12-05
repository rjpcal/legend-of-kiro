// CollisionSystem - Handles collision detection using AABB (Axis-Aligned Bounding Box)
// with spatial partitioning optimization

const SPATIAL_GRID_CELL_SIZE = 128; // Size of each grid cell in pixels

export class CollisionSystem {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = []; // Array of obstacle entities
        this.spatialGrid = new Map(); // Spatial partitioning grid
        this.cellSize = SPATIAL_GRID_CELL_SIZE;
    }

    /**
     * Get grid cell key for a position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {string} Grid cell key
     */
    _getCellKey(x, y) {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX},${cellY}`;
    }

    /**
     * Get all grid cells that an entity occupies
     * @param {object} hitbox - Entity hitbox {x, y, width, height}
     * @returns {string[]} Array of cell keys
     */
    _getOccupiedCells(hitbox) {
        const cells = [];
        const minCellX = Math.floor(hitbox.x / this.cellSize);
        const minCellY = Math.floor(hitbox.y / this.cellSize);
        const maxCellX = Math.floor((hitbox.x + hitbox.width) / this.cellSize);
        const maxCellY = Math.floor((hitbox.y + hitbox.height) / this.cellSize);

        for (let x = minCellX; x <= maxCellX; x++) {
            for (let y = minCellY; y <= maxCellY; y++) {
                cells.push(`${x},${y}`);
            }
        }

        return cells;
    }

    /**
     * Add an obstacle to the collision system
     * @param {object} obstacle - Obstacle entity with hitbox
     */
    addObstacle(obstacle) {
        this.obstacles.push(obstacle);

        // Add to spatial grid
        const hitbox = obstacle.getHitbox();
        const cells = this._getOccupiedCells(hitbox);

        for (const cellKey of cells) {
            if (!this.spatialGrid.has(cellKey)) {
                this.spatialGrid.set(cellKey, []);
            }
            this.spatialGrid.get(cellKey).push(obstacle);
        }
    }

    /**
     * Remove an obstacle from the collision system
     * @param {object} obstacle - Obstacle entity to remove
     */
    removeObstacle(obstacle) {
        const index = this.obstacles.indexOf(obstacle);
        if (index > -1) {
            this.obstacles.splice(index, 1);
        }

        // Remove from spatial grid
        const hitbox = obstacle.getHitbox();
        const cells = this._getOccupiedCells(hitbox);

        for (const cellKey of cells) {
            if (this.spatialGrid.has(cellKey)) {
                const cellObstacles = this.spatialGrid.get(cellKey);
                const obstacleIndex = cellObstacles.indexOf(obstacle);
                if (obstacleIndex > -1) {
                    cellObstacles.splice(obstacleIndex, 1);
                }
                // Clean up empty cells
                if (cellObstacles.length === 0) {
                    this.spatialGrid.delete(cellKey);
                }
            }
        }
    }

    /**
     * Clear all obstacles
     */
    clearObstacles() {
        this.obstacles = [];
        this.spatialGrid.clear();
    }

    /**
     * Check AABB collision between two hitboxes
     * @param {object} box1 - First hitbox {x, y, width, height}
     * @param {object} box2 - Second hitbox {x, y, width, height}
     * @returns {boolean} True if collision detected
     */
    checkAABB(box1, box2) {
        return (
            box1.x < box2.x + box2.width &&
            box1.x + box1.width > box2.x &&
            box1.y < box2.y + box2.height &&
            box1.y + box1.height > box2.y
        );
    }

    /**
     * Check collision between two entities
     * @param {Entity} entity1 - First entity
     * @param {Entity} entity2 - Second entity
     * @returns {boolean} True if collision detected
     */
    checkCollision(entity1, entity2) {
        const hitbox1 = entity1.getHitbox();
        const hitbox2 = entity2.getHitbox();
        return this.checkAABB(hitbox1, hitbox2);
    }

    /**
     * Get nearby obstacles using spatial partitioning
     * @param {object} hitbox - Hitbox to check {x, y, width, height}
     * @returns {Set} Set of nearby obstacles
     */
    _getNearbyObstacles(hitbox) {
        const cells = this._getOccupiedCells(hitbox);
        const nearbyObstacles = new Set();

        for (const cellKey of cells) {
            if (this.spatialGrid.has(cellKey)) {
                const cellObstacles = this.spatialGrid.get(cellKey);
                for (const obstacle of cellObstacles) {
                    nearbyObstacles.add(obstacle);
                }
            }
        }

        return nearbyObstacles;
    }

    /**
     * Check if an entity at a given position would collide with obstacles
     * @param {Entity} entity - Entity to check
     * @param {number} x - X position to check
     * @param {number} y - Y position to check
     * @returns {boolean} True if collision would occur
     */
    wouldCollideAt(entity, x, y) {
        // Create a temporary hitbox at the intended position
        const tempHitbox = {
            x: x + entity.hitbox.offsetX - entity.hitbox.width / 2,
            y: y + entity.hitbox.offsetY - entity.hitbox.height / 2,
            width: entity.hitbox.width,
            height: entity.hitbox.height,
        };

        // Use spatial partitioning to only check nearby obstacles
        const nearbyObstacles = this._getNearbyObstacles(tempHitbox);

        for (const obstacle of nearbyObstacles) {
            const obstacleHitbox = obstacle.getHitbox();
            if (this.checkAABB(tempHitbox, obstacleHitbox)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if entity's intended movement would cause collision
     * @param {Entity} entity - Entity with intended position
     * @returns {boolean} True if collision would occur
     */
    checkIntendedCollision(entity) {
        const intended = entity.getIntendedPosition();
        return this.wouldCollideAt(entity, intended.x, intended.y);
    }

    /**
     * Get collision candidates for an entity (optimized with spatial partitioning)
     * @param {Entity} entity - Entity to check collisions for
     * @param {Array} entities - Array of all entities to check against
     * @returns {Array} Array of entities that might collide
     */
    getCollisionCandidates(entity, entities) {
        const hitbox = entity.getHitbox();
        const nearbyObstacles = this._getNearbyObstacles(hitbox);

        // Filter entities to only those in nearby cells
        return entities.filter(other => {
            if (other === entity) return false;
            return nearbyObstacles.has(other) || !this.obstacles.includes(other);
        });
    }

    /**
     * Update collision system (called each frame)
     */
    update() {
        // Spatial partitioning is maintained through add/remove operations
        // No per-frame updates needed for static obstacles
    }
}
