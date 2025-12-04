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

        // Load Kiro sprite
        this.load.image('kiro', 'kiro-logo.png');
        
        // Additional assets will be loaded in future tasks
    }

    async create() {
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
}
