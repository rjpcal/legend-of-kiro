// CollisionSystem - Handles collision detection using AABB (Axis-Aligned Bounding Box)

export class CollisionSystem {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = []; // Array of obstacle entities
    }

    /**
     * Add an obstacle to the collision system
     * @param {object} obstacle - Obstacle entity with hitbox
     */
    addObstacle(obstacle) {
        this.obstacles.push(obstacle);
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
    }

    /**
     * Clear all obstacles
     */
    clearObstacles() {
        this.obstacles = [];
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

        // Check against all obstacles
        for (const obstacle of this.obstacles) {
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
     * Update collision system (called each frame)
     */
    update() {
        // Future: spatial partitioning optimization will be added here
    }
}
