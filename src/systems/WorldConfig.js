/**
 * WorldConfig - Loads and validates world configuration from JSON
 * Validates: Requirements 11.1, 11.2, 11.3
 */
class WorldConfig {
    constructor() {
        this.config = null;
        this.isLoaded = false;
    }

    /**
     * Load world configuration from JSON file
     * @param {string} filepath - Path to the JSON configuration file
     * @returns {Promise<Object>} The loaded configuration
     */
    async loadFromJSON(filepath) {
        try {
            // Add cache busting parameter to prevent browser caching issues
            const cacheBuster = `?v=${Date.now()}`;
            const response = await fetch(filepath + cacheBuster);
            
            if (!response.ok) {
                throw new Error(`Failed to load configuration: ${response.status} ${response.statusText}`);
            }

            const text = await response.text();
            
            // Parse JSON with error handling
            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                throw new Error(`Invalid JSON format: ${parseError.message}`);
            }

            // Validate the configuration structure
            this.validateConfiguration(data);

            this.config = data;
            this.isLoaded = true;

            console.log('World configuration loaded successfully');
            return this.config;

        } catch (error) {
            console.error('Error loading world configuration:', error);
            
            // Return a minimal default configuration on error
            this.config = this.getDefaultConfiguration();
            this.isLoaded = false;
            
            throw error;
        }
    }

    /**
     * Validate the configuration structure
     * @param {Object} data - Configuration data to validate
     * @throws {Error} If validation fails
     */
    validateConfiguration(data) {
        // Validate overworld
        if (!data.overworld) {
            throw new Error('Configuration missing "overworld" section');
        }

        if (!data.overworld.size || typeof data.overworld.size.width !== 'number' || typeof data.overworld.size.height !== 'number') {
            throw new Error('Invalid overworld size configuration');
        }

        if (!Array.isArray(data.overworld.screens)) {
            throw new Error('Overworld screens must be an array');
        }

        // Validate screens
        data.overworld.screens.forEach((screen, index) => {
            if (typeof screen.x !== 'number' || typeof screen.y !== 'number') {
                throw new Error(`Screen ${index} missing valid x/y coordinates`);
            }
            if (!screen.terrain) {
                throw new Error(`Screen ${index} missing terrain type`);
            }
            if (!Array.isArray(screen.obstacles)) {
                throw new Error(`Screen ${index} obstacles must be an array`);
            }
            if (!Array.isArray(screen.enemies)) {
                throw new Error(`Screen ${index} enemies must be an array`);
            }
            if (!Array.isArray(screen.collectibles)) {
                throw new Error(`Screen ${index} collectibles must be an array`);
            }
        });

        // Validate dungeons
        if (!Array.isArray(data.dungeons)) {
            throw new Error('Dungeons must be an array');
        }

        data.dungeons.forEach((dungeon, index) => {
            if (typeof dungeon.id !== 'number') {
                throw new Error(`Dungeon ${index} missing valid id`);
            }
            if (!dungeon.name) {
                throw new Error(`Dungeon ${index} missing name`);
            }
            if (!Array.isArray(dungeon.rooms)) {
                throw new Error(`Dungeon ${index} rooms must be an array`);
            }
            if (dungeon.rooms.length === 0) {
                throw new Error(`Dungeon ${index} must have at least one room`);
            }

            // Validate rooms
            dungeon.rooms.forEach((room, roomIndex) => {
                if (typeof room.id !== 'number') {
                    throw new Error(`Dungeon ${index}, Room ${roomIndex} missing valid id`);
                }
                if (!room.type) {
                    throw new Error(`Dungeon ${index}, Room ${roomIndex} missing type`);
                }
                if (!Array.isArray(room.doors)) {
                    throw new Error(`Dungeon ${index}, Room ${roomIndex} doors must be an array`);
                }
            });
        });

        // Validate stores
        if (!Array.isArray(data.stores)) {
            throw new Error('Stores must be an array');
        }

        data.stores.forEach((store, index) => {
            if (typeof store.id !== 'number') {
                throw new Error(`Store ${index} missing valid id`);
            }
            if (!Array.isArray(store.inventory)) {
                throw new Error(`Store ${index} inventory must be an array`);
            }
        });

        // Validate enemy types
        if (!data.enemyTypes || typeof data.enemyTypes !== 'object') {
            throw new Error('Configuration missing "enemyTypes" section');
        }

        console.log('Configuration validation passed');
    }

    /**
     * Get overworld screen data by coordinates
     * @param {number} x - Screen x coordinate
     * @param {number} y - Screen y coordinate
     * @returns {Object|null} Screen data or null if not found
     */
    getOverworldScreen(x, y) {
        if (!this.config || !this.config.overworld) {
            console.warn('Configuration not loaded');
            return null;
        }

        const screen = this.config.overworld.screens.find(s => s.x === x && s.y === y);
        
        if (!screen) {
            console.warn(`Screen not found at coordinates (${x}, ${y})`);
            return null;
        }

        return screen;
    }

    /**
     * Get dungeon data by ID
     * @param {number} dungeonId - Dungeon ID
     * @returns {Object|null} Dungeon data or null if not found
     */
    getDungeonData(dungeonId) {
        if (!this.config || !this.config.dungeons) {
            console.warn('Configuration not loaded');
            return null;
        }

        const dungeon = this.config.dungeons.find(d => d.id === dungeonId);
        
        if (!dungeon) {
            console.warn(`Dungeon not found with ID ${dungeonId}`);
            return null;
        }

        return dungeon;
    }

    /**
     * Get store inventory by store ID
     * @param {number} storeId - Store ID
     * @returns {Array|null} Store inventory or null if not found
     */
    getStoreInventory(storeId) {
        if (!this.config || !this.config.stores) {
            console.warn('Configuration not loaded');
            return null;
        }

        const store = this.config.stores.find(s => s.id === storeId);
        
        if (!store) {
            console.warn(`Store not found with ID ${storeId}`);
            return null;
        }

        return store.inventory;
    }

    /**
     * Get enemy type configuration
     * @param {string} enemyType - Enemy type name
     * @returns {Object|null} Enemy configuration or null if not found
     */
    getEnemyType(enemyType) {
        if (!this.config || !this.config.enemyTypes) {
            console.warn('Configuration not loaded');
            return null;
        }

        const enemyConfig = this.config.enemyTypes[enemyType];
        
        if (!enemyConfig) {
            console.warn(`Enemy type not found: ${enemyType}`);
            return null;
        }

        return enemyConfig;
    }

    /**
     * Get all overworld screens
     * @returns {Array} Array of all screens
     */
    getAllScreens() {
        if (!this.config || !this.config.overworld) {
            return [];
        }
        return this.config.overworld.screens;
    }

    /**
     * Get overworld size
     * @returns {Object} Size object with width and height
     */
    getOverworldSize() {
        if (!this.config || !this.config.overworld) {
            return { width: 6, height: 6 };
        }
        return this.config.overworld.size;
    }

    /**
     * Get default configuration for fallback
     * @returns {Object} Minimal default configuration
     */
    getDefaultConfiguration() {
        return {
            overworld: {
                size: { width: 6, height: 6 },
                screens: [
                    {
                        x: 0,
                        y: 0,
                        terrain: 'grass',
                        obstacles: [],
                        enemies: [],
                        collectibles: [],
                        dungeonEntrance: null,
                        storeEntrance: null
                    }
                ]
            },
            dungeons: [],
            stores: [],
            enemyTypes: {
                zombie: {
                    name: 'Zombie',
                    health: 30,
                    damage: 5,
                    speed: 50,
                    xp: 10,
                    sprite: 'zombie'
                }
            }
        };
    }

    /**
     * Check if configuration is loaded
     * @returns {boolean} True if loaded successfully
     */
    isConfigLoaded() {
        return this.isLoaded;
    }

    /**
     * Get the full configuration object
     * @returns {Object|null} Full configuration or null
     */
    getConfig() {
        return this.config;
    }
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorldConfig;
}
