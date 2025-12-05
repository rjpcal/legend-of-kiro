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

        // Create coin icon (simple circle)
        this.coinIcon = this.scene.add.circle(0, 0, 12, 0xffd700); // Gold color
        this.coinIcon.setStrokeStyle(2, 0xffa500);
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
        // Scale up and down animation
        this.scene.tweens.add({
            targets: this.container,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 100,
            yoyo: true,
        });

        // Flash the coin icon
        this.scene.tweens.add({
            targets: this.coinIcon,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
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
