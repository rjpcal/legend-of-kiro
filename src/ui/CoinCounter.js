// CoinCounter - UI component for displaying coin count
// Displays current coin count and updates on collection

export class CoinCounter {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;

        // Coin tracking
        this.coins = 0;

        // Visual elements
        this.container = null;
        this.coinIcon = null;
        this.coinText = null;
    }

    /**
     * Create the coin counter UI
     * @param {number} initialCoins - Initial coin count
     */
    create(initialCoins = 0) {
        this.coins = initialCoins;

        // Create container
        this.container = this.scene.add.container(this.x, this.y);
        this.container.setDepth(1000);

        // Create coin icon (simple circle with better styling)
        this.coinIcon = this.scene.add.circle(0, 0, 12, 0xffd700); // Gold color
        this.coinIcon.setStrokeStyle(3, 0xffaa00);
        this.container.add(this.coinIcon);

        // Create coin text
        this.coinText = this.scene.add.text(20, 0, this.coins.toString(), {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
        });
        this.coinText.setOrigin(0, 0.5);
        this.container.add(this.coinText);
    }

    /**
     * Update coin count
     * @param {number} coins - New coin count
     */
    update(coins) {
        const coinsIncreased = coins > this.coins;
        this.coins = coins;

        // Update text
        this.coinText.setText(this.coins.toString());

        // Animate if coins increased
        if (coinsIncreased) {
            this.animateCollection();
        }
    }

    /**
     * Animate coin collection
     */
    animateCollection() {
        // Scale up and down animation with bounce
        this.scene.tweens.add({
            targets: this.container,
            scaleX: 1.4,
            scaleY: 1.4,
            duration: 150,
            ease: 'Back.easeOut',
            yoyo: true,
        });

        // Flash the coin icon with glow effect
        this.scene.tweens.add({
            targets: this.coinIcon,
            alpha: 0.4,
            duration: 150,
            yoyo: true,
        });

        // Rotate coin for extra flair
        this.scene.tweens.add({
            targets: this.coinIcon,
            angle: 360,
            duration: 300,
        });
    }

    /**
     * Destroy the coin counter
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
        }
    }
}
