// GameOverScene - Game over and victory screens
// Validates: Requirements 7.4

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
        this.isVictory = false;
    }

    init(data) {
        // Check if this is a victory or game over
        this.isVictory = data.victory || false;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Get player stats from registry
        const playerState = this.registry.get('playerState');
        const completedDungeons = this.registry.get('completedDungeons') || [];

        // Create background
        const background = this.add.rectangle(0, 0, width, height, 0x000000);
        background.setOrigin(0, 0);

        if (this.isVictory) {
            this.createVictoryScreen(width, height, playerState, completedDungeons);
        } else {
            this.createGameOverScreen(width, height, playerState, completedDungeons);
        }
    }

    /**
     * Create victory screen
     * Validates: Requirements 7.4
     */
    createVictoryScreen(width, height, playerState, completedDungeons) {
        // Victory title
        const title = this.add.text(width / 2, height / 4, 'VICTORY!', {
            fontSize: '64px',
            fill: '#790ECB',
            fontFamily: 'Arial',
            fontStyle: 'bold',
        });
        title.setOrigin(0.5);

        // Subtitle
        const subtitle = this.add.text(width / 2, height / 4 + 80, 'All Dungeons Complete!', {
            fontSize: '32px',
            fill: '#00ff00',
            fontFamily: 'Arial',
        });
        subtitle.setOrigin(0.5);

        // Stats
        const stats = this.add.text(
            width / 2,
            height / 2,
            this.formatStats(playerState, completedDungeons),
            {
                fontSize: '20px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                align: 'center',
                lineSpacing: 10,
            }
        );
        stats.setOrigin(0.5);

        // Play again button
        const playAgainButton = this.add.text(width / 2, height - 150, 'Play Again', {
            fontSize: '24px',
            fill: '#790ECB',
            fontFamily: 'Arial',
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 },
        });
        playAgainButton.setOrigin(0.5);
        playAgainButton.setInteractive({ useHandCursor: true });

        playAgainButton.on('pointerover', () => {
            playAgainButton.setStyle({ fill: '#ffffff', backgroundColor: '#790ECB' });
        });

        playAgainButton.on('pointerout', () => {
            playAgainButton.setStyle({ fill: '#790ECB', backgroundColor: '#ffffff' });
        });

        playAgainButton.on('pointerdown', () => {
            this.restartGame();
        });

        // Main menu button
        const mainMenuButton = this.add.text(width / 2, height - 100, 'Main Menu', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 },
        });
        mainMenuButton.setOrigin(0.5);
        mainMenuButton.setInteractive({ useHandCursor: true });

        mainMenuButton.on('pointerover', () => {
            mainMenuButton.setStyle({ backgroundColor: '#555555' });
        });

        mainMenuButton.on('pointerout', () => {
            mainMenuButton.setStyle({ backgroundColor: '#333333' });
        });

        mainMenuButton.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });

        // Add sparkle effect for victory
        this.addVictoryEffects(width, height);
    }

    /**
     * Create game over screen
     */
    createGameOverScreen(width, height, playerState, completedDungeons) {
        // Game over title
        const title = this.add.text(width / 2, height / 4, 'GAME OVER', {
            fontSize: '64px',
            fill: '#ff0000',
            fontFamily: 'Arial',
            fontStyle: 'bold',
        });
        title.setOrigin(0.5);

        // Stats
        const stats = this.add.text(
            width / 2,
            height / 2,
            this.formatStats(playerState, completedDungeons),
            {
                fontSize: '20px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                align: 'center',
                lineSpacing: 10,
            }
        );
        stats.setOrigin(0.5);

        // Restart button
        const restartButton = this.add.text(width / 2, height - 150, 'Restart', {
            fontSize: '24px',
            fill: '#790ECB',
            fontFamily: 'Arial',
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 },
        });
        restartButton.setOrigin(0.5);
        restartButton.setInteractive({ useHandCursor: true });

        restartButton.on('pointerover', () => {
            restartButton.setStyle({ fill: '#ffffff', backgroundColor: '#790ECB' });
        });

        restartButton.on('pointerout', () => {
            restartButton.setStyle({ fill: '#790ECB', backgroundColor: '#ffffff' });
        });

        restartButton.on('pointerdown', () => {
            this.restartGame();
        });

        // Main menu button
        const mainMenuButton = this.add.text(width / 2, height - 100, 'Main Menu', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 },
        });
        mainMenuButton.setOrigin(0.5);
        mainMenuButton.setInteractive({ useHandCursor: true });

        mainMenuButton.on('pointerover', () => {
            mainMenuButton.setStyle({ backgroundColor: '#555555' });
        });

        mainMenuButton.on('pointerout', () => {
            mainMenuButton.setStyle({ backgroundColor: '#333333' });
        });

        mainMenuButton.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });
    }

    /**
     * Format player stats for display
     */
    formatStats(playerState, completedDungeons) {
        if (!playerState) {
            return 'No stats available';
        }

        const level = playerState.stats?.level || 1;
        const coins = playerState.inventory?.coins || 0;
        const dungeonsComplete = completedDungeons.length;

        return `Final Stats:\n\nLevel: ${level}\nCoins: ${coins}\nDungeons Completed: ${dungeonsComplete}/4`;
    }

    /**
     * Add victory particle effects
     */
    addVictoryEffects(width, height) {
        // Create simple particle effect using rectangles
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 2 + Math.random() * 4;

            const particle = this.add.rectangle(x, y, size, size, 0x790ecb);
            particle.setAlpha(0.5 + Math.random() * 0.5);

            // Animate particle
            this.tweens.add({
                targets: particle,
                y: y - 100 - Math.random() * 100,
                alpha: 0,
                duration: 2000 + Math.random() * 2000,
                ease: 'Power2',
                repeat: -1,
                delay: Math.random() * 2000,
            });
        }
    }

    /**
     * Restart the game
     */
    restartGame() {
        // Clear game state
        this.registry.set('playerState', null);
        this.registry.set('completedDungeons', []);

        // Start new game
        this.scene.start('OverworldScene');
    }
}
