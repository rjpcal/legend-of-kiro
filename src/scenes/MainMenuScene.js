// MainMenuScene - Main menu with start game option

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Title
        const title = this.add.text(width / 2, height / 3, 'Legend of Kiro', {
            fontSize: '48px',
            fill: '#790ECB',
            fontFamily: 'Arial',
            fontStyle: 'bold',
        });
        title.setOrigin(0.5);

        // Start button
        const startButton = this.add.text(width / 2, height / 2, 'Start Game', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
        });
        startButton.setOrigin(0.5);
        startButton.setInteractive({ useHandCursor: true });

        // Button hover effect
        startButton.on('pointerover', () => {
            startButton.setStyle({ fill: '#790ECB' });
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ fill: '#ffffff' });
        });

        // Start game on click
        startButton.on('pointerdown', () => {
            this.scene.start('OverworldScene');
        });

        // Instructions
        const instructions = this.add.text(
            width / 2,
            height * 0.75,
            'Use Arrow Keys or WASD to move',
            {
                fontSize: '16px',
                fill: '#cccccc',
                fontFamily: 'Arial',
            }
        );
        instructions.setOrigin(0.5);
    }
}
