// MainMenuScene - Main menu with start game option

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Get audio manager
        const audioManager = this.registry.get('audioManager');

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

        // Music toggle button
        const musicStatus = audioManager ? (audioManager.isMusicEnabled() ? 'ON' : 'OFF') : 'ON';
        const musicButton = this.add.text(width / 2, height * 0.65, `Music: ${musicStatus}`, {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial',
        });
        musicButton.setOrigin(0.5);
        musicButton.setInteractive({ useHandCursor: true });

        // Music button hover effect
        musicButton.on('pointerover', () => {
            musicButton.setStyle({ fill: '#790ECB' });
        });

        musicButton.on('pointerout', () => {
            musicButton.setStyle({ fill: '#ffffff' });
        });

        // Toggle music on click
        musicButton.on('pointerdown', () => {
            if (audioManager) {
                audioManager.toggleMusic();
                const newStatus = audioManager.isMusicEnabled() ? 'ON' : 'OFF';
                musicButton.setText(`Music: ${newStatus}`);
            }
        });

        // SFX toggle button
        const sfxStatus = audioManager ? (audioManager.isSfxEnabled() ? 'ON' : 'OFF') : 'ON';
        const sfxButton = this.add.text(width / 2, height * 0.72, `Sound Effects: ${sfxStatus}`, {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial',
        });
        sfxButton.setOrigin(0.5);
        sfxButton.setInteractive({ useHandCursor: true });

        // SFX button hover effect
        sfxButton.on('pointerover', () => {
            sfxButton.setStyle({ fill: '#790ECB' });
        });

        sfxButton.on('pointerout', () => {
            sfxButton.setStyle({ fill: '#ffffff' });
        });

        // Toggle SFX on click
        sfxButton.on('pointerdown', () => {
            if (audioManager) {
                audioManager.toggleSfx();
                const newStatus = audioManager.isSfxEnabled() ? 'ON' : 'OFF';
                sfxButton.setText(`Sound Effects: ${newStatus}`);
            }
        });

        // Instructions
        const instructions = this.add.text(
            width / 2,
            height * 0.85,
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
