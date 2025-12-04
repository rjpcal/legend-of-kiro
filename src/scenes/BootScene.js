// BootScene - Initial loading and setup

class BootScene extends Phaser.Scene {
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
                fontFamily: 'Arial'
            }
        );
        loadingText.setOrigin(0.5);

        // Load Kiro sprite (single image for now, will be sprite sheet later)
        this.load.image('kiro', 'kiro-logo.png');
        
        // Load placeholder enemy sprites (will be replaced with actual sprites later)
        // For now, we'll use colored rectangles generated in create()
        
        // Additional assets will be loaded in future tasks
    }

    async create() {
        // Create placeholder sprites for enemies (colored rectangles)
        this.createPlaceholderSprites();
        
        // Define animations for all entity types
        this.defineAnimations();
        
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
            this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY + 50,
                'Warning: Using default configuration',
                {
                    fontSize: '16px',
                    fill: '#ff6b6b',
                    fontFamily: 'Arial'
                }
            ).setOrigin(0.5);
            
            // Wait a moment before continuing
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Transition to main menu
        this.scene.start('MainMenuScene');
    }
    
    /**
     * Create placeholder sprites for entities that don't have sprite sheets yet
     */
    createPlaceholderSprites() {
        // Create placeholder sprites for enemies using graphics
        const enemyTypes = [
            { key: 'zombie', color: 0x4a7c59 },
            { key: 'skeleton', color: 0xd4d4d4 },
            { key: 'ghoul', color: 0x8b4789 },
            { key: 'spirit', color: 0x6b9bd1 }
        ];
        
        enemyTypes.forEach(enemy => {
            const graphics = this.add.graphics();
            graphics.fillStyle(enemy.color, 1);
            graphics.fillCircle(16, 16, 14);
            graphics.generateTexture(enemy.key, 32, 32);
            graphics.destroy();
        });
    }
    
    /**
     * Define animations for all entity types
     * Currently using single frame images, will be expanded when sprite sheets are added
     */
    defineAnimations() {
        // Kiro animations (using single image for now)
        // When sprite sheets are added, these will have multiple frames
        
        // For single-image sprites, we don't create frame-based animations
        // Instead, we'll handle state changes through the animation manager
        // and apply effects (like ripple) separately
        
        // Enemy animations will be defined similarly
        // The animation system is ready for sprite sheets when they're added
        
        console.log('Animation definitions ready for sprite sheets');
    }
}
