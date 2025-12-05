// Boss.test.js - Tests for Boss entity
// Tests boss creation, enhanced stats, and unique attack patterns

// Import jest globals for ES modules
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock Phaser scene
class MockScene {
    constructor() {
        this.sound = null;
        this.tweens = {
            add: jest.fn(),
        };
        this.registry = {
            get: jest.fn(() => null), // Mock registry that returns null for audioManager
        };
    }
}

// Import classes
import { Boss } from './Boss.js';
import { Player } from './Player.js';

describe('Boss Entity', () => {
    let scene;
    let boss;
    let player;

    beforeEach(() => {
        scene = new MockScene();
        player = new Player(scene, 100, 100);
    });

    describe('Boss Creation', () => {
        test('boss is created with enhanced stats', () => {
            boss = new Boss(scene, 200, 200, 'boss_zombie', {
                health: 50,
                damage: 10,
                xpReward: 100,
            });

            expect(boss.isBoss).toBe(true);
            expect(boss.health.max).toBe(50);
            expect(boss.attackDamage).toBe(10);
            expect(boss.xpReward).toBe(100);
        });

        test('boss has default enhanced stats if not specified', () => {
            boss = new Boss(scene, 200, 200, 'boss_zombie');

            expect(boss.isBoss).toBe(true);
            expect(boss.health.max).toBe(20); // Default boss health (20 hits to defeat)
            expect(boss.attackDamage).toBe(10); // Default boss damage
            expect(boss.xpReward).toBe(100); // Default boss XP
        });

        test('boss has larger hitbox than regular enemy', () => {
            boss = new Boss(scene, 200, 200, 'boss_zombie');

            expect(boss.hitbox.width).toBe(40);
            expect(boss.hitbox.height).toBe(40);
        });

        test('boss has attack pattern', () => {
            boss = new Boss(scene, 200, 200, 'boss_zombie', {
                attackPattern: 'aggressive',
            });

            expect(boss.attackPattern).toBe('aggressive');
        });
    });

    describe('Boss Attack Patterns', () => {
        test('boss has aggressive attack pattern', () => {
            boss = new Boss(scene, 200, 200, 'boss_zombie', {
                attackPattern: 'aggressive',
            });
            boss.setTarget(player);

            expect(boss.attackPattern).toBe('aggressive');
            expect(typeof boss.aggressivePattern).toBe('function');
        });

        test('boss has defensive attack pattern', () => {
            boss = new Boss(scene, 200, 200, 'boss_zombie', {
                attackPattern: 'defensive',
            });
            boss.setTarget(player);

            expect(boss.attackPattern).toBe('defensive');
            expect(typeof boss.defensivePattern).toBe('function');
        });

        test('boss has ranged attack pattern', () => {
            boss = new Boss(scene, 200, 200, 'boss_zombie', {
                attackPattern: 'ranged',
            });
            boss.setTarget(player);

            expect(boss.attackPattern).toBe('ranged');
            expect(typeof boss.rangedPattern).toBe('function');
        });

        test('boss has teleport attack pattern', () => {
            boss = new Boss(scene, 200, 200, 'boss_zombie', {
                attackPattern: 'teleport',
            });
            boss.setTarget(player);

            expect(boss.attackPattern).toBe('teleport');
            expect(typeof boss.teleportPattern).toBe('function');
        });

        test('boss attack pattern changes over time', () => {
            boss = new Boss(scene, 200, 200, 'boss_zombie', {
                attackPattern: 'aggressive',
            });
            boss.setTarget(player);

            const initialState = boss.attackPatternState;

            // Simulate time passing
            boss.attackPatternTimer = boss.attackPatternInterval + 100;
            boss.ai();

            // Pattern state should have changed
            expect(boss.attackPatternState).not.toBe(initialState);
        });
    });

    describe('Boss Stats', () => {
        test('boss has higher health than regular enemy', () => {
            boss = new Boss(scene, 200, 200, 'boss_zombie');

            // Boss default health (50) should be higher than regular enemy (3)
            expect(boss.health.max).toBeGreaterThan(10);
        });

        test('boss has higher damage than regular enemy', () => {
            boss = new Boss(scene, 200, 200, 'boss_zombie');

            // Boss default damage (10) should be higher than regular enemy (1)
            expect(boss.attackDamage).toBeGreaterThan(5);
        });

        test('boss has higher XP reward than regular enemy', () => {
            boss = new Boss(scene, 200, 200, 'boss_zombie');

            // Boss default XP (100) should be higher than regular enemy (10)
            expect(boss.getXPReward()).toBeGreaterThan(50);
        });

        test('boss has faster attack cooldown', () => {
            boss = new Boss(scene, 200, 200, 'boss_zombie');

            // Boss default cooldown (800) should be faster than regular enemy (1000)
            expect(boss.attackCooldown).toBeLessThan(1000);
        });
    });

    describe('Boss Defeat', () => {
        test('boss defeat logs message', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            boss = new Boss(scene, 200, 200, 'boss_zombie', { health: 1 });
            boss.defeat();

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Boss boss_zombie defeated!')
            );

            consoleSpy.mockRestore();
        });

        test('boss becomes friendly when defeated', () => {
            boss = new Boss(scene, 200, 200, 'boss_zombie', { health: 1 });
            boss.defeat();

            expect(boss.isFriendly).toBe(true);
            expect(boss.active).toBe(false);
        });
    });
});
