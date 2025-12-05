// XPBar - UI component for displaying XP progress
// Displays current XP and progress to next level

export class XPBar {
    constructor(scene, x, y, width = 200) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = 20;

        // XP tracking
        this.currentXP = 0;
        this.level = 1;
        this.xpForNextLevel = 0;

        // Visual elements
        this.container = null;
        this.background = null;
        this.fillBar = null;
        this.levelText = null;
        this.xpText = null;
    }

    /**
     * Create the XP bar UI
     * @param {number} currentXP - Initial XP
     * @param {number} level - Initial level
     */
    create(currentXP = 0, level = 1) {
        this.currentXP = currentXP;
        this.level = level;
        this.xpForNextLevel = this.calculateLevelThreshold(level);

        // Create container
        this.container = this.scene.add.container(this.x, this.y);
        this.container.setDepth(1000);

        // Create background bar with dark theme
        this.background = this.scene.add.rectangle(0, 0, this.width, this.height, 0x1a1a1a);
        this.background.setStrokeStyle(3, 0x790ecb); // Kiro purple border
        this.container.add(this.background);

        // Create fill bar (progress) with gradient effect
        this.fillBar = this.scene.add.rectangle(
            -this.width / 2,
            0,
            0,
            this.height - 4,
            0x790ecb // Kiro purple
        );
        this.fillBar.setOrigin(0, 0.5);
        this.container.add(this.fillBar);

        // Create level text
        this.levelText = this.scene.add.text(-this.width / 2 - 60, 0, `LV ${this.level}`, {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
        });
        this.levelText.setOrigin(0, 0.5);
        this.container.add(this.levelText);

        // Create XP text
        this.xpText = this.scene.add.text(0, 0, '', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Arial',
        });
        this.xpText.setOrigin(0.5, 0.5);
        this.container.add(this.xpText);

        // Update display
        this.updateDisplay();
    }

    /**
     * Calculate XP threshold for a given level
     * @param {number} level - Level to calculate threshold for
     * @returns {number} XP required for next level
     */
    calculateLevelThreshold(level) {
        // Balanced formula: increases progressively
        // Level 1->2: 50 XP, Level 2->3: 75 XP, Level 3->4: 100 XP, etc.
        return 25 + level * 25;
    }

    /**
     * Update the XP bar display
     */
    updateDisplay() {
        // Calculate progress percentage
        const progress = Math.min(1, this.currentXP / this.xpForNextLevel);

        // Update fill bar width
        const fillWidth = (this.width - 4) * progress;
        this.fillBar.width = fillWidth;

        // Update XP text
        this.xpText.setText(`${this.currentXP}/${this.xpForNextLevel}`);

        // Update level text
        this.levelText.setText(`LV ${this.level}`);
    }

    /**
     * Update XP and level
     * @param {number} currentXP - New XP value
     * @param {number} level - New level
     */
    update(currentXP, level) {
        const leveledUp = level > this.level;

        this.currentXP = currentXP;
        this.level = level;
        this.xpForNextLevel = this.calculateLevelThreshold(level);

        // Update display
        this.updateDisplay();

        // Animate if leveled up
        if (leveledUp) {
            this.animateLevelUp();
        }
    }

    /**
     * Animate level up
     */
    animateLevelUp() {
        // Flash the bar with purple glow
        this.scene.tweens.add({
            targets: this.fillBar,
            alpha: 0.3,
            duration: 150,
            yoyo: true,
            repeat: 3,
        });

        // Scale up level text with bounce
        this.scene.tweens.add({
            targets: this.levelText,
            scaleX: 1.8,
            scaleY: 1.8,
            duration: 250,
            ease: 'Back.easeOut',
            yoyo: true,
        });

        // Add color flash to level text
        this.scene.tweens.add({
            targets: this.levelText,
            tint: 0x790ecb,
            duration: 250,
            yoyo: true,
        });

        // Pulse the entire bar
        this.scene.tweens.add({
            targets: this.container,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 200,
            ease: 'Back.easeOut',
            yoyo: true,
        });
    }

    /**
     * Destroy the XP bar
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
        }
    }
}
