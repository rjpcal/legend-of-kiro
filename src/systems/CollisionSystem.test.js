// CollisionSystem tests

// Import jest globals for ES modules
import { describe, test, expect, beforeEach } from '@jest/globals';

import { CollisionSystem } from './CollisionSystem.js';
import { Entity } from '../entities/Entity.js';

describe('CollisionSystem', () => {
    let collisionSystem;
    let mockScene;

    beforeEach(() => {
        mockScene = {};
        collisionSystem = new CollisionSystem(mockScene);
    });

    describe('AABB Collision Detection', () => {
        test('detects collision when boxes overlap', () => {
            const box1 = { x: 0, y: 0, width: 32, height: 32 };
            const box2 = { x: 16, y: 16, width: 32, height: 32 };

            expect(collisionSystem.checkAABB(box1, box2)).toBe(true);
        });

        test('detects no collision when boxes do not overlap', () => {
            const box1 = { x: 0, y: 0, width: 32, height: 32 };
            const box2 = { x: 100, y: 100, width: 32, height: 32 };

            expect(collisionSystem.checkAABB(box1, box2)).toBe(false);
        });

        test('detects collision when boxes touch edges', () => {
            const box1 = { x: 0, y: 0, width: 32, height: 32 };
            const box2 = { x: 32, y: 0, width: 32, height: 32 };

            // Touching edges should not be considered collision
            expect(collisionSystem.checkAABB(box1, box2)).toBe(false);
        });
    });

    describe('Obstacle Management', () => {
        test('adds obstacles to the system', () => {
            const obstacle = new Entity(mockScene, 100, 100, null);

            collisionSystem.addObstacle(obstacle);

            expect(collisionSystem.obstacles).toContain(obstacle);
            expect(collisionSystem.obstacles.length).toBe(1);
        });

        test('removes obstacles from the system', () => {
            const obstacle = new Entity(mockScene, 100, 100, null);

            collisionSystem.addObstacle(obstacle);
            collisionSystem.removeObstacle(obstacle);

            expect(collisionSystem.obstacles).not.toContain(obstacle);
            expect(collisionSystem.obstacles.length).toBe(0);
        });

        test('clears all obstacles', () => {
            const obstacle1 = new Entity(mockScene, 100, 100, null);
            const obstacle2 = new Entity(mockScene, 200, 200, null);

            collisionSystem.addObstacle(obstacle1);
            collisionSystem.addObstacle(obstacle2);
            collisionSystem.clearObstacles();

            expect(collisionSystem.obstacles.length).toBe(0);
        });
    });

    describe('Entity Collision Checking', () => {
        test('detects collision between two entities', () => {
            const entity1 = new Entity(mockScene, 100, 100, null);
            const entity2 = new Entity(mockScene, 110, 110, null);

            expect(collisionSystem.checkCollision(entity1, entity2)).toBe(true);
        });

        test('detects no collision when entities are far apart', () => {
            const entity1 = new Entity(mockScene, 100, 100, null);
            const entity2 = new Entity(mockScene, 200, 200, null);

            expect(collisionSystem.checkCollision(entity1, entity2)).toBe(false);
        });
    });

    describe('Position-based Collision Checking', () => {
        test('detects collision at a specific position', () => {
            const entity = new Entity(mockScene, 100, 100, null);
            const obstacle = new Entity(mockScene, 120, 120, null);

            collisionSystem.addObstacle(obstacle);

            // Check if entity would collide at position near obstacle
            expect(collisionSystem.wouldCollideAt(entity, 120, 120)).toBe(true);
        });

        test('detects no collision at a safe position', () => {
            const entity = new Entity(mockScene, 100, 100, null);
            const obstacle = new Entity(mockScene, 200, 200, null);

            collisionSystem.addObstacle(obstacle);

            // Check if entity would collide at position far from obstacle
            expect(collisionSystem.wouldCollideAt(entity, 100, 100)).toBe(false);
        });
    });
});
