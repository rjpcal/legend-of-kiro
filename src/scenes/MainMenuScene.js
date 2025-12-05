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

        // Check if save data exists
        const saveSystem = this.registry.get('saveSystem');
        const hasSave = saveSystem && saveSystem.hasSaveData();

        // Start button
        const startButton = this.add.text(width / 2, height / 2 - 30, 'New Game', {
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

        // Start new game on click
        startButton.on('pointerdown', () => {
            // Clear any existing save data from registry
            this.registry.set('playerState', null);
            this.registry.set('completedDungeons', []);
            this.registry.set('collectedItems', []);
            this.registry.set('defeatedEnemies', []);
            this.registry.set('unlockedDoors', []);
            this.registry.set('visitedScreens', []);

            this.scene.start('OverworldScene');
        });

        // Load Game button (only show if save exists)
        if (hasSave) {
            const loadButton = this.add.text(width / 2, height / 2 + 30, 'Load Game', {
                fontSize: '32px',
                fill: '#ffffff',
                fontFamily: 'Arial',
            });
            loadButton.setOrigin(0.5);
            loadButton.setInteractive({ useHandCursor: true });

            // Button hover effect
            loadButton.on('pointerover', () => {
                loadButton.setStyle({ fill: '#790ECB' });
            });

            loadButton.on('pointerout', () => {
                loadButton.setStyle({ fill: '#ffffff' });
            });

            // Load game on click
            loadButton.on('pointerdown', () => {
                if (saveSystem) {
                    const saveData = saveSystem.loadGame();
                    if (saveData) {
                        saveSystem.restoreGameState(this, saveData);
                        this.scene.start('OverworldScene');
                    } else {
                        // Show error message
                        const errorText = this.add.text(
                            width / 2,
                            height / 2 + 80,
                            'Failed to load save data',
                            {
                                fontSize: '16px',
                                fill: '#ff0000',
                                fontFamily: 'Arial',
                            }
                        );
                        errorText.setOrigin(0.5);

                        // Remove error message after 2 seconds
                        this.time.delayedCall(2000, () => {
                            errorText.destroy();
                        });
                    }
                }
            });
        }

        // Music toggle button
        const musicStatus = audioManager ? (audioManager.isMusicEnabled() ? 'ON' : 'OFF') : 'ON';
        const musicYPos = hasSave ? height * 0.68 : height * 0.65;
        const musicButton = this.add.text(width / 2, musicYPos, `Music: ${musicStatus}`, {
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
        const sfxYPos = hasSave ? height * 0.75 : height * 0.72;
        const sfxButton = this.add.text(width / 2, sfxYPos, `Sound Effects: ${sfxStatus}`, {
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
