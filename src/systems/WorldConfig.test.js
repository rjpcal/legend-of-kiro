/**
 * Unit tests for WorldConfig
 * Tests configuration loading, validation, and error handling
 * Requirements: 11.1, 11.2, 11.3
 */

// Import jest globals for ES modules
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Import WorldConfig class
import { WorldConfig } from './WorldConfig.js';

describe('WorldConfig', () => {
    let worldConfig;

    beforeEach(() => {
        // Mock fetch for testing
        global.fetch = jest.fn();
        worldConfig = new WorldConfig();
        jest.clearAllMocks();
    });

    describe('loadFromJSON', () => {
        test('should load valid configuration successfully', async () => {
            const validConfig = {
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
                        },
                    ],
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
                        sprite: 'zombie',
                    },
                },
            };

            global.fetch.mockResolvedValue({
                ok: true,
                text: async () => JSON.stringify(validConfig),
            });

            const result = await worldConfig.loadFromJSON('test.json');

            expect(result).toEqual(validConfig);
            expect(worldConfig.isConfigLoaded()).toBe(true);
        });

        test('should handle file not found error', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found',
            });

            await expect(worldConfig.loadFromJSON('missing.json')).rejects.toThrow(
                'Failed to load configuration'
            );
            expect(worldConfig.isConfigLoaded()).toBe(false);
        });

        test('should handle invalid JSON format', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                text: async () => 'invalid json {',
            });

            await expect(worldConfig.loadFromJSON('invalid.json')).rejects.toThrow(
                'Invalid JSON format'
            );
            expect(worldConfig.isConfigLoaded()).toBe(false);
        });

        test('should handle malformed configuration structure', async () => {
            const malformedConfig = {
                overworld: {
                    // Missing size
                    screens: [],
                },
            };

            global.fetch.mockResolvedValue({
                ok: true,
                text: async () => JSON.stringify(malformedConfig),
            });

            await expect(worldConfig.loadFromJSON('malformed.json')).rejects.toThrow(
                'Invalid overworld size configuration'
            );
        });
    });

    describe('validateConfiguration', () => {
        test('should reject configuration without overworld', () => {
            const invalidConfig = { dungeons: [], stores: [] };
            expect(() => worldConfig.validateConfiguration(invalidConfig)).toThrow(
                'Configuration missing "overworld" section'
            );
        });

        test('should reject configuration with invalid overworld size', () => {
            const invalidConfig = {
                overworld: {
                    size: { width: 'invalid' },
                    screens: [],
                },
            };
            expect(() => worldConfig.validateConfiguration(invalidConfig)).toThrow(
                'Invalid overworld size configuration'
            );
        });

        test('should reject configuration with non-array screens', () => {
            const invalidConfig = {
                overworld: {
                    size: { width: 6, height: 6 },
                    screens: 'not an array',
                },
            };
            expect(() => worldConfig.validateConfiguration(invalidConfig)).toThrow(
                'Overworld screens must be an array'
            );
        });

        test('should reject screen without coordinates', () => {
            const invalidConfig = {
                overworld: {
                    size: { width: 6, height: 6 },
                    screens: [{ terrain: 'grass' }],
                },
                dungeons: [],
                stores: [],
                enemyTypes: {},
            };
            expect(() => worldConfig.validateConfiguration(invalidConfig)).toThrow(
                'missing valid x/y coordinates'
            );
        });

        test('should reject dungeon without rooms', () => {
            const invalidConfig = {
                overworld: {
                    size: { width: 6, height: 6 },
                    screens: [],
                },
                dungeons: [{ id: 1, name: 'Test', rooms: [] }],
                stores: [],
                enemyTypes: {},
            };
            expect(() => worldConfig.validateConfiguration(invalidConfig)).toThrow(
                'must have at least one room'
            );
        });
    });

    describe('getOverworldScreen', () => {
        beforeEach(async () => {
            const config = {
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
                        },
                        {
                            x: 1,
                            y: 0,
                            terrain: 'dirt',
                            obstacles: [],
                            enemies: [],
                            collectibles: [],
                        },
                    ],
                },
                dungeons: [],
                stores: [],
                enemyTypes: {},
            };

            global.fetch.mockResolvedValue({
                ok: true,
                text: async () => JSON.stringify(config),
            });

            await worldConfig.loadFromJSON('test.json');
        });

        test('should return screen at valid coordinates', () => {
            const screen = worldConfig.getOverworldScreen(0, 0);
            expect(screen).toBeDefined();
            expect(screen.terrain).toBe('grass');
        });

        test('should return null for non-existent coordinates', () => {
            const screen = worldConfig.getOverworldScreen(99, 99);
            expect(screen).toBeNull();
        });
    });

    describe('getDungeonData', () => {
        beforeEach(async () => {
            const config = {
                overworld: {
                    size: { width: 6, height: 6 },
                    screens: [],
                },
                dungeons: [
                    { id: 1, name: 'Test Dungeon', rooms: [{ id: 1, type: 'combat', doors: [] }] },
                ],
                stores: [],
                enemyTypes: {},
            };

            global.fetch.mockResolvedValue({
                ok: true,
                text: async () => JSON.stringify(config),
            });

            await worldConfig.loadFromJSON('test.json');
        });

        test('should return dungeon with valid ID', () => {
            const dungeon = worldConfig.getDungeonData(1);
            expect(dungeon).toBeDefined();
            expect(dungeon.name).toBe('Test Dungeon');
        });

        test('should return null for non-existent dungeon ID', () => {
            const dungeon = worldConfig.getDungeonData(999);
            expect(dungeon).toBeNull();
        });
    });

    describe('getStoreInventory', () => {
        beforeEach(async () => {
            const config = {
                overworld: {
                    size: { width: 6, height: 6 },
                    screens: [],
                },
                dungeons: [],
                stores: [{ id: 1, inventory: [{ type: 'weapon', name: 'Sword' }] }],
                enemyTypes: {},
            };

            global.fetch.mockResolvedValue({
                ok: true,
                text: async () => JSON.stringify(config),
            });

            await worldConfig.loadFromJSON('test.json');
        });

        test('should return store inventory with valid ID', () => {
            const inventory = worldConfig.getStoreInventory(1);
            expect(inventory).toBeDefined();
            expect(inventory.length).toBe(1);
            expect(inventory[0].name).toBe('Sword');
        });

        test('should return null for non-existent store ID', () => {
            const inventory = worldConfig.getStoreInventory(999);
            expect(inventory).toBeNull();
        });
    });

    describe('getEnemyType', () => {
        beforeEach(async () => {
            const config = {
                overworld: {
                    size: { width: 6, height: 6 },
                    screens: [],
                },
                dungeons: [],
                stores: [],
                enemyTypes: {
                    zombie: {
                        name: 'Zombie',
                        health: 30,
                        damage: 5,
                    },
                },
            };

            global.fetch.mockResolvedValue({
                ok: true,
                text: async () => JSON.stringify(config),
            });

            await worldConfig.loadFromJSON('test.json');
        });

        test('should return enemy type configuration', () => {
            const enemyType = worldConfig.getEnemyType('zombie');
            expect(enemyType).toBeDefined();
            expect(enemyType.name).toBe('Zombie');
            expect(enemyType.health).toBe(30);
        });

        test('should return null for non-existent enemy type', () => {
            const enemyType = worldConfig.getEnemyType('dragon');
            expect(enemyType).toBeNull();
        });
    });

    describe('getDefaultConfiguration', () => {
        test('should return valid default configuration', () => {
            const defaultConfig = worldConfig.getDefaultConfiguration();

            expect(defaultConfig.overworld).toBeDefined();
            expect(defaultConfig.overworld.size).toEqual({ width: 6, height: 6 });
            expect(defaultConfig.overworld.screens.length).toBeGreaterThan(0);
            expect(defaultConfig.dungeons).toEqual([]);
            expect(defaultConfig.stores).toEqual([]);
            expect(defaultConfig.enemyTypes).toBeDefined();
        });
    });
});
