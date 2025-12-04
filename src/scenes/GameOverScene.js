// GameOverScene - Game over and victory screens

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Placeholder text
        const text = this.add.text(
            width / 2,
            height / 2,
            'Game Over Scene\n(To be implemented)',
            {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                align: 'center'
            }
        );
        text.setOrigin(0.5);
    }
}
