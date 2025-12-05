// StoreScene - Store for purchasing items

export class StoreScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StoreScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Placeholder text
        const text = this.add.text(width / 2, height / 2, 'Store Scene\n(To be implemented)', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center',
        });
        text.setOrigin(0.5);
    }
}
