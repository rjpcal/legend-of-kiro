// SaveSystem tests
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { SaveSystem } from './SaveSystem.js';

describe('SaveSystem', () => {
    let saveSystem;

    beforeEach(() => {
        saveSystem = new SaveSystem();

        // Mock localStorage with a simple in-memory implementation
        const storage = {};
        global.localStorage = {
            getItem: key => storage[key] || null,
            setItem: (key, value) => {
                storage[key] = value;
            },
            removeItem: key => {
                delete storage[key];
            },
            clear: () => {
                Object.keys(storage).forEach(key => delete storage[key]);
            },
        };

        // Clear storage before each test
        global.localStorage.clear();
    });

    describe('createSaveData', () => {
        test('creates valid save data structure', () => {
            const playerState = {
                health: { current: 6, max: 6 },
                inventory: { coins: 10, items: [], equippedWeapon: null, equippedArmor: null },
                stats: { xp: 5, level: 1 },
                currentScreen: { x: 0, y: 0 },
                localPosition: { x: 400, y: 300 },
            };

            const worldState = {
                collectedItems: [],
                defeatedEnemies: [],
                completedDungeons: [],
                unlockedDoors: [],
                visitedScreens: [],
            };

            const settings = {
                musicEnabled: true,
                sfxEnabled: true,
            };

            const saveData = saveSystem.createSaveData(playerState, worldState, settings);

            expect(saveData).toHaveProperty('version');
            expect(saveData).toHaveProperty('timestamp');
            expect(saveData).toHaveProperty('playerData');
            expect(saveData).toHaveProperty('worldState');
            expect(saveData).toHaveProperty('settings');
            expect(saveData.playerData.health.current).toBe(6);
            expect(saveData.playerData.coins).toBe(10);
        });
    });

    describe('validateSaveData', () => {
        test('validates correct save data', () => {
            const validData = saveSystem.getDefaultSaveData();
            expect(saveSystem.validateSaveData(validData)).toBe(true);
        });

        test('rejects invalid save data', () => {
            expect(saveSystem.validateSaveData(null)).toBe(false);
            expect(saveSystem.validateSaveData({})).toBe(false);
            expect(saveSystem.validateSaveData({ playerData: {} })).toBe(false);
        });

        test('rejects save data with missing player properties', () => {
            const invalidData = {
                playerData: {
                    position: { screen: { x: 0, y: 0 }, local: { x: 0, y: 0 } },
                    health: { current: 6 },
                },
                worldState: {
                    collectedItems: [],
                    defeatedEnemies: [],
                    completedDungeons: [],
                    unlockedDoors: [],
                },
                settings: {
                    musicEnabled: true,
                    sfxEnabled: true,
                },
            };

            expect(saveSystem.validateSaveData(invalidData)).toBe(false);
        });
    });

    describe('saveGame', () => {
        test('saves game to localStorage', () => {
            const playerState = {
                health: { current: 6, max: 6 },
                inventory: { coins: 10, items: [], equippedWeapon: null, equippedArmor: null },
                stats: { xp: 5, level: 1 },
                currentScreen: { x: 0, y: 0 },
                localPosition: { x: 400, y: 300 },
            };

            const worldState = {
                collectedItems: [],
                defeatedEnemies: [],
                completedDungeons: [],
                unlockedDoors: [],
                visitedScreens: [],
            };

            const settings = {
                musicEnabled: true,
                sfxEnabled: true,
            };

            const result = saveSystem.saveGame(playerState, worldState, settings);

            expect(result).toBe(true);

            // Verify data was saved
            const savedData = localStorage.getItem(saveSystem.SAVE_KEY);
            expect(savedData).not.toBeNull();

            // Verify the saved data can be parsed
            const parsedData = JSON.parse(savedData);
            expect(parsedData.playerData.coins).toBe(10);
        });
    });

    describe('loadGame', () => {
        test('loads game from localStorage', () => {
            const saveData = saveSystem.getDefaultSaveData();
            localStorage.setItem(saveSystem.SAVE_KEY, JSON.stringify(saveData));

            const loaded = saveSystem.loadGame();

            expect(loaded).not.toBeNull();
            expect(loaded.playerData.health.current).toBe(6);
        });

        test('returns null when no save exists', () => {
            const loaded = saveSystem.loadGame();
            expect(loaded).toBeNull();
        });

        test('returns null when save data is corrupted', () => {
            localStorage.setItem(saveSystem.SAVE_KEY, 'invalid json');

            const loaded = saveSystem.loadGame();
            expect(loaded).toBeNull();
        });
    });

    describe('hasSaveData', () => {
        test('returns true when save exists', () => {
            localStorage.setItem(saveSystem.SAVE_KEY, 'some data');
            expect(saveSystem.hasSaveData()).toBe(true);
        });

        test('returns false when no save exists', () => {
            expect(saveSystem.hasSaveData()).toBe(false);
        });
    });

    describe('deleteSave', () => {
        test('deletes save data', () => {
            localStorage.setItem(saveSystem.SAVE_KEY, 'some data');

            const result = saveSystem.deleteSave();

            expect(result).toBe(true);
            expect(localStorage.getItem(saveSystem.SAVE_KEY)).toBeNull();
        });
    });

    describe('restoreGameState', () => {
        test('restores game state to registry', () => {
            const mockScene = {
                registry: {
                    set: jest.fn(),
                    get: jest.fn(() => null),
                },
            };

            const saveData = saveSystem.getDefaultSaveData();
            saveSystem.restoreGameState(mockScene, saveData);

            expect(mockScene.registry.set).toHaveBeenCalledWith('playerState', expect.any(Object));
            expect(mockScene.registry.set).toHaveBeenCalledWith(
                'completedDungeons',
                expect.any(Array)
            );
        });
    });

    describe('getCurrentGameState', () => {
        test('gets current game state from registry', () => {
            const mockScene = {
                registry: {
                    get: jest.fn(key => {
                        if (key === 'playerState') {
                            return {
                                health: { current: 6, max: 6 },
                                inventory: { coins: 10 },
                                stats: { xp: 5, level: 1 },
                            };
                        }
                        if (key === 'audioManager') {
                            return { musicEnabled: true, sfxEnabled: true };
                        }
                        return [];
                    }),
                },
            };

            const gameState = saveSystem.getCurrentGameState(mockScene);

            expect(gameState).toHaveProperty('playerState');
            expect(gameState).toHaveProperty('worldState');
            expect(gameState).toHaveProperty('settings');
        });
    });
});
