// DungeonScene - Dungeon gameplay

import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';
import { Obstacle } from '../entities/Obstacle.js';
import { Collectible } from '../entities/Collectible.js';
import { PushableBlock } from '../entities/PushableBlock.js';
import { Switch } from '../entities/Switch.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { CollectionSystem } from '../systems/CollectionSystem.js';
import { AnimationManager } from '../systems/AnimationManager.js';
import { RippleEffect } from '../systems/RippleEffect.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { HUD } from '../ui/HUD.js';

export class DungeonScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DungeonScene' });
        this.player = null;
        this.cursors = null;
        this.wasd = null;
        this.attackKey = null;
        this.rangedAttackKey = null;
        this.collisionSystem = null;
        this.collectionSystem = null;
        this.rippleEffect = null;
        this.animationManager = null;
        this.particleSystem = null;
        this.hud = null;
        this.obstacles = [];
        this.enemies = [];
        this.collectibles = [];
        this.pushableBlocks = [];
        this.switches = [];
        this.doors = [];
        this.projectiles = [];
        this.attackHitboxes = [];

        // Dungeon state
        this.worldConfig = null;
        this.dungeonId = null;
        this.dungeonData = null;
        this.currentRoom = null;
        this.currentRoomData = null;
        this.boss = null;

        // Room completion tracking
        this.roomObjectiveComplete = false;

        // Transition state
        this.isTransitioning = false;

        // Configuration
        this.ROOM_WIDTH = 800;
        this.ROOM_HEIGHT = 600;
        this.DOOR_SIZE = 60;
        this.EDGE_THRESHOLD = 20;
    }

    init(data) {
        // Get dungeon ID from scene data
        this.dungeonId = data.dungeonId || 1;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Get world configuration from registry
        this.worldConfig = this.registry.get('worldConfig');

        if (!this.worldConfig) {
            console.error('World configuration not found in registry');
            return;
        }

        // Load dungeon data from configuration
        this.dungeonData = this.worldConfig.getDungeonData(this.dungeonId);

        if (!this.dungeonData) {
            console.error(`Dungeon ${this.dungeonId} not found in configuration`);
            return;
        }

        console.log(`Loaded dungeon: ${this.dungeonData.name}`);

        // Play dungeon enter sound and start background music
        const audioManager = this.registry.get('audioManager');
        if (audioManager) {
            audioManager.playDungeonEnter();
            audioManager.playMusic(true);
        }

        // Initialize systems
        this.collisionSystem = new CollisionSystem(this);
        this.collectionSystem = new CollectionSystem(this, this.collisionSystem);
        this.rippleEffect = new RippleEffect(this);
        this.animationManager = new AnimationManager(this);
        this.particleSystem = new ParticleSystem(this);

        // Restore player state from registry or create new player
        const playerState = this.registry.get('playerState');
        if (playerState) {
            this.player = new Player(this, width / 2, height / 2);
            this.player.health = playerState.health;
            this.player.inventory = playerState.inventory;
            this.player.stats = playerState.stats;
        } else {
            this.player = new Player(this, width / 2, height / 2);
        }

        this.player.createSprite();

        // Initialize player in animation manager
        if (this.animationManager) {
            this.animationManager.initializeEntity(this.player, 'idle');
        }

        // Set up keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();

        // Set up WASD keys
        this.wasd = {
            W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };

        // Set up attack keys
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.rangedAttackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        // Handle attack key press
        this.attackKey.on('down', () => {
            if (this.player) {
                const attackHitbox = this.player.attack();
                if (attackHitbox) {
                    this.handleMeleeAttack(attackHitbox);
                }
            }
        });

        // Handle ranged attack key press
        this.rangedAttackKey.on('down', () => {
            if (this.player) {
                const projectile = this.player.rangedAttack();
                if (projectile) {
                    this.projectiles.push(projectile);
                }
            }
        });

        // Load first room
        this.loadRoom(1);

        // Create HUD
        this.hud = new HUD(this);
        this.hud.create(this.player);

        // Hide minimap in dungeon (only relevant for overworld)
        this.hud.hideMinimap();

        // Add exit key (ESC to return to overworld)
        const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        escKey.on('down', () => {
            this.exitDungeon();
        });
    }

    /**
     * Load a room from dungeon configuration
     * @param {number} roomId - Room ID to load
     * @param {string} entryDirection - Direction player entered from (optional)
     */
    loadRoom(roomId, entryDirection = null) {
        // Find room data
        this.currentRoomData = this.dungeonData.rooms.find(room => room.id === roomId);

        if (!this.currentRoomData) {
            console.error(`Room ${roomId} not found in dungeon ${this.dungeonId}`);
            return;
        }

        this.currentRoom = roomId;
        this.roomObjectiveComplete = false;

        console.log(`Loading room ${roomId} (${this.currentRoomData.type})`);

        // Clear existing entities
        this.clearRoom();

        // Render room
        this.renderRoomBackground();
        this.renderWalls();
        this.renderObstacles();
        this.renderDoors();
        this.renderEnemies();
        this.renderCollectibles();
        this.renderPushableBlocks();
        this.renderSwitches();
        this.renderBoss();

        // Position player based on entry direction
        if (this.player) {
            this.positionPlayerAtEntryDoor(entryDirection);
        }
    }

    /**
     * Position player at the appropriate door based on entry direction
     * @param {string} entryDirection - Direction player entered from (north, south, east, west)
     */
    positionPlayerAtEntryDoor(entryDirection) {
        const { width, height } = this.cameras.main;
        const doorOffset = 80; // Distance from edge to place player

        // Map entry direction to opposite exit direction
        const oppositeDirection = {
            north: 'south',
            south: 'north',
            east: 'west',
            west: 'east',
        };

        // Get the opposite direction (where player should appear)
        const exitDirection = entryDirection ? oppositeDirection[entryDirection] : null;

        // Position player at the opposite door
        if (exitDirection === 'north') {
            // Entered from south, appear at north door
            this.player.x = width / 2;
            this.player.y = doorOffset;
        } else if (exitDirection === 'south') {
            // Entered from north, appear at south door
            this.player.x = width / 2;
            this.player.y = height - doorOffset;
        } else if (exitDirection === 'east') {
            // Entered from west, appear at east door
            this.player.x = width - doorOffset;
            this.player.y = height / 2;
        } else if (exitDirection === 'west') {
            // Entered from east, appear at west door
            this.player.x = doorOffset;
            this.player.y = height / 2;
        } else {
            // No entry direction specified (first room), center player
            this.player.x = width / 2;
            this.player.y = height / 2;
        }

        // Update sprite position
        if (this.player.sprite) {
            this.player.sprite.x = this.player.x;
            this.player.sprite.y = this.player.y;
        }
    }

    /**
     * Clear all entities from current room
     */
    clearRoom() {
        // Destroy all obstacles
        this.obstacles.forEach(obstacle => {
            if (obstacle.sprite) {
                obstacle.sprite.destroy();
            }
        });
        this.obstacles = [];

        // Destroy all enemies
        this.enemies.forEach(enemy => {
            if (enemy.sprite) {
                enemy.sprite.destroy();
            }
        });
        this.enemies = [];

        // Destroy all collectibles
        this.collectibles.forEach(collectible => {
            if (collectible.sprite) {
                collectible.sprite.destroy();
            }
        });
        this.collectibles = [];

        // Destroy all pushable blocks
        this.pushableBlocks.forEach(block => {
            if (block.sprite) {
                block.sprite.destroy();
            }
        });
        this.pushableBlocks = [];

        // Destroy all switches
        this.switches.forEach(switchEntity => {
            if (switchEntity.sprite) {
                switchEntity.sprite.destroy();
            }
        });
        this.switches = [];

        // Destroy all doors
        this.doors.forEach(door => {
            if (door.sprite) {
                door.sprite.destroy();
            }
            if (door.label) {
                door.label.destroy();
            }
        });
        this.doors = [];

        // Destroy boss
        if (this.boss) {
            if (this.boss.sprite) {
                this.boss.sprite.destroy();
            }
            this.boss = null;
        }

        // Clear collision system
        if (this.collisionSystem) {
            this.collisionSystem.obstacles = [];
        }

        // Clear collection system
        if (this.collectionSystem) {
            this.collectionSystem.collectibles = [];
        }
    }

    /**
     * Render room background
     */
    renderRoomBackground() {
        const { width, height } = this.cameras.main;

        // Create dark dungeon background
        const background = this.add.rectangle(0, 0, width, height, 0x1a1a1a);
        background.setOrigin(0, 0);
        background.setDepth(-10);
    }

    /**
     * Render walls around the room
     */
    renderWalls() {
        const { width, height } = this.cameras.main;
        const wallThickness = 20;

        // Top wall
        const topWall = new Obstacle(this, width / 2, wallThickness / 2, width, wallThickness);
        topWall.createSprite();
        this.obstacles.push(topWall);
        this.collisionSystem.addObstacle(topWall);

        // Bottom wall
        const bottomWall = new Obstacle(
            this,
            width / 2,
            height - wallThickness / 2,
            width,
            wallThickness
        );
        bottomWall.createSprite();
        this.obstacles.push(bottomWall);
        this.collisionSystem.addObstacle(bottomWall);

        // Left wall
        const leftWall = new Obstacle(this, wallThickness / 2, height / 2, wallThickness, height);
        leftWall.createSprite();
        this.obstacles.push(leftWall);
        this.collisionSystem.addObstacle(leftWall);

        // Right wall
        const rightWall = new Obstacle(
            this,
            width - wallThickness / 2,
            height / 2,
            wallThickness,
            height
        );
        rightWall.createSprite();
        this.obstacles.push(rightWall);
        this.collisionSystem.addObstacle(rightWall);
    }

    /**
     * Render obstacles from room data
     */
    renderObstacles() {
        if (!this.currentRoomData.obstacles) return;

        this.currentRoomData.obstacles.forEach(obstacleData => {
            const obstacle = new Obstacle(
                this,
                obstacleData.x,
                obstacleData.y,
                obstacleData.width,
                obstacleData.height
            );
            obstacle.createSprite();
            this.obstacles.push(obstacle);
            this.collisionSystem.addObstacle(obstacle);
        });
    }

    /**
     * Render doors from room data
     */
    renderDoors() {
        if (!this.currentRoomData.doors) return;

        const { width, height } = this.cameras.main;

        this.currentRoomData.doors.forEach(doorData => {
            let doorX, doorY;

            // Position door based on direction
            switch (doorData.direction) {
                case 'north':
                    doorX = width / 2;
                    doorY = this.DOOR_SIZE / 2;
                    break;
                case 'south':
                    doorX = width / 2;
                    doorY = height - this.DOOR_SIZE / 2;
                    break;
                case 'east':
                    doorX = width - this.DOOR_SIZE / 2;
                    doorY = height / 2;
                    break;
                case 'west':
                    doorX = this.DOOR_SIZE / 2;
                    doorY = height / 2;
                    break;
            }

            // Create door visual
            const doorColor = doorData.locked ? 0xff0000 : 0x00ff00;
            const doorSprite = this.add.rectangle(
                doorX,
                doorY,
                this.DOOR_SIZE,
                this.DOOR_SIZE,
                doorColor,
                0.7
            );
            doorSprite.setDepth(5);

            // Add label
            const label = this.add.text(doorX, doorY, doorData.locked ? 'LOCKED' : 'OPEN', {
                fontSize: '10px',
                fill: '#ffffff',
                fontFamily: 'Arial',
            });
            label.setOrigin(0.5);
            label.setDepth(6);

            // Store door reference
            const door = {
                x: doorX,
                y: doorY,
                width: this.DOOR_SIZE,
                height: this.DOOR_SIZE,
                direction: doorData.direction,
                locked: doorData.locked,
                leadsTo: doorData.leadsTo,
                id: doorData.id || null,
                sprite: doorSprite,
                label: label,
            };

            this.doors.push(door);
        });
    }

    /**
     * Render enemies from room data
     */
    renderEnemies() {
        if (!this.currentRoomData.enemies) return;

        this.currentRoomData.enemies.forEach(enemyData => {
            // Get enemy type configuration
            const enemyConfig = this.worldConfig.getEnemyType(enemyData.type);

            if (!enemyConfig) {
                console.warn(`Enemy type not found: ${enemyData.type}`);
                return;
            }

            const enemy = new Enemy(this, enemyData.x, enemyData.y, enemyData.type, {
                health: enemyConfig.health,
                damage: enemyConfig.damage,
                speed: enemyConfig.speed,
                xp: enemyData.xp || enemyConfig.xp,
            });
            enemy.createSprite();
            enemy.setTarget(this.player);
            this.enemies.push(enemy);
        });
    }

    /**
     * Render collectibles from room data
     */
    renderCollectibles() {
        if (!this.currentRoomData.collectibles) return;

        this.currentRoomData.collectibles.forEach(collectibleData => {
            const collectible = new Collectible(
                this,
                collectibleData.x,
                collectibleData.y,
                collectibleData.type,
                { value: collectibleData.value }
            );
            collectible.createSprite();
            this.collectibles.push(collectible);
            this.collectionSystem.addCollectible(collectible);
        });
    }

    /**
     * Render pushable blocks from room data
     */
    renderPushableBlocks() {
        if (!this.currentRoomData.pushableBlocks) return;

        this.currentRoomData.pushableBlocks.forEach(blockData => {
            const block = new PushableBlock(
                this,
                blockData.x,
                blockData.y,
                blockData.width || 50,
                blockData.height || 50
            );
            block.createSprite();
            this.pushableBlocks.push(block);
        });
    }

    /**
     * Render switches from room data
     */
    renderSwitches() {
        if (!this.currentRoomData.switches) return;

        this.currentRoomData.switches.forEach(switchData => {
            const switchEntity = new Switch(this, switchData.x, switchData.y, switchData.activates);
            switchEntity.createSprite();
            this.switches.push(switchEntity);
        });
    }

    /**
     * Render boss if this is a boss room
     * Validates: Requirements 6.5, 7.1
     */
    renderBoss() {
        if (!this.currentRoomData.isBossRoom || !this.currentRoomData.boss) return;

        const bossData = this.currentRoomData.boss;

        // Create boss with Boss class (enhanced stats and unique attack patterns)
        this.boss = new Boss(this, bossData.x, bossData.y, bossData.type, {
            health: bossData.health,
            damage: bossData.damage,
            speed: bossData.speed || 60,
            attackCooldown: bossData.attackCooldown || 800,
            xpReward: bossData.xp,
            attackPattern: bossData.attackPattern || 'aggressive',
        });
        this.boss.createSprite();
        this.boss.setTarget(this.player);

        console.log(`Boss spawned: ${bossData.type} with ${this.boss.attackPattern} pattern`);
    }

    /**
     * Handle melee attack
     * @param {object} attackHitbox - Attack hitbox
     */
    handleMeleeAttack(attackHitbox) {
        // Store attack hitbox temporarily
        attackHitbox.lifetime = 100;
        attackHitbox.createdAt = Date.now();
        this.attackHitboxes.push(attackHitbox);

        // Visual feedback
        if (this.add && this.tweens) {
            const attackVisual = this.add.rectangle(
                attackHitbox.x + attackHitbox.width / 2,
                attackHitbox.y + attackHitbox.height / 2,
                attackHitbox.width,
                attackHitbox.height,
                0x790ecb,
                0.3
            );
            attackVisual.setDepth(20);

            this.tweens.add({
                targets: attackVisual,
                alpha: 0,
                duration: 100,
                onComplete: () => {
                    attackVisual.destroy();
                },
            });
        }

        // Check for hits
        this.checkAttackHits(attackHitbox);
    }

    /**
     * Check if attack hits enemies or boss
     * @param {object} attackHitbox - Attack hitbox
     */
    checkAttackHits(attackHitbox) {
        // Check regular enemies
        for (const enemy of this.enemies) {
            if (!enemy.active || enemy.isFriendly) {
                continue;
            }

            const enemyHitbox = enemy.getHitbox();

            if (this.collisionSystem.checkAABB(attackHitbox, enemyHitbox)) {
                enemy.takeDamage(attackHitbox.damage);

                // Create attack impact particle effect (Property 32, Requirements 10.1)
                if (this.particleSystem) {
                    this.particleSystem.createAttackImpactEffect(enemy.x, enemy.y);
                }

                if (enemy.health.current === 0) {
                    this.player.addXP(enemy.getXPReward());

                    if (this.hud) {
                        this.hud.update(this.player);
                    }
                }
            }
        }

        // Check boss
        if (this.boss && this.boss.active) {
            const bossHitbox = this.boss.getHitbox();

            if (this.collisionSystem.checkAABB(attackHitbox, bossHitbox)) {
                this.boss.takeDamage(attackHitbox.damage);

                // Create attack impact particle effect (Property 32, Requirements 10.1)
                if (this.particleSystem) {
                    this.particleSystem.createAttackImpactEffect(this.boss.x, this.boss.y);
                }

                if (this.boss.health.current === 0) {
                    this.handleBossDefeat();
                }
            }
        }
    }

    /**
     * Handle boss defeat and dungeon completion
     * Validates: Requirements 7.2, 7.3
     */
    handleBossDefeat() {
        console.log('Boss defeated!');

        // Award XP
        this.player.addXP(this.boss.getXPReward());

        // Mark dungeon as complete
        this.markDungeonComplete();

        // Increase max health (Property 11, Requirements 7.2)
        const healthIncrease = 2;
        this.player.health.max += healthIncrease;
        this.player.health.current = this.player.health.max;

        // Play completion sound using AudioManager (Requirements 7.3)
        const audioManager = this.registry.get('audioManager');
        if (audioManager) {
            audioManager.playDungeonComplete();
        }

        // Display completion message (Requirements 7.3)
        const { width, height } = this.cameras.main;
        const completedDungeons = this.getCompletedDungeons();
        const message = this.add.text(
            width / 2,
            height / 2,
            `${this.dungeonData.name} Complete!\nMax Health Increased!\nDungeons Completed: ${completedDungeons.length}/4\nPress ESC to exit`,
            {
                fontSize: '24px',
                fill: '#00ff00',
                fontFamily: 'Arial',
                align: 'center',
            }
        );
        message.setOrigin(0.5);
        message.setDepth(100);

        // Update HUD
        if (this.hud) {
            this.hud.update(this.player);
        }

        // Mark room objective as complete
        this.roomObjectiveComplete = true;
    }

    /**
     * Mark current dungeon as complete and check victory condition
     * Validates: Requirements 7.4
     */
    markDungeonComplete() {
        // Get completed dungeons from registry
        const completedDungeons = this.registry.get('completedDungeons') || [];

        // Add current dungeon if not already completed
        if (!completedDungeons.includes(this.dungeonId)) {
            completedDungeons.push(this.dungeonId);
            this.registry.set('completedDungeons', completedDungeons);
            console.log(`Dungeon ${this.dungeonId} marked as complete`);

            // Check victory condition (all 4 dungeons complete)
            if (completedDungeons.length >= 4) {
                this.triggerVictory();
            }
        }
    }

    /**
     * Trigger victory screen when all dungeons are complete
     * Validates: Requirements 7.4
     */
    triggerVictory() {
        console.log('All dungeons complete! Victory!');

        // Save player state
        this.registry.set('playerState', {
            health: this.player.health,
            inventory: this.player.inventory,
            stats: this.player.stats,
        });

        // Transition to victory screen after a short delay
        this.time.delayedCall(3000, () => {
            this.scene.start('GameOverScene', { victory: true });
        });
    }

    /**
     * Get list of completed dungeons
     * @returns {Array} Array of completed dungeon IDs
     */
    getCompletedDungeons() {
        return this.registry.get('completedDungeons') || [];
    }

    /**
     * Check projectile hits
     * @param {Projectile} projectile - Projectile to check
     */
    checkProjectileHits(projectile) {
        const projectileHitbox = projectile.getHitbox();

        // Check regular enemies
        for (const enemy of this.enemies) {
            if (!enemy.active || enemy.isFriendly) {
                continue;
            }

            const enemyHitbox = enemy.getHitbox();

            if (this.collisionSystem.checkAABB(projectileHitbox, enemyHitbox)) {
                enemy.takeDamage(projectile.damage);

                // Create attack impact particle effect (Property 32, Requirements 10.1)
                if (this.particleSystem) {
                    this.particleSystem.createAttackImpactEffect(enemy.x, enemy.y);
                }

                if (enemy.health.current === 0) {
                    this.player.addXP(enemy.getXPReward());

                    if (this.hud) {
                        this.hud.update(this.player);
                    }
                }

                projectile.onHitEnemy();
                break;
            }
        }

        // Check boss
        if (this.boss && this.boss.active) {
            const bossHitbox = this.boss.getHitbox();

            if (this.collisionSystem.checkAABB(projectileHitbox, bossHitbox)) {
                this.boss.takeDamage(projectile.damage);

                // Create attack impact particle effect (Property 32, Requirements 10.1)
                if (this.particleSystem) {
                    this.particleSystem.createAttackImpactEffect(this.boss.x, this.boss.y);
                }

                if (this.boss.health.current === 0) {
                    this.handleBossDefeat();
                }

                projectile.onHitEnemy();
            }
        }
    }

    /**
     * Check if player is pushing a block
     */
    checkBlockPushing() {
        if (!this.player || !this.player.isMoving) {
            return;
        }

        const playerHitbox = this.player.getHitbox();
        const playerIntended = this.player.getIntendedPosition();

        for (const block of this.pushableBlocks) {
            const blockHitbox = block.getHitbox();

            // Check if player would collide with block
            const intendedPlayerHitbox = {
                x: playerIntended.x - playerHitbox.width / 2,
                y: playerIntended.y - playerHitbox.height / 2,
                width: playerHitbox.width,
                height: playerHitbox.height,
            };

            if (this.collisionSystem.checkAABB(intendedPlayerHitbox, blockHitbox)) {
                // Player is pushing this block
                const pushDistance = this.player.stats.speed * (16.67 / 1000); // Approximate delta for one frame

                // Calculate push direction based on player facing
                block.push(this.player.facing, pushDistance);

                // Check if block can be pushed (no collision with obstacles or other blocks)
                const blockIntended = block.getIntendedPosition();
                const intendedBlockHitbox = {
                    x: blockIntended.x - block.hitbox.width / 2,
                    y: blockIntended.y - block.hitbox.height / 2,
                    width: block.hitbox.width,
                    height: block.hitbox.height,
                };

                // Check collision with obstacles
                let canPush = true;
                for (const obstacle of this.obstacles) {
                    const obstacleHitbox = obstacle.getHitbox();
                    if (this.collisionSystem.checkAABB(intendedBlockHitbox, obstacleHitbox)) {
                        canPush = false;
                        break;
                    }
                }

                // Check collision with other blocks
                if (canPush) {
                    for (const otherBlock of this.pushableBlocks) {
                        if (otherBlock === block) continue;

                        const otherBlockHitbox = otherBlock.getHitbox();
                        if (this.collisionSystem.checkAABB(intendedBlockHitbox, otherBlockHitbox)) {
                            canPush = false;
                            break;
                        }
                    }
                }

                // Apply or cancel push
                if (canPush) {
                    block.applyPush();
                    // Player can also move
                    this.player.applyMovement();
                } else {
                    block.cancelPush();
                    // Player cannot move
                    this.player.cancelMovement();
                }

                return; // Only push one block at a time
            }
        }
    }

    /**
     * Check if blocks are on switches
     */
    checkSwitchActivation() {
        // Check each switch
        for (const switchEntity of this.switches) {
            let blockOnSwitch = false;

            // Check if any block is on this switch
            for (const block of this.pushableBlocks) {
                const switchHitbox = switchEntity.getHitbox();

                // Check if block center is on switch
                const blockCenterX = block.x;
                const blockCenterY = block.y;

                const switchLeft = switchHitbox.x;
                const switchRight = switchHitbox.x + switchHitbox.width;
                const switchTop = switchHitbox.y;
                const switchBottom = switchHitbox.y + switchHitbox.height;

                if (
                    blockCenterX >= switchLeft &&
                    blockCenterX <= switchRight &&
                    blockCenterY >= switchTop &&
                    blockCenterY <= switchBottom
                ) {
                    blockOnSwitch = true;
                    break;
                }
            }

            // Update switch state
            if (blockOnSwitch && !switchEntity.isActivated) {
                switchEntity.activate();
                console.log(`Switch activated: ${switchEntity.activates}`);

                // Trigger mechanism (unlock door)
                if (switchEntity.activates) {
                    this.unlockDoor(switchEntity.activates);
                }
            } else if (!blockOnSwitch && switchEntity.isActivated) {
                switchEntity.deactivate();
                console.log(`Switch deactivated: ${switchEntity.activates}`);

                // Lock door again
                if (switchEntity.activates) {
                    this.lockDoor(switchEntity.activates);
                }
            }
        }
    }

    /**
     * Unlock a door by ID
     * @param {string} doorId - Door ID to unlock
     */
    unlockDoor(doorId) {
        const door = this.doors.find(d => d.id === doorId);
        if (door && door.locked) {
            door.locked = false;

            // Update door visual
            if (door.sprite) {
                door.sprite.setFillStyle(0x00ff00, 0.7);
            }
            if (door.label) {
                door.label.setText('OPEN');
            }

            console.log(`Door unlocked: ${doorId}`);
        }
    }

    /**
     * Lock a door by ID
     * @param {string} doorId - Door ID to lock
     */
    lockDoor(doorId) {
        const door = this.doors.find(d => d.id === doorId);
        if (door && !door.locked) {
            door.locked = true;

            // Update door visual
            if (door.sprite) {
                door.sprite.setFillStyle(0xff0000, 0.7);
            }
            if (door.label) {
                door.label.setText('LOCKED');
            }

            console.log(`Door locked: ${doorId}`);
        }
    }

    /**
     * Check room completion objective
     */
    checkRoomCompletion() {
        if (this.roomObjectiveComplete) {
            return;
        }

        const objective = this.currentRoomData.completionObjective;

        switch (objective) {
            case 'defeat_all_enemies': {
                // Check if all enemies are defeated
                const activeEnemies = this.enemies.filter(
                    enemy => enemy.active && !enemy.isFriendly
                );
                if (activeEnemies.length === 0) {
                    this.completeRoom();
                }
                break;
            }

            case 'activate_all_switches': {
                // Check if all switches are activated
                const allActivated = this.switches.every(switchEntity => switchEntity.isActivated);
                if (allActivated && this.switches.length > 0) {
                    this.completeRoom();
                }
                break;
            }

            case 'defeat_boss':
                // Boss defeat is handled separately in handleBossDefeat()
                break;

            default:
                console.warn(`Unknown completion objective: ${objective}`);
        }
    }

    /**
     * Complete the current room
     */
    completeRoom() {
        if (this.roomObjectiveComplete) {
            return;
        }

        console.log('Room objective complete!');
        this.roomObjectiveComplete = true;

        // Unlock all locked doors in the room
        this.doors.forEach(door => {
            if (door.locked) {
                door.locked = false;

                // Update door visual
                if (door.sprite) {
                    door.sprite.setFillStyle(0x00ff00, 0.7);
                }
                if (door.label) {
                    door.label.setText('OPEN');
                }
            }
        });

        // Display completion message
        const { width } = this.cameras.main;
        const message = this.add.text(width / 2, 50, 'Room Complete!', {
            fontSize: '20px',
            fill: '#00ff00',
            fontFamily: 'Arial',
        });
        message.setOrigin(0.5);
        message.setDepth(100);

        // Fade out message after 2 seconds
        this.tweens.add({
            targets: message,
            alpha: 0,
            duration: 1000,
            delay: 1000,
            onComplete: () => {
                message.destroy();
            },
        });
    }

    /**
     * Check if player is colliding with a door
     */
    checkDoorCollision() {
        if (!this.player || this.isTransitioning) return;

        const playerHitbox = this.player.getHitbox();

        for (const door of this.doors) {
            // Skip locked doors
            if (door.locked) {
                continue;
            }

            const doorHitbox = {
                x: door.x - door.width / 2,
                y: door.y - door.height / 2,
                width: door.width,
                height: door.height,
            };

            // Check AABB collision
            if (this.collisionSystem.checkAABB(playerHitbox, doorHitbox)) {
                this.transitionToRoom(door.leadsTo, door.direction);
                return;
            }
        }
    }

    /**
     * Transition to a new room
     * @param {number} roomId - ID of room to transition to
     * @param {string} entryDirection - Direction player entered from (north, south, east, west)
     */
    transitionToRoom(roomId, entryDirection) {
        if (this.isTransitioning) return;

        console.log(`Transitioning to room ${roomId} from ${entryDirection} door`);

        // Set transition flag to prevent multiple transitions
        this.isTransitioning = true;

        // Fade out effect
        this.cameras.main.fadeOut(300, 0, 0, 0);

        this.cameras.main.once('camerafadeoutcomplete', () => {
            // Load new room with entry direction
            this.loadRoom(roomId, entryDirection);

            // Fade in
            this.cameras.main.fadeIn(300, 0, 0, 0);

            // Clear transition flag after fade in completes
            this.cameras.main.once('camerafadeincomplete', () => {
                this.isTransitioning = false;
            });
        });
    }

    /**
     * Exit dungeon and return to overworld
     */
    exitDungeon() {
        console.log('Exiting dungeon');

        // Save player state
        this.registry.set('playerState', {
            health: this.player.health,
            inventory: this.player.inventory,
            stats: this.player.stats,
        });

        // Return to overworld
        this.scene.start('OverworldScene');
    }

    update(time, delta) {
        if (this.player) {
            // Handle player input
            this.player.handleInput(this.cursors, this.wasd, delta);

            // Check collision before applying movement
            if (this.player.isMoving) {
                // First check if player is pushing a block
                this.checkBlockPushing();

                // If player hasn't moved yet (not pushing), check normal collision
                if (this.player.intendedX !== undefined || this.player.intendedY !== undefined) {
                    if (this.collisionSystem.checkIntendedCollision(this.player)) {
                        this.player.cancelMovement();
                    } else {
                        this.player.applyMovement();
                    }
                }
            }

            // Check for door collision (room transitions)
            this.checkDoorCollision();

            // Update player
            this.player.update(delta);

            // Update HUD
            if (this.hud) {
                this.hud.update(this.player);
            }
        }

        // Update enemies
        for (const enemy of this.enemies) {
            if (enemy.active) {
                enemy.update(delta);
            }
        }

        // Update boss
        if (this.boss && this.boss.active) {
            this.boss.update(delta);
        }

        // Update projectiles
        for (const projectile of this.projectiles) {
            if (projectile.active) {
                projectile.update(delta);

                if (!projectile.returning) {
                    this.checkProjectileHits(projectile);
                }
            }
        }

        // Clean up old attack hitboxes
        const now = Date.now();
        this.attackHitboxes = this.attackHitboxes.filter(hitbox => {
            return now - hitbox.createdAt < hitbox.lifetime;
        });

        // Clean up inactive enemies
        this.enemies = this.enemies.filter(enemy => enemy.active);

        // Clean up inactive projectiles
        this.projectiles = this.projectiles.filter(projectile => projectile.active);

        // Check switch activation
        this.checkSwitchActivation();

        // Update particle system
        if (this.particleSystem) {
            this.particleSystem.update(delta);
        }

        // Check room completion
        this.checkRoomCompletion();

        // Update systems
        if (this.collisionSystem) {
            this.collisionSystem.update();
        }

        if (this.collectionSystem) {
            this.collectionSystem.update(this.player);
        }

        if (this.rippleEffect) {
            this.rippleEffect.update(delta);
        }

        if (this.animationManager) {
            this.animationManager.update();
        }
    }
}
