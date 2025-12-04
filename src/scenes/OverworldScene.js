// OverworldScene - Main overworld gameplay

class OverworldScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OverworldScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Placeholder text
        const text = this.add.text(
            width / 2,
            height / 2,
            'Overworld Scene\n(To be implemented)',
            {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                align: 'center'
            }
        );
        text.setOrigin(0.5);
    }

    update() {
        // Game loop will be implemented in future tasks
    }
}
