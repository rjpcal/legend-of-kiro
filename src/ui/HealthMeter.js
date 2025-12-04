// HealthMeter - UI component for displaying player health
// Displays current and max health visually with pulse animation on damage

class HealthMeter {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        // Health tracking
        this.currentHealth = 0;
        this.maxHealth = 0;
        
        // Visual elements
        this.container = null;
        this.hearts = [];
        
        // Pulse animation state
        this.isPulsing = false;
        this.pulseScale = 1.0;
        
        // Heart configuration
        this.heartSize = 24;
        this.heartSpacing = 4;
        this.heartsPerRow = 10;
    }

    /**
     * Create the health meter UI
     * @param {number} currentHealth - Initial current health
     * @param {number} maxHealth - Initial max health
     */
    create(currentHealth, maxHealth) {
        this.currentHealth = currentHealth;
        this.maxHealth = maxHealth;
        
        // Create container for all hearts
        this.container = this.scene.add.container(this.x, this.y);
        this.container.setDepth(1000); // High depth to render on top
        
        // Create hearts based on max health
        this.updateHearts();
    }

    /**
     * Update the hearts display based on current max health
     */
    updateHearts() {
        // Clear existing hearts
        this.hearts.forEach(heart => {
            if (heart.full) heart.full.destroy();
            if (heart.empty) heart.empty.destroy();
        });
        this.hearts = [];
        
        // Calculate number of hearts (2 health per heart)
        const numHearts = Math.ceil(this.maxHealth / 2);
        
        // Create hearts
        for (let i = 0; i < numHearts; i++) {
            const row = Math.floor(i / this.heartsPerRow);
            const col = i % this.heartsPerRow;
            
            const heartX = col * (this.heartSize + this.heartSpacing);
            const heartY = row * (this.heartSize + this.heartSpacing);
            
            // Create empty heart (background)
            const emptyHeart = this.scene.add.rectangle(
                heartX,
                heartY,
                this.heartSize,
                this.heartSize,
                0x333333
            );
            emptyHeart.setStrokeStyle(2, 0x666666);
            this.container.add(emptyHeart);
            
            // Create full heart (foreground)
            const fullHeart = this.scene.add.rectangle(
                heartX,
                heartY,
                this.heartSize,
                this.heartSize,
                0x790ECB // Kiro purple
            );
            fullHeart.setStrokeStyle(2, 0x9a3ee0);
            this.container.add(fullHeart);
            
            this.hearts.push({
                empty: emptyHeart,
                full: fullHeart,
                x: heartX,
                y: heartY
            });
        }
        
        // Update display to show current health
        this.updateDisplay();
    }

    /**
     * Update the health meter display
     */
    updateDisplay() {
        const numHearts = this.hearts.length;
        
        for (let i = 0; i < numHearts; i++) {
            const heart = this.hearts[i];
            const heartHealthStart = i * 2;
            const heartHealthEnd = heartHealthStart + 2;
            
            // Calculate how much of this heart should be filled
            let fillAmount = 0;
            if (this.currentHealth > heartHealthStart) {
                fillAmount = Math.min(2, this.currentHealth - heartHealthStart);
            }
            
            // Update heart appearance based on fill amount
            if (fillAmount === 0) {
                // Empty heart
                heart.full.setVisible(false);
            } else if (fillAmount === 1) {
                // Half heart - show half width
                heart.full.setVisible(true);
                heart.full.setScale(0.5, 1);
                heart.full.x = heart.x - this.heartSize / 4;
            } else {
                // Full heart
                heart.full.setVisible(true);
                heart.full.setScale(1, 1);
                heart.full.x = heart.x;
            }
        }
    }

    /**
     * Update health values and display
     * @param {number} currentHealth - New current health
     * @param {number} maxHealth - New max health
     */
    update(currentHealth, maxHealth) {
        const healthDecreased = currentHealth < this.currentHealth;
        const maxHealthChanged = maxHealth !== this.maxHealth;
        
        this.currentHealth = currentHealth;
        this.maxHealth = maxHealth;
        
        // Recreate hearts if max health changed
        if (maxHealthChanged) {
            this.updateHearts();
        } else {
            this.updateDisplay();
        }
        
        // Trigger pulse animation if health decreased
        if (healthDecreased) {
            this.pulse();
        }
    }

    /**
     * Trigger pulse animation
     */
    pulse() {
        if (this.isPulsing) {
            return; // Already pulsing
        }
        
        this.isPulsing = true;
        
        // Create pulse tween
        this.scene.tweens.add({
            targets: this.container,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                this.isPulsing = false;
            }
        });
    }

    /**
     * Destroy the health meter
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HealthMeter;
}
