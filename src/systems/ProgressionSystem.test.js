// ProgressionSystem.test.js - Tests for collection and progression system
// Tests XP, leveling, and collectible mechanics

// Import jest globals for ES modules
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock Phaser scene
class MockScene {
    constructor() {
        this.sound = null;
        this.tweens = null;
        this.registry = {
            get: jest.fn(() => null), // Mock registry that returns null for audioManager
        };
    }
}

// Import classes
import { Entity } from '../entities/Entity.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Collectible } from '../entities/Collectible.js';

describe('Progression System', () => {
    let scene;
    let player;

    beforeEach(() => {
        scene = new MockScene();
        player = new Player(scene, 100, 100);
    });

    describe('XP and Leveling', () => {
        test('player starts at level 1 with 0 XP', () => {
            expect(player.stats.level).toBe(1);
            expect(player.stats.xp).toBe(0);
        });

        test('calculateLevelThreshold returns correct threshold', () => {
            expect(player.calculateLevelThreshold(1)).toBe(10);
            expect(player.calculateLevelThreshold(2)).toBe(20);
            expect(player.calculateLevelThreshold(5)).toBe(50);
        });

        test('addXP increases XP', () => {
            player.addXP(5);
            expect(player.stats.xp).toBe(5);
        });

        test('addXP triggers level up when threshold reached', () => {
            const initialMaxHealth = player.health.max;
            const leveledUp = player.addXP(10); // Reach level 2 threshold

            expect(leveledUp).toBe(true);
            expect(player.stats.level).toBe(2);
            expect(player.health.max).toBe(initialMaxHealth + 2);
        });

        test('level up increases max health by 2', () => {
            const initialMaxHealth = player.health.max;
            player.levelUp();

            expect(player.health.max).toBe(initialMaxHealth + 2);
        });

        test('level up fully heals player', () => {
            player.health.current = 2; // Damage player
            player.levelUp();

            expect(player.health.current).toBe(player.health.max);
        });

        test('multiple level ups work correctly', () => {
            player.addXP(10); // Level 2
            expect(player.stats.level).toBe(2);

            player.addXP(20); // Level 3 (total 30 XP)
            expect(player.stats.level).toBe(3);
        });
    });

    describe('Enemy XP Rewards', () => {
        test('enemy has XP reward', () => {
            const enemy = new Enemy(scene, 200, 200, 'zombie', { xpReward: 15 });
            expect(enemy.getXPReward()).toBe(15);
        });

        test('enemy has default XP reward if not specified', () => {
            const enemy = new Enemy(scene, 200, 200, 'zombie');
            expect(enemy.getXPReward()).toBe(10);
        });
    });

    describe('Collectible System', () => {
        test('coin collectible increases player coins', () => {
            const coin = new Collectible(scene, 150, 150, 'coin', { value: 5 });
            const initialCoins = player.inventory.coins;

            coin.collect(player);

            expect(player.inventory.coins).toBe(initialCoins + 5);
            expect(coin.active).toBe(false);
        });

        test('health collectible heals player', () => {
            player.health.current = 3; // Damage player
            const health = new Collectible(scene, 150, 150, 'health', { value: 2 });

            health.collect(player);

            expect(player.health.current).toBe(5);
        });

        test('health collectible respects max health', () => {
            player.health.current = player.health.max - 1;
            const health = new Collectible(scene, 150, 150, 'health', { value: 10 });

            health.collect(player);

            expect(player.health.current).toBe(player.health.max);
        });

        test('weapon collectible adds to inventory', () => {
            const weapon = new Collectible(scene, 150, 150, 'weapon', {
                name: 'Iron Sword',
                damage: 5,
            });

            weapon.collect(player);

            expect(player.inventory.items.length).toBeGreaterThan(0);
            expect(player.inventory.items[0].type).toBe('weapon');
            expect(player.inventory.items[0].name).toBe('Iron Sword');
            expect(player.inventory.items[0].damage).toBe(5);
        });

        test('armor collectible adds to inventory', () => {
            const armor = new Collectible(scene, 150, 150, 'armor', {
                name: 'Leather Armor',
                defense: 3,
            });

            armor.collect(player);

            expect(player.inventory.items.length).toBeGreaterThan(0);
            expect(player.inventory.items[0].type).toBe('armor');
            expect(player.inventory.items[0].name).toBe('Leather Armor');
            expect(player.inventory.items[0].defense).toBe(3);
        });

        test('collecting inactive collectible returns false', () => {
            const coin = new Collectible(scene, 150, 150, 'coin', { value: 5 });
            coin.active = false;

            const result = coin.collect(player);

            expect(result).toBe(false);
        });
    });

    describe('Integration Tests', () => {
        test('defeating enemy awards XP and can trigger level up', () => {
            const enemy = new Enemy(scene, 200, 200, 'zombie', {
                health: 1,
                xpReward: 10,
            });

            const initialLevel = player.stats.level;

            // Defeat enemy
            enemy.takeDamage(1);

            // Award XP
            const leveledUp = player.addXP(enemy.getXPReward());

            expect(player.stats.xp).toBe(10);
            expect(leveledUp).toBe(true);
            expect(player.stats.level).toBe(initialLevel + 1);
        });

        test('collecting multiple coins accumulates', () => {
            const coin1 = new Collectible(scene, 150, 150, 'coin', { value: 5 });
            const coin2 = new Collectible(scene, 160, 160, 'coin', { value: 10 });
            const coin3 = new Collectible(scene, 170, 170, 'coin', { value: 3 });

            coin1.collect(player);
            coin2.collect(player);
            coin3.collect(player);

            expect(player.inventory.coins).toBe(18);
        });
    });
});
