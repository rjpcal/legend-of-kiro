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

        // Load assets here in future tasks
        // For now, just proceed to main menu
    }

    create() {
        // Transition to main menu
        this.scene.start('MainMenuScene');
    }
}
