// AnimationManager - Manages sprite animations and animation states
// Handles loading sprite sheets, defining animation frames, and state machine logic

class AnimationManager {
    constructor(scene) {
        this.scene = scene;
        this.animations = new Map(); // Store animation definitions
        this.entityStates = new Map(); // Track animation state per entity
    }

    /**
     * Define an animation for an entity type
     * @param {string} entityType - Type of entity (e.g., 'kiro', 'zombie')
     * @param {string} animName - Animation name (e.g., 'idle', 'move', 'attack')
     * @param {object} config - Animation configuration
     */
    defineAnimation(entityType, animName, config) {
        const key = `${entityType}_${animName}`;
        
        // Store animation definition
        this.animations.set(key, {
            entityType,
            animName,
            frames: config.frames || [],
            frameRate: config.frameRate || 10,
            repeat: config.repeat !== undefined ? config.repeat : -1, // -1 = loop forever
            spriteKey: config.spriteKey || entityType
        });
        
        // Create Phaser animation if frames are provided
        if (config.frames && config.frames.length > 0 && this.scene.anims) {
            // Check if animation already exists
            if (!this.scene.anims.exists(key)) {
                this.scene.anims.create({
                    key: key,
                    frames: config.frames,
                    frameRate: config.frameRate || 10,
                    repeat: config.repeat !== undefined ? config.repeat : -1
                });
            }
        }
    }

    /**
     * Initialize animation state for an entity
     * @param {Entity} entity - Entity to track
     * @param {string} initialState - Initial animation state
     */
    initializeEntity(entity, initialState = 'idle') {
        const entityId = this.getEntityId(entity);
        
        this.entityStates.set(entityId, {
            currentState: initialState,
            previousState: null,
            entity: entity,
            isTransitioning: false
        });
    }

    /**
     * Update animation state for an entity
     * @param {Entity} entity - Entity to update
     * @param {string} newState - New animation state
     * @param {boolean} force - Force state change even if already in that state
     */
    setState(entity, newState, force = false) {
        const entityId = this.getEntityId(entity);
        const state = this.entityStates.get(entityId);
        
        if (!state) {
            console.warn('Entity not initialized in AnimationManager');
            return;
        }
        
        // Don't change if already in this state (unless forced)
        if (!force && state.currentState === newState) {
            return;
        }
        
        // Update state
        state.previousState = state.currentState;
        state.currentState = newState;
        
        // Play the animation
        this.playAnimation(entity, newState);
    }

    /**
     * Play an animation on an entity
     * @param {Entity} entity - Entity to animate
     * @param {string} animName - Animation name
     */
    playAnimation(entity, animName) {
        if (!entity.sprite) {
            return;
        }
        
        const entityType = this.getEntityType(entity);
        const key = `${entityType}_${animName}`;
        
        // Check if this animation exists in Phaser
        if (this.scene.anims && this.scene.anims.exists(key)) {
            entity.sprite.play(key, true);
        }
    }

    /**
     * Get current animation state for an entity
     * @param {Entity} entity - Entity to check
     * @returns {string} Current animation state
     */
    getState(entity) {
        const entityId = this.getEntityId(entity);
        const state = this.entityStates.get(entityId);
        return state ? state.currentState : null;
    }

    /**
     * Get entity type from entity object
     * @param {Entity} entity - Entity object
     * @returns {string} Entity type
     */
    getEntityType(entity) {
        // Check for player
        if (entity.constructor.name === 'Player') {
            return 'kiro';
        }
        
        // Check for enemy type
        if (entity.enemyType) {
            return entity.enemyType;
        }
        
        // Fallback to sprite key
        return entity.spriteKey || 'unknown';
    }

    /**
     * Get unique ID for entity
     * @param {Entity} entity - Entity object
     * @returns {string} Unique entity ID
     */
    getEntityId(entity) {
        // Use object reference as ID
        if (!entity._animId) {
            entity._animId = `entity_${Math.random().toString(36).substr(2, 9)}`;
        }
        return entity._animId;
    }

    /**
     * Remove entity from tracking
     * @param {Entity} entity - Entity to remove
     */
    removeEntity(entity) {
        const entityId = this.getEntityId(entity);
        this.entityStates.delete(entityId);
    }

    /**
     * Update all tracked entities (called each frame)
     */
    update() {
        // Animation updates are handled by Phaser's animation system
        // This method is here for future custom animation logic
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.animations.clear();
        this.entityStates.clear();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationManager;
}
