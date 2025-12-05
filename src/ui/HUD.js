// HUD - Main HUD manager that coordinates all UI components
// Manages health meter, coin counter, XP bar, and minimap

import { HealthMeter } from './HealthMeter.js';
import { CoinCounter } from './CoinCounter.js';
import { XPBar } from './XPBar.js';
import { Minimap } from './Minimap.js';

export class HUD {
    constructor(scene) {
        this.scene = scene;

        // UI components
        this.healthMeter = null;
        this.coinCounter = null;
        this.xpBar = null;
        this.minimap = null;
    }

    /**
     * Create all HUD components
     * @param {object} player - Player entity to track
     */
    create(player) {
        const { width, height } = this.scene.cameras.main;

        // Create health meter (top left)
        this.healthMeter = new HealthMeter(this.scene, 20, 20);
        this.healthMeter.create(player.health.current, player.health.max);

        // Create coin counter (top right)
        this.coinCounter = new CoinCounter(this.scene, width - 100, 20);
        this.coinCounter.create(player.inventory.coins);

        // Create XP bar (bottom center)
        this.xpBar = new XPBar(this.scene, width / 2, height - 30, 250);
        this.xpBar.create(player.stats.xp, player.stats.level);

        // Create minimap (top right, below coin counter)
        this.minimap = new Minimap(this.scene, width - 120, 60);
        this.minimap.create(0, 0); // Default position, will be updated by scene
    }

    /**
     * Update all HUD components
     * @param {object} player - Player entity
     */
    update(player) {
        if (this.healthMeter) {
            this.healthMeter.update(player.health.current, player.health.max);
        }

        if (this.coinCounter) {
            this.coinCounter.update(player.inventory.coins);
        }

        if (this.xpBar) {
            this.xpBar.update(player.stats.xp, player.stats.level);
        }
    }

    /**
     * Update minimap position
     * @param {number} x - X position in grid
     * @param {number} y - Y position in grid
     */
    updateMinimapPosition(x, y) {
        if (this.minimap) {
            this.minimap.update(x, y);
        }
    }

    /**
     * Mark a minimap cell as visited
     * @param {number} x - X position in grid
     * @param {number} y - Y position in grid
     */
    markMinimapVisited(x, y) {
        if (this.minimap) {
            this.minimap.markVisited(x, y);
        }
    }

    /**
     * Mark a minimap cell as having a dungeon
     * @param {number} x - X position in grid
     * @param {number} y - Y position in grid
     */
    markMinimapDungeon(x, y) {
        if (this.minimap) {
            this.minimap.markDungeon(x, y);
        }
    }

    /**
     * Destroy all HUD components
     */
    destroy() {
        if (this.healthMeter) {
            this.healthMeter.destroy();
        }
        if (this.coinCounter) {
            this.coinCounter.destroy();
        }
        if (this.xpBar) {
            this.xpBar.destroy();
        }
        if (this.minimap) {
            this.minimap.destroy();
        }
    }
}
