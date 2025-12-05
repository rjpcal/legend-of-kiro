// OverworldScene - Main overworld gameplay

import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Obstacle } from '../entities/Obstacle.js';
import { Collectible } from '../entities/Collectible.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { CollectionSystem } from '../systems/CollectionSystem.js';
import { AnimationManager } from '../systems/AnimationManager.js';
import { RippleEffect } from '../systems/RippleEffect.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { HUD } from '../ui/HUD.js';

export class OverworldScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OverworldScene' });
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
        this.projectiles = [];
        this.attackHitboxes = [];

        // Screen management
        this.worldConfig = null;
        this.currentScreen = { x: 0, y: 0 };
        this.screenData = null;

        // Transition state
        this.isTransitioning = false;
        this.transitionDirection = null;

        // Entrance cooldown (prevents immediate re-entry after exiting store/dungeon)
        this.entranceCooldown = 0;
        this.ENTRANCE_COOLDOWN_TIME = 500; // milliseconds

        // Configuration
        this.SCREEN_WIDTH = 800;
        this.SCREEN_HEIGHT = 600;
        this.EDGE_THRESHOLD = 20; // Distance from edge to trigger transition
    }

    create() {
        const { width, height } = this.cameras.main;

        // Get world configuration from registry
        this.worldConfig = this.registry.get('worldConfig');

        if (!this.worldConfig) {
            console.error('World configuration not found in registry');
            return;
        }

        // Start background music
        const audioManager = this.registry.get('audioManager');
        if (audioManager) {
            audioManager.playMusic(true);
        }

        // Initialize systems
        this.collisionSystem = new CollisionSystem(this);
        this.collectionSystem = new CollectionSystem(this, this.collisionSystem);
        this.rippleEffect = new RippleEffect(this);
        this.animationManager = new AnimationManager(this);
        this.particleSystem = new ParticleSystem(this);

        // Create player at center of screen (default position)
        this.player = new Player(this, width / 2, height / 2);

        // Restore player state from registry if it exists
        const playerState = this.registry.get('playerState');
        if (playerState) {
            this.player.health = playerState.health;
            this.player.inventory = playerState.inventory;
            this.player.stats = playerState.stats;

            // Restore screen position if returning from dungeon or store
            if (playerState.returnScreen) {
                this.currentScreen.x = playerState.returnScreen.x;
                this.currentScreen.y = playerState.returnScreen.y;
                console.log(
                    `Returning to screen (${this.currentScreen.x}, ${this.currentScreen.y})`
                );
            }

            // Restore local position if returning from store or dungeon
            if (playerState.returnPosition) {
                this.player.x = playerState.returnPosition.x;
                this.player.y = playerState.returnPosition.y;
                console.log(`Restoring player position (${this.player.x}, ${this.player.y})`);

                // Set entrance cooldown to prevent immediate re-entry
                this.entranceCooldown = this.ENTRANCE_COOLDOWN_TIME;
            }

            console.log('Restored player state from registry');
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
            if (this.player && !this.isTransitioning) {
                const attackHitbox = this.player.attack();
                if (attackHitbox) {
                    this.handleMeleeAttack(attackHitbox);
                }
            }
        });

        // Handle ranged attack key press
        this.rangedAttackKey.on('down', () => {
            if (this.player && !this.isTransitioning) {
                const projectile = this.player.rangedAttack();
                if (projectile) {
                    this.projectiles.push(projectile);
                }
            }
        });

        // Load initial screen from configuration
        this.loadScreen(this.currentScreen.x, this.currentScreen.y);

        // Create HUD with debug mode enabled
        this.hud = new HUD(this, {
            debugMode: true, // Enable debug mode for development
            onMinimapTeleport: (gridX, gridY) => this.handleMinimapTeleport(gridX, gridY),
        });
        this.hud.create(this.player);

        // Update minimap to show current position
        this.hud.updateMinimapPosition(this.currentScreen.x, this.currentScreen.y);

        // Mark starting position as visited on minimap
        this.hud.markMinimapVisited(this.currentScreen.x, this.currentScreen.y);

        // Mark dungeon entrances on minimap
        this.markDungeonEntrancesOnMinimap();
    }

    /**
     * Load a screen from configuration
     * @param {number} x - Screen x coordinate
     * @param {number} y - Screen y coordinate
     */
    loadScreen(x, y) {
        // Get screen data from configuration
        this.screenData = this.worldConfig.getOverworldScreen(x, y);

        if (!this.screenData) {
            console.warn(`No screen data found for (${x}, ${y}), using empty screen`);
            this.screenData = {
                x: x,
                y: y,
                terrain: 'grass',
                obstacles: [],
                enemies: [],
                collectibles: [],
                dungeonEntrance: null,
                storeEntrance: null,
            };
        }

        // Update current screen position
        this.currentScreen.x = x;
        this.currentScreen.y = y;

        // Clear existing entities
        this.clearScreen();

        // Render screen
        this.renderTerrain();
        this.renderObstacles();
        this.renderEnemies();
        this.renderCollectibles();
        this.renderDungeonEntrance();
        this.renderStoreEntrance();

        console.log(`Loaded screen (${x}, ${y})`);
    }

    /**
     * Clear all entities from current screen
     */
    clearScreen() {
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

        // Clear dungeon entrance marker
        if (this.dungeonEntranceMarker) {
            if (this.dungeonEntranceMarker.sprite) {
                this.dungeonEntranceMarker.sprite.destroy();
            }
            if (this.dungeonEntranceMarker.label) {
                this.dungeonEntranceMarker.label.destroy();
            }
            this.dungeonEntranceMarker = null;
        }

        // Clear store entrance marker
        if (this.storeEntranceMarker) {
            if (this.storeEntranceMarker.sprite) {
                this.storeEntranceMarker.sprite.destroy();
            }
            if (this.storeEntranceMarker.label) {
                this.storeEntranceMarker.label.destroy();
            }
            this.storeEntranceMarker = null;
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
     * Render terrain for current screen
     */
    renderTerrain() {
        const { width, height } = this.cameras.main;

        // Create terrain background based on terrain type
        const terrainColors = {
            grass: 0x2d5016,
            stone: 0x4a4a4a,
            sand: 0xc2b280,
            water: 0x1e3a8a,
        };

        const color = terrainColors[this.screenData.terrain] || terrainColors['grass'];

        // Create background rectangle
        const terrain = this.add.rectangle(0, 0, width, height, color);
        terrain.setOrigin(0, 0);
        terrain.setDepth(-10);
    }

    /**
     * Render obstacles from screen data
     */
    renderObstacles() {
        if (!this.screenData.obstacles) return;

        this.screenData.obstacles.forEach(obstacleData => {
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
     * Render enemies from screen data
     */
    renderEnemies() {
        if (!this.screenData.enemies) return;

        this.screenData.enemies.forEach(enemyData => {
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
     * Render collectibles from screen data
     */
    renderCollectibles() {
        if (!this.screenData.collectibles) return;

        this.screenData.collectibles.forEach(collectibleData => {
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
     * Render dungeon entrance if present
     */
    renderDungeonEntrance() {
        if (!this.screenData.dungeonEntrance) return;

        const entrance = this.screenData.dungeonEntrance;

        // Create visual marker for dungeon entrance
        const marker = this.add.rectangle(entrance.x, entrance.y, 60, 60, 0x790ecb, 0.7);
        marker.setDepth(5);

        // Add text label
        const label = this.add.text(entrance.x, entrance.y, 'DUNGEON', {
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Arial',
        });
        label.setOrigin(0.5);
        label.setDepth(6);

        // Store reference for collision detection
        this.dungeonEntranceMarker = {
            x: entrance.x,
            y: entrance.y,
            width: 60,
            height: 60,
            dungeonId: entrance.id,
            sprite: marker,
            label: label,
        };
    }

    /**
     * Render store entrance if present
     */
    renderStoreEntrance() {
        if (!this.screenData.storeEntrance) return;

        const entrance = this.screenData.storeEntrance;

        // Create visual marker for store entrance
        const marker = this.add.rectangle(entrance.x, entrance.y, 60, 60, 0xffd700, 0.7);
        marker.setDepth(5);

        // Add text label
        const label = this.add.text(entrance.x, entrance.y, 'STORE', {
            fontSize: '12px',
            fill: '#000000',
            fontFamily: 'Arial',
        });
        label.setOrigin(0.5);
        label.setDepth(6);

        // Store reference for collision detection
        this.storeEntranceMarker = {
            x: entrance.x,
            y: entrance.y,
            width: 60,
            height: 60,
            storeId: entrance.id,
            sprite: marker,
            label: label,
        };
    }

    /**
     * Mark all dungeon entrances on minimap
     */
    markDungeonEntrancesOnMinimap() {
        if (!this.worldConfig || !this.hud) return;

        const screens = this.worldConfig.getAllScreens();
        screens.forEach(screen => {
            if (screen.dungeonEntrance) {
                this.hud.markMinimapDungeon(screen.x, screen.y);
            }
        });
    }

    /**
     * Handle minimap teleport in debug mode
     * @param {number} gridX - Target grid X coordinate
     * @param {number} gridY - Target grid Y coordinate
     */
    handleMinimapTeleport(gridX, gridY) {
        if (this.isTransitioning) return;

        console.log(`[DEBUG] Teleporting to screen (${gridX}, ${gridY})`);

        // Check if target screen exists
        const targetScreen = this.worldConfig.getOverworldScreen(gridX, gridY);
        if (!targetScreen) {
            console.warn(`[DEBUG] No screen at (${gridX}, ${gridY})`);
            return;
        }

        // Set transition flag
        this.isTransitioning = true;

        // Fade out
        this.cameras.main.fadeOut(200, 0, 0, 0);

        this.cameras.main.once('camerafadeoutcomplete', () => {
            // Load new screen
            this.loadScreen(gridX, gridY);

            // Update minimap
            if (this.hud) {
                this.hud.updateMinimapPosition(gridX, gridY);
                this.hud.markMinimapVisited(gridX, gridY);
            }

            // Center player on new screen
            const { width, height } = this.cameras.main;
            this.player.x = width / 2;
            this.player.y = height / 2;
            if (this.player.sprite) {
                this.player.sprite.x = this.player.x;
                this.player.sprite.y = this.player.y;
            }

            // Fade in
            this.cameras.main.fadeIn(200, 0, 0, 0);

            this.cameras.main.once('camerafadeincomplete', () => {
                this.isTransitioning = false;
            });
        });
    }

    /**
     * Create test collectibles for collection testing
     */
    createTestCollectibles() {
        const { width, height } = this.cameras.main;

        // Create some test collectibles
        const collectibleData = [
            { x: width / 2 + 50, y: height / 2 - 100, type: 'coin', value: 5 },
            { x: width / 2 - 50, y: height / 2 - 100, type: 'coin', value: 10 },
            { x: width / 2, y: height / 2 + 150, type: 'health', value: 2 },
            {
                x: width / 2 + 200,
                y: height / 2,
                type: 'weapon',
                config: { name: 'Iron Sword', damage: 3 },
            },
            {
                x: width / 2 - 200,
                y: height / 2,
                type: 'armor',
                config: { name: 'Leather Armor', defense: 2 },
            },
        ];

        for (const data of collectibleData) {
            const collectible = new Collectible(
                this,
                data.x,
                data.y,
                data.type,
                data.config || { value: data.value }
            );
            collectible.createSprite();
            this.collectibles.push(collectible);
            this.collectionSystem.addCollectible(collectible);
        }
    }

    /**
     * Create test obstacles for collision testing
     */
    createTestObstacles() {
        const { width, height } = this.cameras.main;

        // Create a few obstacles around the screen
        const obstaclePositions = [
            { x: width / 2, y: height / 2 - 100, w: 64, h: 64 },
            { x: width / 2 - 150, y: height / 2, w: 48, h: 48 },
            { x: width / 2 + 150, y: height / 2, w: 48, h: 48 },
            { x: width / 2, y: height / 2 + 100, w: 80, h: 32 },
        ];

        for (const pos of obstaclePositions) {
            const obstacle = new Obstacle(this, pos.x, pos.y, pos.w, pos.h);
            obstacle.createSprite();
            this.obstacles.push(obstacle);
            this.collisionSystem.addObstacle(obstacle);
        }
    }

    /**
     * Create test enemies for combat testing
     */
    createTestEnemies() {
        const { width, height } = this.cameras.main;

        // Create a few test enemies
        const enemyPositions = [
            { x: width / 2 + 100, y: height / 2 - 50 },
            { x: width / 2 - 100, y: height / 2 + 50 },
        ];

        for (const pos of enemyPositions) {
            const enemy = new Enemy(this, pos.x, pos.y, 'zombie', {
                health: 3,
                damage: 1,
                speed: 30,
            });
            enemy.createSprite();
            enemy.setTarget(this.player);
            this.enemies.push(enemy);
        }
    }

    /**
     * Handle melee attack
     * @param {object} attackHitbox - Attack hitbox with x, y, width, height, damage
     */
    handleMeleeAttack(attackHitbox) {
        // Store attack hitbox temporarily for collision detection
        attackHitbox.lifetime = 100; // milliseconds
        attackHitbox.createdAt = Date.now();
        this.attackHitboxes.push(attackHitbox);

        // Visual feedback for attack (optional - can be replaced with animation)
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

            // Fade out attack visual
            this.tweens.add({
                targets: attackVisual,
                alpha: 0,
                duration: 100,
                onComplete: () => {
                    attackVisual.destroy();
                },
            });
        }

        // Check for hits on enemies
        this.checkAttackHits(attackHitbox);
    }

    /**
     * Check if attack hitbox hits any enemies
     * @param {object} attackHitbox - Attack hitbox
     */
    checkAttackHits(attackHitbox) {
        for (const enemy of this.enemies) {
            if (!enemy.active || enemy.isFriendly) {
                continue;
            }

            const enemyHitbox = enemy.getHitbox();

            // Check AABB collision
            if (this.collisionSystem.checkAABB(attackHitbox, enemyHitbox)) {
                // Hit detected - apply damage
                enemy.takeDamage(attackHitbox.damage);

                // Create attack impact particle effect (Property 32, Requirements 10.1)
                if (this.particleSystem) {
                    this.particleSystem.createAttackImpactEffect(enemy.x, enemy.y);
                }

                // Award XP if enemy was defeated (Property 13, Requirements 4.3)
                if (enemy.health.current === 0) {
                    const leveledUp = this.player.addXP(enemy.getXPReward());

                    // Update HUD to reflect XP and potential level up
                    if (this.hud) {
                        this.hud.update(this.player);
                    }
                }
            }
        }
    }

    /**
     * Check if player is at screen edge
     * @returns {string|null} Direction of edge ('up', 'down', 'left', 'right') or null
     */
    checkScreenEdge() {
        if (!this.player) return null;

        const { x, y } = this.player;
        const threshold = this.EDGE_THRESHOLD;

        // Check each edge
        if (x < threshold) {
            return 'left';
        } else if (x > this.SCREEN_WIDTH - threshold) {
            return 'right';
        } else if (y < threshold) {
            return 'up';
        } else if (y > this.SCREEN_HEIGHT - threshold) {
            return 'down';
        }

        return null;
    }

    /**
     * Initiate screen transition in a direction
     * @param {string} direction - Direction to transition ('up', 'down', 'left', 'right')
     */
    initiateScreenTransition(direction) {
        // Calculate new screen coordinates
        let newX = this.currentScreen.x;
        let newY = this.currentScreen.y;

        switch (direction) {
            case 'up':
                newY -= 1;
                break;
            case 'down':
                newY += 1;
                break;
            case 'left':
                newX -= 1;
                break;
            case 'right':
                newX += 1;
                break;
        }

        // Check if new screen exists
        const worldSize = this.worldConfig.getOverworldSize();
        if (newX < 0 || newX >= worldSize.width || newY < 0 || newY >= worldSize.height) {
            // Out of bounds - prevent movement
            this.player.cancelMovement();
            return;
        }

        // Check if screen exists in configuration
        const newScreenData = this.worldConfig.getOverworldScreen(newX, newY);
        if (!newScreenData) {
            // Screen doesn't exist - prevent movement
            this.player.cancelMovement();
            return;
        }

        // Start transition
        this.isTransitioning = true;
        this.transitionDirection = direction;

        // Perform smooth scrolling transition
        this.performScreenTransition(newX, newY, direction);
    }

    /**
     * Perform smooth scrolling screen transition
     * @param {number} newX - New screen x coordinate
     * @param {number} newY - New screen y coordinate
     * @param {string} direction - Transition direction
     */
    performScreenTransition(newX, newY, direction) {
        // Disable player input during transition
        const originalPlayerPos = { x: this.player.x, y: this.player.y };

        // Calculate camera scroll distance
        let scrollX = 0;
        let scrollY = 0;

        switch (direction) {
            case 'up':
                scrollY = -this.SCREEN_HEIGHT;
                break;
            case 'down':
                scrollY = this.SCREEN_HEIGHT;
                break;
            case 'left':
                scrollX = -this.SCREEN_WIDTH;
                break;
            case 'right':
                scrollX = this.SCREEN_WIDTH;
                break;
        }

        // Create camera scroll tween
        this.cameras.main.scrollX = 0;
        this.cameras.main.scrollY = 0;

        this.tweens.add({
            targets: this.cameras.main,
            scrollX: scrollX,
            scrollY: scrollY,
            duration: 500,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                // Reset camera
                this.cameras.main.scrollX = 0;
                this.cameras.main.scrollY = 0;

                // Load new screen
                this.loadScreen(newX, newY);

                // Position player on opposite edge of new screen
                this.positionPlayerAfterTransition(direction);

                // Update minimap
                if (this.hud) {
                    this.hud.updateMinimapPosition(newX, newY);
                    this.hud.markMinimapVisited(newX, newY);
                }

                // Re-enable player input
                this.isTransitioning = false;
                this.transitionDirection = null;
            },
        });
    }

    /**
     * Position player on opposite edge after screen transition
     * @param {string} direction - Direction player came from
     */
    positionPlayerAfterTransition(direction) {
        const centerX = this.SCREEN_WIDTH / 2;
        const centerY = this.SCREEN_HEIGHT / 2;
        const margin = this.EDGE_THRESHOLD + 10;

        switch (direction) {
            case 'up':
                this.player.x = centerX;
                this.player.y = this.SCREEN_HEIGHT - margin;
                break;
            case 'down':
                this.player.x = centerX;
                this.player.y = margin;
                break;
            case 'left':
                this.player.x = this.SCREEN_WIDTH - margin;
                this.player.y = centerY;
                break;
            case 'right':
                this.player.x = margin;
                this.player.y = centerY;
                break;
        }

        // Update sprite position
        if (this.player.sprite) {
            this.player.sprite.setPosition(this.player.x, this.player.y);
        }
    }

    /**
     * Check if player is colliding with dungeon entrance
     */
    checkDungeonEntrance() {
        if (!this.dungeonEntranceMarker || !this.player) return;

        // Don't check entrance collision during cooldown
        if (this.entranceCooldown > 0) return;

        const playerHitbox = this.player.getHitbox();
        const entranceHitbox = {
            x: this.dungeonEntranceMarker.x - this.dungeonEntranceMarker.width / 2,
            y: this.dungeonEntranceMarker.y - this.dungeonEntranceMarker.height / 2,
            width: this.dungeonEntranceMarker.width,
            height: this.dungeonEntranceMarker.height,
        };

        // Check AABB collision
        if (this.collisionSystem.checkAABB(playerHitbox, entranceHitbox)) {
            this.enterDungeon(this.dungeonEntranceMarker.dungeonId);
        }
    }

    /**
     * Enter a dungeon
     * @param {number} dungeonId - ID of dungeon to enter
     */
    enterDungeon(dungeonId) {
        console.log(`Entering dungeon ${dungeonId}`);

        // Play dungeon entrance sound if available
        if (this.sound && this.sound.get && this.sound.get('dungeon_enter')) {
            this.sound.play('dungeon_enter');
        }

        // Store current player state in registry for when they return
        this.registry.set('playerState', {
            health: this.player.health,
            inventory: this.player.inventory,
            stats: this.player.stats,
            returnScreen: { x: this.currentScreen.x, y: this.currentScreen.y },
            returnPosition: { x: this.player.x, y: this.player.y },
        });

        // Transition to dungeon scene
        this.scene.start('DungeonScene', { dungeonId: dungeonId });
    }

    /**
     * Check if player is colliding with store entrance
     */
    checkStoreEntrance() {
        if (!this.storeEntranceMarker || !this.player) return;

        // Don't check entrance collision during cooldown
        if (this.entranceCooldown > 0) return;

        const playerHitbox = this.player.getHitbox();
        const entranceHitbox = {
            x: this.storeEntranceMarker.x - this.storeEntranceMarker.width / 2,
            y: this.storeEntranceMarker.y - this.storeEntranceMarker.height / 2,
            width: this.storeEntranceMarker.width,
            height: this.storeEntranceMarker.height,
        };

        // Check AABB collision
        if (this.collisionSystem.checkAABB(playerHitbox, entranceHitbox)) {
            this.enterStore(this.storeEntranceMarker.storeId);
        }
    }

    /**
     * Enter a store
     * @param {number} storeId - ID of store to enter
     */
    enterStore(storeId) {
        console.log(`Entering store ${storeId}`);

        // Store current player state in registry including local position
        this.registry.set('playerState', {
            health: this.player.health,
            inventory: this.player.inventory,
            stats: this.player.stats,
            returnScreen: { x: this.currentScreen.x, y: this.currentScreen.y },
            returnPosition: { x: this.player.x, y: this.player.y },
        });

        // Transition to store scene
        this.scene.start('StoreScene', { storeId: storeId });
    }

    /**
     * Check if projectile hits any enemies
     * @param {Projectile} projectile - Projectile to check
     */
    checkProjectileHits(projectile) {
        const projectileHitbox = projectile.getHitbox();

        for (const enemy of this.enemies) {
            if (!enemy.active || enemy.isFriendly) {
                continue;
            }

            const enemyHitbox = enemy.getHitbox();

            // Check AABB collision
            if (this.collisionSystem.checkAABB(projectileHitbox, enemyHitbox)) {
                // Hit detected - apply damage
                enemy.takeDamage(projectile.damage);

                // Create attack impact particle effect (Property 32, Requirements 10.1)
                if (this.particleSystem) {
                    this.particleSystem.createAttackImpactEffect(enemy.x, enemy.y);
                }

                // Award XP if enemy was defeated (Property 13, Requirements 4.3)
                if (enemy.health.current === 0) {
                    const leveledUp = this.player.addXP(enemy.getXPReward());

                    // Update HUD to reflect XP and potential level up
                    if (this.hud) {
                        this.hud.update(this.player);
                    }
                }

                // Projectile starts returning after hit
                projectile.onHitEnemy();

                // Only hit one enemy per frame
                break;
            }
        }
    }

    update(time, delta) {
        // Decrement entrance cooldown
        if (this.entranceCooldown > 0) {
            this.entranceCooldown -= delta;
            if (this.entranceCooldown < 0) {
                this.entranceCooldown = 0;
            }
        }

        if (this.player && !this.isTransitioning) {
            // Handle player input
            this.player.handleInput(this.cursors, this.wasd, delta);

            // Check for screen edge transitions
            const edgeDirection = this.checkScreenEdge();
            if (edgeDirection) {
                this.initiateScreenTransition(edgeDirection);
                return; // Skip rest of update during transition
            }

            // Check collision before applying movement
            if (this.player.isMoving) {
                // Check if intended movement would cause collision
                if (this.collisionSystem.checkIntendedCollision(this.player)) {
                    // Cancel movement if collision detected
                    this.player.cancelMovement();
                } else {
                    // Apply movement if no collision
                    this.player.applyMovement();
                }
            }

            // Check for dungeon entrance collision
            this.checkDungeonEntrance();

            // Check for store entrance collision
            this.checkStoreEntrance();

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

        // Update projectiles
        for (const projectile of this.projectiles) {
            if (projectile.active) {
                projectile.update(delta);

                // Check projectile collision with enemies
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

        // Update systems
        if (this.collisionSystem) {
            this.collisionSystem.update();
        }

        if (this.particleSystem) {
            this.particleSystem.update(delta);
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
