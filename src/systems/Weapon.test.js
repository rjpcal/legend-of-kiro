// Weapon tests

// Import jest globals for ES modules
import { describe, test, expect, beforeEach } from '@jest/globals';

import { Weapon, Projectile } from './Weapon.js';

describe('Weapon', () => {
    describe('Weapon Creation', () => {
        test('creates weapon with default properties', () => {
            const weapon = new Weapon();

            expect(weapon.name).toBe('Basic Weapon');
            expect(weapon.damage).toBe(1);
            expect(weapon.range).toBe(40);
            expect(weapon.attackSpeed).toBe(500);
            expect(weapon.canThrow).toBe(true);
        });

        test('creates weapon with custom properties', () => {
            const weapon = new Weapon({
                name: 'Iron Sword',
                damage: 5,
                range: 50,
                attackSpeed: 400,
                canThrow: false,
            });

            expect(weapon.name).toBe('Iron Sword');
            expect(weapon.damage).toBe(5);
            expect(weapon.range).toBe(50);
            expect(weapon.attackSpeed).toBe(400);
            expect(weapon.canThrow).toBe(false);
        });
    });

    describe('Melee Attack Hitbox', () => {
        let weapon;

        beforeEach(() => {
            weapon = new Weapon({ damage: 3, range: 40 });
        });

        test('creates hitbox facing up', () => {
            const hitbox = weapon.createMeleeHitbox(100, 100, 'up');

            expect(hitbox.x).toBe(100 - 16); // centered
            expect(hitbox.y).toBe(100 - 40 - 16); // above player
            expect(hitbox.width).toBe(32);
            expect(hitbox.height).toBe(32);
            expect(hitbox.damage).toBe(3);
            expect(hitbox.direction).toBe('up');
        });

        test('creates hitbox facing down', () => {
            const hitbox = weapon.createMeleeHitbox(100, 100, 'down');

            expect(hitbox.x).toBe(100 - 16);
            expect(hitbox.y).toBe(100 + 40 - 16); // below player
            expect(hitbox.damage).toBe(3);
            expect(hitbox.direction).toBe('down');
        });

        test('creates hitbox facing left', () => {
            const hitbox = weapon.createMeleeHitbox(100, 100, 'left');

            expect(hitbox.x).toBe(100 - 40 - 16); // left of player
            expect(hitbox.y).toBe(100 - 16);
            expect(hitbox.damage).toBe(3);
            expect(hitbox.direction).toBe('left');
        });

        test('creates hitbox facing right', () => {
            const hitbox = weapon.createMeleeHitbox(100, 100, 'right');

            expect(hitbox.x).toBe(100 + 40 - 16); // right of player
            expect(hitbox.y).toBe(100 - 16);
            expect(hitbox.damage).toBe(3);
            expect(hitbox.direction).toBe('right');
        });
    });

    describe('Attack Method', () => {
        test('attack returns hitbox', () => {
            const weapon = new Weapon({ damage: 2 });
            const hitbox = weapon.attack(50, 50, 'up');

            expect(hitbox).toBeDefined();
            expect(hitbox.damage).toBe(2);
            expect(hitbox.direction).toBe('up');
        });
    });

    describe('Throw Method', () => {
        test('throw returns null when weapon cannot be thrown', () => {
            const weapon = new Weapon({ canThrow: false });
            const mockScene = {};
            const mockOwner = { x: 100, y: 100 };

            const projectile = weapon.throw(mockScene, 100, 100, 'up', mockOwner);

            expect(projectile).toBeNull();
        });

        test('throw creates projectile when weapon can be thrown', () => {
            const weapon = new Weapon({ canThrow: true, damage: 3 });
            const mockScene = { add: {} };
            const mockOwner = { x: 100, y: 100 };

            const projectile = weapon.throw(mockScene, 100, 100, 'up', mockOwner);

            expect(projectile).toBeInstanceOf(Projectile);
            expect(projectile.damage).toBe(3);
            expect(projectile.direction).toBe('up');
        });
    });
});

describe('Projectile', () => {
    let mockScene;
    let mockWeapon;
    let mockOwner;

    beforeEach(() => {
        mockScene = { add: {} };
        mockWeapon = new Weapon({ damage: 2, projectileSpeed: 200 });
        mockOwner = { x: 100, y: 100 };
    });

    test('creates projectile with correct properties', () => {
        const projectile = new Projectile(mockScene, 50, 50, 'right', mockWeapon, mockOwner);

        expect(projectile.x).toBe(50);
        expect(projectile.y).toBe(50);
        expect(projectile.direction).toBe('right');
        expect(projectile.damage).toBe(2);
        expect(projectile.speed).toBe(200);
        expect(projectile.returning).toBe(false);
    });

    test('moves in correct direction', () => {
        const projectile = new Projectile(mockScene, 100, 100, 'up', mockWeapon, mockOwner);

        projectile.moveInDirection(10);

        expect(projectile.x).toBe(100);
        expect(projectile.y).toBe(90); // moved up
    });

    test('starts returning after max distance', () => {
        const projectile = new Projectile(mockScene, 100, 100, 'right', mockWeapon, mockOwner);
        projectile.maxDistance = 50;

        // Simulate movement
        projectile.update(250); // 250ms at 200 px/s = 50 pixels

        expect(projectile.returning).toBe(true);
    });

    test('onHitEnemy starts returning', () => {
        const projectile = new Projectile(mockScene, 100, 100, 'right', mockWeapon, mockOwner);

        expect(projectile.returning).toBe(false);

        projectile.onHitEnemy();

        expect(projectile.returning).toBe(true);
    });
});
