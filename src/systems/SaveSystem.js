// SaveSystem - Manages game save/load functionality
// Handles serialization of game state to localStorage

export class SaveSystem {
    constructor() {
        this.SAVE_KEY = 'legend_of_kiro_save';
        this.SETTINGS_KEY = 'legend_of_kiro_settings';
    }

    /**
     * Create save data structure from current game state
     * @param {object} playerState - Player state from registry
     * @param {object} worldState - World state (collected items, defeated enemies, etc.)
     * @param {object} settings - Game settings
     * @returns {object} Save data structure
     */
    createSaveData(playerState, worldState, settings) {
        return {
            version: '1.0.0',
            timestamp: Date.now(),
            playerData: {
                position: {
                    screen: playerState.currentScreen || { x: 0, y: 0 },
                    local: playerState.localPosition || { x: 400, y: 300 },
                },
                health: {
                    current: playerState.health?.current || 6,
                    max: playerState.health?.max || 6,
                },
                xp: playerState.stats?.xp || 0,
                level: playerState.stats?.level || 1,
                coins: playerState.inventory?.coins || 0,
                inventory: playerState.inventory?.items || [],
                equippedWeapon: playerState.inventory?.equippedWeapon || null,
                equippedArmor: playerState.inventory?.equippedArmor || null,
            },
            worldState: {
                collectedItems: worldState.collectedItems || [],
                defeatedEnemies: worldState.defeatedEnemies || [],
                completedDungeons: worldState.completedDungeons || [],
                unlockedDoors: worldState.unlockedDoors || [],
                visitedScreens: worldState.visitedScreens || [],
            },
            settings: {
                musicEnabled: settings.musicEnabled !== undefined ? settings.musicEnabled : true,
                sfxEnabled: settings.sfxEnabled !== undefined ? settings.sfxEnabled : true,
            },
        };
    }

    /**
     * Validate save data structure
     * @param {object} data - Save data to validate
     * @returns {boolean} True if valid
     */
    validateSaveData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        // Check required top-level properties
        if (!data.playerData || !data.worldState || !data.settings) {
            return false;
        }

        // Check player data structure
        const pd = data.playerData;
        if (
            !pd.position ||
            !pd.position.screen ||
            !pd.position.local ||
            !pd.health ||
            typeof pd.health.current !== 'number' ||
            typeof pd.health.max !== 'number' ||
            typeof pd.xp !== 'number' ||
            typeof pd.level !== 'number' ||
            typeof pd.coins !== 'number' ||
            !Array.isArray(pd.inventory)
        ) {
            return false;
        }

        // Check world state structure
        const ws = data.worldState;
        if (
            !Array.isArray(ws.collectedItems) ||
            !Array.isArray(ws.defeatedEnemies) ||
            !Array.isArray(ws.completedDungeons) ||
            !Array.isArray(ws.unlockedDoors)
        ) {
            return false;
        }

        // Check settings structure
        const s = data.settings;
        if (typeof s.musicEnabled !== 'boolean' || typeof s.sfxEnabled !== 'boolean') {
            return false;
        }

        return true;
    }

    /**
     * Get default save data
     * @returns {object} Default save data structure
     */
    getDefaultSaveData() {
        return {
            version: '1.0.0',
            timestamp: Date.now(),
            playerData: {
                position: {
                    screen: { x: 0, y: 0 },
                    local: { x: 400, y: 300 },
                },
                health: {
                    current: 6,
                    max: 6,
                },
                xp: 0,
                level: 1,
                coins: 0,
                inventory: [],
                equippedWeapon: null,
                equippedArmor: null,
            },
            worldState: {
                collectedItems: [],
                defeatedEnemies: [],
                completedDungeons: [],
                unlockedDoors: [],
                visitedScreens: [],
            },
            settings: {
                musicEnabled: true,
                sfxEnabled: true,
            },
        };
    }

    /**
     * Save game state to localStorage
     * @param {object} playerState - Player state from registry
     * @param {object} worldState - World state
     * @param {object} settings - Game settings
     * @returns {boolean} True if save was successful
     */
    saveGame(playerState, worldState, settings) {
        try {
            // Create save data structure
            const saveData = this.createSaveData(playerState, worldState, settings);

            // Serialize to JSON
            const jsonData = JSON.stringify(saveData);

            // Store in localStorage
            localStorage.setItem(this.SAVE_KEY, jsonData);

            console.log('Game saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }

    /**
     * Check if a save file exists
     * @returns {boolean} True if save exists
     */
    hasSaveData() {
        try {
            const data = localStorage.getItem(this.SAVE_KEY);
            return data !== null;
        } catch (error) {
            console.error('Failed to check for save data:', error);
            return false;
        }
    }

    /**
     * Delete save data
     * @returns {boolean} True if deletion was successful
     */
    deleteSave() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            console.log('Save data deleted');
            return true;
        } catch (error) {
            console.error('Failed to delete save data:', error);
            return false;
        }
    }

    /**
     * Load game state from localStorage
     * @returns {object|null} Save data if successful, null if failed or no save exists
     */
    loadGame() {
        try {
            // Get data from localStorage
            const jsonData = localStorage.getItem(this.SAVE_KEY);

            if (!jsonData) {
                console.log('No save data found');
                return null;
            }

            // Parse JSON
            const saveData = JSON.parse(jsonData);

            // Validate save data structure
            if (!this.validateSaveData(saveData)) {
                console.error('Save data is corrupted or invalid');
                return null;
            }

            console.log('Game loaded successfully');
            return saveData;
        } catch (error) {
            console.error('Failed to load game:', error);
            return null;
        }
    }

    /**
     * Restore game state to registry from save data
     * @param {Phaser.Scene} scene - Scene with registry access
     * @param {object} saveData - Save data to restore
     */
    restoreGameState(scene, saveData) {
        if (!saveData || !scene || !scene.registry) {
            console.error('Cannot restore game state: invalid parameters');
            return;
        }

        // Restore player state to registry
        scene.registry.set('playerState', {
            health: saveData.playerData.health,
            inventory: {
                coins: saveData.playerData.coins,
                items: saveData.playerData.inventory,
                equippedWeapon: saveData.playerData.equippedWeapon,
                equippedArmor: saveData.playerData.equippedArmor,
            },
            stats: {
                xp: saveData.playerData.xp,
                level: saveData.playerData.level,
                damage: saveData.playerData.equippedWeapon?.damage || 1,
                defense: saveData.playerData.equippedArmor?.defense || 0,
                speed: 100,
            },
            currentScreen: saveData.playerData.position.screen,
            localPosition: saveData.playerData.position.local,
        });

        // Restore world state
        scene.registry.set('completedDungeons', saveData.worldState.completedDungeons);
        scene.registry.set('collectedItems', saveData.worldState.collectedItems);
        scene.registry.set('defeatedEnemies', saveData.worldState.defeatedEnemies);
        scene.registry.set('unlockedDoors', saveData.worldState.unlockedDoors);
        scene.registry.set('visitedScreens', saveData.worldState.visitedScreens);

        // Restore settings
        const audioManager = scene.registry.get('audioManager');
        if (audioManager) {
            audioManager.setMusicEnabled(saveData.settings.musicEnabled);
            audioManager.setSfxEnabled(saveData.settings.sfxEnabled);
        }

        console.log('Game state restored to registry');
    }

    /**
     * Get current game state from registry
     * @param {Phaser.Scene} scene - Scene with registry access
     * @returns {object} Current game state
     */
    getCurrentGameState(scene) {
        if (!scene || !scene.registry) {
            console.error('Cannot get game state: invalid scene');
            return null;
        }

        const playerState = scene.registry.get('playerState') || {};
        const audioManager = scene.registry.get('audioManager');

        return {
            playerState: playerState,
            worldState: {
                collectedItems: scene.registry.get('collectedItems') || [],
                defeatedEnemies: scene.registry.get('defeatedEnemies') || [],
                completedDungeons: scene.registry.get('completedDungeons') || [],
                unlockedDoors: scene.registry.get('unlockedDoors') || [],
                visitedScreens: scene.registry.get('visitedScreens') || [],
            },
            settings: {
                musicEnabled: audioManager ? audioManager.musicEnabled : true,
                sfxEnabled: audioManager ? audioManager.sfxEnabled : true,
            },
        };
    }
}
