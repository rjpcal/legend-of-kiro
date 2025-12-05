// BootScene - Initial loading and setup

import { WorldConfig } from '../systems/WorldConfig.js';
import { AudioManager } from '../systems/AudioManager.js';
import { SaveSystem } from '../systems/SaveSystem.js';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create loading text
        const loadingText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'Loading...',
            {
                fontSize: '32px',
                fill: '#790ECB',
                fontFamily: 'Arial',
            }
        );
        loadingText.setOrigin(0.5);

        // Load Kiro sprite (single image for now, will be sprite sheet later)
        this.load.image('kiro', 'kiro-logo.png');

        // Load placeholder enemy sprites (will be replaced with actual sprites later)
        // For now, we'll use colored rectangles generated in create()

        // Initialize audio manager and preload audio
        this.audioManager = new AudioManager(this);
        this.audioManager.preloadAudio();

        // Environment sprites will be created procedurally in create()
    }

    async create() {
        // Create sprites for entities
        this.createPlaceholderSprites();

        // Create environment sprites
        this.createEnvironmentSprites();

        // Define animations for all entity types
        this.defineAnimations();

        // Initialize audio manager
        this.audioManager.initialize();

        // Store audio manager in registry for access by other scenes
        this.registry.set('audioManager', this.audioManager);

        // Initialize save system
        const saveSystem = new SaveSystem();
        this.registry.set('saveSystem', saveSystem);

        // Initialize world configuration
        const worldConfig = new WorldConfig();

        try {
            // Load world configuration from JSON
            await worldConfig.loadFromJSON('assets/world-config.json');

            // Store configuration in game registry for access by other scenes
            this.registry.set('worldConfig', worldConfig);

            console.log('World configuration loaded and stored in registry');
        } catch (error) {
            console.error('Failed to load world configuration:', error);

            // Store the default configuration even on error
            this.registry.set('worldConfig', worldConfig);

            // Show error message to user
            this.add
                .text(
                    this.cameras.main.centerX,
                    this.cameras.main.centerY + 50,
                    'Warning: Using default configuration',
                    {
                        fontSize: '16px',
                        fill: '#ff6b6b',
                        fontFamily: 'Arial',
                    }
                )
                .setOrigin(0.5);

            // Wait a moment before continuing
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Transition to main menu
        this.scene.start('MainMenuScene');
    }

    /**
     * Create sprites for entities using procedural graphics
     */
    createPlaceholderSprites() {
        // Configuration for sprite generation
        const SPRITE_CONFIG = {
            SIZE: 32,
            get CENTER() {
                return this.SIZE / 2;
            },
        };

        // Create enemy sprites with animations
        const enemyTypes = [
            {
                key: 'zombie',
                color: 0x4a7c59,
                secondaryColor: 0x3a5c49,
                description: 'Slow undead creature',
            },
            {
                key: 'skeleton',
                color: 0xd4d4d4,
                secondaryColor: 0xa4a4a4,
                description: 'Bony warrior',
            },
            {
                key: 'ghoul',
                color: 0x8b4789,
                secondaryColor: 0x6b3769,
                description: 'Fast demonic entity',
            },
            {
                key: 'spirit',
                color: 0x6b9bd1,
                secondaryColor: 0x4b7bb1,
                description: 'Ethereal ghost',
            },
        ];

        enemyTypes.forEach(enemy => {
            this.createEnemySprite(enemy, SPRITE_CONFIG);
        });

        // Create boss sprites (enhanced versions of regular enemies)
        enemyTypes.forEach((enemy, index) => {
            const bossEnemy = {
                key: `boss_${enemy.key}`,
                color: enemy.color,
                secondaryColor: enemy.secondaryColor,
                description: `Boss ${enemy.description}`,
                isBoss: true,
            };
            this.createEnemySprite(bossEnemy, SPRITE_CONFIG);
        });
    }

    /**
     * Create an enemy sprite with animation frames
     * @param {object} enemy - Enemy configuration
     * @param {object} config - Sprite configuration
     */
    createEnemySprite(enemy, config) {
        const frames = [];

        // Create idle frame (frame 0)
        const idleGraphics = this.add.graphics();
        this.drawEnemyFrame(idleGraphics, enemy, config, 0);
        idleGraphics.generateTexture(`${enemy.key}_idle`, config.SIZE, config.SIZE);
        idleGraphics.destroy();
        frames.push({ key: `${enemy.key}_idle`, frame: 0 });

        // Create movement frames (frames 1-3)
        for (let i = 1; i <= 3; i++) {
            const moveGraphics = this.add.graphics();
            this.drawEnemyFrame(moveGraphics, enemy, config, i);
            moveGraphics.generateTexture(`${enemy.key}_move_${i}`, config.SIZE, config.SIZE);
            moveGraphics.destroy();
            frames.push({ key: `${enemy.key}_move_${i}`, frame: 0 });
        }

        // Create attack frame (frame 4)
        const attackGraphics = this.add.graphics();
        this.drawEnemyFrame(attackGraphics, enemy, config, 4);
        attackGraphics.generateTexture(`${enemy.key}_attack`, config.SIZE, config.SIZE);
        attackGraphics.destroy();
        frames.push({ key: `${enemy.key}_attack`, frame: 0 });

        // Create defeat frame (frame 5) - friendly version
        const defeatGraphics = this.add.graphics();
        this.drawEnemyFrame(defeatGraphics, enemy, config, 5);
        defeatGraphics.generateTexture(`${enemy.key}_defeat`, config.SIZE, config.SIZE);
        defeatGraphics.destroy();
        frames.push({ key: `${enemy.key}_defeat`, frame: 0 });

        // Create a default texture using the idle frame for backward compatibility
        const defaultGraphics = this.add.graphics();
        this.drawEnemyFrame(defaultGraphics, enemy, config, 0);
        defaultGraphics.generateTexture(enemy.key, config.SIZE, config.SIZE);
        defaultGraphics.destroy();
    }

    /**
     * Draw an enemy sprite frame
     * @param {Phaser.GameObjects.Graphics} graphics - Graphics object to draw on
     * @param {object} enemy - Enemy configuration
     * @param {object} config - Sprite configuration
     * @param {number} frameIndex - Animation frame index
     */
    drawEnemyFrame(graphics, enemy, config, frameIndex) {
        const center = config.CENTER;
        const baseRadius = enemy.isBoss ? 15 : 12;
        const radius = baseRadius + Math.sin(frameIndex * 0.5) * 1; // Slight size variation

        // Draw shadow
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillEllipse(center, center + 14, baseRadius * 0.8, baseRadius * 0.3);

        // Draw body with gradient effect (using multiple circles)
        for (let i = 0; i < 3; i++) {
            const alpha = 1 - i * 0.15;
            const r = radius - i * 2;
            graphics.fillStyle(enemy.color, alpha);
            graphics.fillCircle(center, center, r);
        }

        // Add secondary color details based on enemy type
        graphics.fillStyle(enemy.secondaryColor, 0.8);

        switch (frameIndex) {
            case 0: // Idle
                // Draw eyes
                graphics.fillCircle(center - 4, center - 3, 2);
                graphics.fillCircle(center + 4, center - 3, 2);
                break;

            case 1: // Move frame 1
                graphics.fillCircle(center - 4, center - 2, 2);
                graphics.fillCircle(center + 4, center - 2, 2);
                // Slight lean
                graphics.fillEllipse(center + 1, center + 4, 6, 3);
                break;

            case 2: // Move frame 2
                graphics.fillCircle(center - 4, center - 3, 2);
                graphics.fillCircle(center + 4, center - 3, 2);
                break;

            case 3: // Move frame 3
                graphics.fillCircle(center - 4, center - 2, 2);
                graphics.fillCircle(center + 4, center - 2, 2);
                // Slight lean opposite direction
                graphics.fillEllipse(center - 1, center + 4, 6, 3);
                break;

            case 4: // Attack
                // Angry eyes
                graphics.fillCircle(center - 5, center - 3, 2.5);
                graphics.fillCircle(center + 5, center - 3, 2.5);
                // Attack indicator
                graphics.fillStyle(0xff0000, 0.6);
                graphics.fillCircle(center, center - 8, 3);
                break;

            case 5: // Defeat (friendly)
                // Happy eyes
                graphics.fillStyle(0xffffff, 0.9);
                graphics.fillCircle(center - 4, center - 3, 2);
                graphics.fillCircle(center + 4, center - 3, 2);
                // Smile
                graphics.lineStyle(2, 0xffffff, 0.9);
                graphics.beginPath();
                graphics.arc(center, center + 2, 5, 0, Math.PI, false);
                graphics.strokePath();
                break;
        }

        // Add boss crown if this is a boss
        if (enemy.isBoss) {
            graphics.fillStyle(0xffd700, 1); // Gold
            graphics.fillTriangle(
                center - 6,
                center - 12,
                center,
                center - 16,
                center + 6,
                center - 12
            );
            graphics.fillCircle(center, center - 14, 2);
        }
    }

    /**
     * Create environment sprites (terrain, obstacles, doors, collectibles)
     */
    createEnvironmentSprites() {
        const TILE_SIZE = 32;
        const CENTER = TILE_SIZE / 2;

        // Terrain tiles
        this.createTerrainTile('grass', 0x2d5016, 0x3a6b1f, TILE_SIZE);
        this.createTerrainTile('stone', 0x5a5a5a, 0x707070, TILE_SIZE);
        this.createTerrainTile('dirt', 0x6b4423, 0x8b5a2b, TILE_SIZE);
        this.createTerrainTile('water', 0x1e3a8a, 0x2e4a9a, TILE_SIZE);

        // Obstacle sprites
        this.createObstacleSprite('wall', 0x3a3a3a, TILE_SIZE);
        this.createObstacleSprite('rock', 0x6a6a6a, TILE_SIZE);
        this.createObstacleSprite('tree', 0x2d5016, TILE_SIZE);

        // Door sprites
        this.createDoorSprite('door_locked', 0x8b4513, true, TILE_SIZE);
        this.createDoorSprite('door_unlocked', 0x6b8e23, false, TILE_SIZE);

        // Collectible sprites
        this.createCollectibleSprite('coin', 0xffd700, TILE_SIZE);
        this.createCollectibleSprite('health', 0xff0000, TILE_SIZE);
        this.createCollectibleSprite('weapon', 0xc0c0c0, TILE_SIZE);
        this.createCollectibleSprite('armor', 0x4169e1, TILE_SIZE);

        // Dungeon entrance marker
        this.createDungeonEntrance('dungeon_entrance', TILE_SIZE);

        // UI sprites
        this.createUISprites();
    }

    /**
     * Create a terrain tile texture
     */
    createTerrainTile(key, baseColor, accentColor, size) {
        const graphics = this.add.graphics();

        // Base color
        graphics.fillStyle(baseColor, 1);
        graphics.fillRect(0, 0, size, size);

        // Add texture variation
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = Math.random() * 3 + 1;
            graphics.fillStyle(accentColor, 0.3 + Math.random() * 0.3);
            graphics.fillCircle(x, y, r);
        }

        graphics.generateTexture(key, size, size);
        graphics.destroy();
    }

    /**
     * Create an obstacle sprite
     */
    createObstacleSprite(key, color, size) {
        const graphics = this.add.graphics();
        const center = size / 2;

        if (key === 'wall') {
            // Draw brick wall
            graphics.fillStyle(color, 1);
            graphics.fillRect(0, 0, size, size);

            // Brick pattern
            graphics.lineStyle(1, 0x2a2a2a, 1);
            graphics.strokeRect(0, 0, size, size / 2);
            graphics.strokeRect(0, size / 2, size, size / 2);
            graphics.strokeRect(size / 2, 0, size / 2, size / 2);
        } else if (key === 'rock') {
            // Draw rock
            graphics.fillStyle(color, 1);
            graphics.fillCircle(center, center, size * 0.4);

            // Add shading
            graphics.fillStyle(0x4a4a4a, 0.5);
            graphics.fillCircle(center - 4, center - 4, size * 0.2);
        } else if (key === 'tree') {
            // Draw tree trunk
            graphics.fillStyle(0x4a3020, 1);
            graphics.fillRect(center - 3, center, 6, size * 0.4);

            // Draw tree foliage
            graphics.fillStyle(color, 1);
            graphics.fillCircle(center, center - 2, size * 0.35);

            // Add highlights
            graphics.fillStyle(0x3a6b1f, 0.6);
            graphics.fillCircle(center - 4, center - 4, size * 0.15);
        }

        graphics.generateTexture(key, size, size);
        graphics.destroy();
    }

    /**
     * Create a door sprite
     */
    createDoorSprite(key, color, isLocked, size) {
        const graphics = this.add.graphics();
        const center = size / 2;

        // Door frame
        graphics.fillStyle(0x2a2a2a, 1);
        graphics.fillRect(center - 12, 0, 24, size);

        // Door
        graphics.fillStyle(color, 1);
        graphics.fillRect(center - 10, 2, 20, size - 4);

        // Door details
        graphics.lineStyle(2, 0x1a1a1a, 1);
        graphics.strokeRect(center - 10, 2, 20, size - 4);

        if (isLocked) {
            // Draw lock
            graphics.fillStyle(0xffd700, 1);
            graphics.fillCircle(center, center, 4);
            graphics.fillRect(center - 2, center + 2, 4, 4);
        } else {
            // Draw handle
            graphics.fillStyle(0xc0c0c0, 1);
            graphics.fillCircle(center + 6, center, 3);
        }

        graphics.generateTexture(key, size, size);
        graphics.destroy();
    }

    /**
     * Create a collectible sprite
     */
    createCollectibleSprite(key, color, size) {
        const graphics = this.add.graphics();
        const center = size / 2;

        if (key === 'coin') {
            // Draw coin
            graphics.fillStyle(color, 1);
            graphics.fillCircle(center, center, 8);

            // Add shine
            graphics.fillStyle(0xffed4e, 1);
            graphics.fillCircle(center - 2, center - 2, 3);

            // Border
            graphics.lineStyle(2, 0xdaa520, 1);
            graphics.strokeCircle(center, center, 8);
        } else if (key === 'health') {
            // Draw heart
            graphics.fillStyle(color, 1);

            // Heart shape using circles and triangle
            graphics.fillCircle(center - 4, center - 2, 5);
            graphics.fillCircle(center + 4, center - 2, 5);
            graphics.fillTriangle(center - 8, center, center + 8, center, center, center + 8);

            // Highlight
            graphics.fillStyle(0xff6b6b, 1);
            graphics.fillCircle(center - 3, center - 4, 2);
        } else if (key === 'weapon') {
            // Draw sword
            graphics.fillStyle(color, 1);
            graphics.fillRect(center - 2, center - 8, 4, 12);

            // Hilt
            graphics.fillStyle(0x8b4513, 1);
            graphics.fillRect(center - 4, center + 2, 8, 3);

            // Blade shine
            graphics.fillStyle(0xffffff, 0.6);
            graphics.fillRect(center - 1, center - 6, 1, 8);
        } else if (key === 'armor') {
            // Draw shield
            graphics.fillStyle(color, 1);
            graphics.fillCircle(center, center, 8);

            // Shield detail
            graphics.lineStyle(2, 0x2e5cb8, 1);
            graphics.strokeCircle(center, center, 8);

            // Center emblem
            graphics.fillStyle(0xffd700, 1);
            graphics.fillCircle(center, center, 3);
        }

        graphics.generateTexture(key, size, size);
        graphics.destroy();
    }

    /**
     * Create dungeon entrance marker
     */
    createDungeonEntrance(key, size) {
        const graphics = this.add.graphics();
        const center = size / 2;

        // Draw dark portal
        graphics.fillStyle(0x1a0a2e, 1);
        graphics.fillCircle(center, center, 12);

        // Portal swirl effect
        graphics.lineStyle(2, 0x790ecb, 0.8);
        graphics.strokeCircle(center, center, 10);
        graphics.strokeCircle(center, center, 7);

        // Inner glow
        graphics.fillStyle(0x790ecb, 0.4);
        graphics.fillCircle(center, center, 6);

        graphics.generateTexture(key, size, size);
        graphics.destroy();
    }

    /**
     * Create UI sprites for health meter, minimap, and menus
     */
    createUISprites() {
        const UI_CONFIG = {
            HEART_SIZE: 24,
            MINIMAP_CELL_SIZE: 16,
            BUTTON_WIDTH: 120,
            BUTTON_HEIGHT: 40,
        };

        // Health meter heart sprites
        this.createHeartSprite('heart_full', 0xff0000, UI_CONFIG.HEART_SIZE, true);
        this.createHeartSprite('heart_empty', 0x4a0000, UI_CONFIG.HEART_SIZE, false);
        this.createHeartSprite('heart_half', 0xff6b6b, UI_CONFIG.HEART_SIZE, true);

        // Minimap cell sprites
        this.createMinimapCell('minimap_cell', 0x2a2a2a, UI_CONFIG.MINIMAP_CELL_SIZE);
        this.createMinimapCell('minimap_cell_current', 0x790ecb, UI_CONFIG.MINIMAP_CELL_SIZE);
        this.createMinimapCell('minimap_cell_visited', 0x4a4a4a, UI_CONFIG.MINIMAP_CELL_SIZE);

        // Button sprites for menus
        this.createButtonSprite(
            'button_normal',
            0x790ecb,
            UI_CONFIG.BUTTON_WIDTH,
            UI_CONFIG.BUTTON_HEIGHT
        );
        this.createButtonSprite(
            'button_hover',
            0x9a3ee0,
            UI_CONFIG.BUTTON_WIDTH,
            UI_CONFIG.BUTTON_HEIGHT
        );
        this.createButtonSprite(
            'button_pressed',
            0x5a0e9b,
            UI_CONFIG.BUTTON_WIDTH,
            UI_CONFIG.BUTTON_HEIGHT
        );

        // Store UI sprites
        this.createPanelSprite('store_panel', 400, 300);
        this.createPanelSprite('inventory_panel', 200, 400);

        // XP bar sprites
        this.createBarSprite('xp_bar_bg', 200, 20, 0x2a2a2a);
        this.createBarSprite('xp_bar_fill', 200, 16, 0x790ecb);
    }

    /**
     * Create a heart sprite for health meter
     */
    createHeartSprite(key, color, size, filled) {
        const graphics = this.add.graphics();
        const center = size / 2;

        if (filled) {
            // Filled heart
            graphics.fillStyle(color, 1);
            graphics.fillCircle(center - size * 0.2, center - size * 0.1, size * 0.25);
            graphics.fillCircle(center + size * 0.2, center - size * 0.1, size * 0.25);
            graphics.fillTriangle(
                center - size * 0.4,
                center,
                center + size * 0.4,
                center,
                center,
                center + size * 0.4
            );

            // Highlight
            graphics.fillStyle(0xffffff, 0.3);
            graphics.fillCircle(center - size * 0.15, center - size * 0.15, size * 0.1);
        } else {
            // Empty heart outline
            graphics.lineStyle(2, color, 1);
            graphics.strokeCircle(center - size * 0.2, center - size * 0.1, size * 0.25);
            graphics.strokeCircle(center + size * 0.2, center - size * 0.1, size * 0.25);

            graphics.beginPath();
            graphics.moveTo(center - size * 0.4, center);
            graphics.lineTo(center, center + size * 0.4);
            graphics.lineTo(center + size * 0.4, center);
            graphics.strokePath();
        }

        graphics.generateTexture(key, size, size);
        graphics.destroy();
    }

    /**
     * Create a minimap cell sprite
     */
    createMinimapCell(key, color, size) {
        const graphics = this.add.graphics();

        // Cell background
        graphics.fillStyle(color, 1);
        graphics.fillRect(0, 0, size, size);

        // Border
        graphics.lineStyle(1, 0x1a1a1a, 1);
        graphics.strokeRect(0, 0, size, size);

        graphics.generateTexture(key, size, size);
        graphics.destroy();
    }

    /**
     * Create a button sprite
     */
    createButtonSprite(key, color, width, height) {
        const graphics = this.add.graphics();

        // Button background with rounded corners
        graphics.fillStyle(color, 1);
        graphics.fillRoundedRect(0, 0, width, height, 8);

        // Border
        const borderColor = key.includes('hover') ? 0xffffff : 0x5a0e9b;
        graphics.lineStyle(2, borderColor, 0.8);
        graphics.strokeRoundedRect(0, 0, width, height, 8);

        // Subtle gradient effect (using multiple rectangles)
        graphics.fillStyle(0xffffff, 0.1);
        graphics.fillRoundedRect(0, 0, width, height / 2, 8);

        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    /**
     * Create a panel sprite for UI backgrounds
     */
    createPanelSprite(key, width, height) {
        const graphics = this.add.graphics();

        // Panel background
        graphics.fillStyle(0x0a0a0a, 0.95);
        graphics.fillRoundedRect(0, 0, width, height, 12);

        // Border with Kiro purple
        graphics.lineStyle(3, 0x790ecb, 1);
        graphics.strokeRoundedRect(0, 0, width, height, 12);

        // Inner shadow effect
        graphics.lineStyle(1, 0x000000, 0.5);
        graphics.strokeRoundedRect(3, 3, width - 6, height - 6, 10);

        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    /**
     * Create a bar sprite (for XP, health bars, etc.)
     */
    createBarSprite(key, width, height, color) {
        const graphics = this.add.graphics();

        // Bar background or fill
        graphics.fillStyle(color, 1);
        graphics.fillRoundedRect(0, 0, width, height, height / 2);

        // Border for background bars
        if (key.includes('bg')) {
            graphics.lineStyle(2, 0x1a1a1a, 1);
            graphics.strokeRoundedRect(0, 0, width, height, height / 2);
        }

        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    /**
     * Define animations for all entity types
     */
    defineAnimations() {
        // Kiro animations (using single image with ripple effect)
        // The ripple effect is applied separately in the RippleEffect system

        // Define enemy animations
        const enemyTypes = ['zombie', 'skeleton', 'ghoul', 'spirit'];

        enemyTypes.forEach(enemyType => {
            // Idle animation (single frame)
            if (!this.anims.exists(`${enemyType}_idle`)) {
                this.anims.create({
                    key: `${enemyType}_idle`,
                    frames: [{ key: `${enemyType}_idle`, frame: 0 }],
                    frameRate: 1,
                    repeat: -1,
                });
            }

            // Movement animation (3 frames)
            if (!this.anims.exists(`${enemyType}_move`)) {
                this.anims.create({
                    key: `${enemyType}_move`,
                    frames: [
                        { key: `${enemyType}_move_1`, frame: 0 },
                        { key: `${enemyType}_move_2`, frame: 0 },
                        { key: `${enemyType}_move_3`, frame: 0 },
                    ],
                    frameRate: 8,
                    repeat: -1,
                });
            }

            // Attack animation (single frame, short duration)
            if (!this.anims.exists(`${enemyType}_attack`)) {
                this.anims.create({
                    key: `${enemyType}_attack`,
                    frames: [{ key: `${enemyType}_attack`, frame: 0 }],
                    frameRate: 10,
                    repeat: 0,
                });
            }

            // Defeat animation (conversion to friendly)
            if (!this.anims.exists(`${enemyType}_defeat`)) {
                this.anims.create({
                    key: `${enemyType}_defeat`,
                    frames: [{ key: `${enemyType}_defeat`, frame: 0 }],
                    frameRate: 1,
                    repeat: 0,
                });
            }

            // Boss versions
            const bossKey = `boss_${enemyType}`;

            if (!this.anims.exists(`${bossKey}_idle`)) {
                this.anims.create({
                    key: `${bossKey}_idle`,
                    frames: [{ key: `${bossKey}_idle`, frame: 0 }],
                    frameRate: 1,
                    repeat: -1,
                });
            }

            if (!this.anims.exists(`${bossKey}_move`)) {
                this.anims.create({
                    key: `${bossKey}_move`,
                    frames: [
                        { key: `${bossKey}_move_1`, frame: 0 },
                        { key: `${bossKey}_move_2`, frame: 0 },
                        { key: `${bossKey}_move_3`, frame: 0 },
                    ],
                    frameRate: 6, // Slower than regular enemies
                    repeat: -1,
                });
            }

            if (!this.anims.exists(`${bossKey}_attack`)) {
                this.anims.create({
                    key: `${bossKey}_attack`,
                    frames: [{ key: `${bossKey}_attack`, frame: 0 }],
                    frameRate: 10,
                    repeat: 0,
                });
            }

            if (!this.anims.exists(`${bossKey}_defeat`)) {
                this.anims.create({
                    key: `${bossKey}_defeat`,
                    frames: [{ key: `${bossKey}_defeat`, frame: 0 }],
                    frameRate: 1,
                    repeat: 0,
                });
            }
        });

        console.log('Enemy animations defined with sprite frames');
    }
}
