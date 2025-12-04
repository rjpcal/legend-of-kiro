// Minimap - UI component for displaying player position in the world
// Displays 6x6 grid representation and highlights current screen position

class Minimap {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        // Grid configuration
        this.gridWidth = 6;
        this.gridHeight = 6;
        this.cellSize = 12;
        this.cellSpacing = 2;
        
        // Current position
        this.currentX = 0;
        this.currentY = 0;
        
        // Visual elements
        this.container = null;
        this.cells = [];
        this.highlightCell = null;
    }

    /**
     * Create the minimap UI
     * @param {number} currentX - Initial X position in grid
     * @param {number} currentY - Initial Y position in grid
     */
    create(currentX = 0, currentY = 0) {
        this.currentX = currentX;
        this.currentY = currentY;
        
        // Create container
        this.container = this.scene.add.container(this.x, this.y);
        this.container.setDepth(1000);
        
        // Create grid cells
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                const cellX = col * (this.cellSize + this.cellSpacing);
                const cellY = row * (this.cellSize + this.cellSpacing);
                
                // Create cell background
                const cell = this.scene.add.rectangle(
                    cellX,
                    cellY,
                    this.cellSize,
                    this.cellSize,
                    0x333333
                );
                cell.setStrokeStyle(1, 0x666666);
                this.container.add(cell);
                
                this.cells.push({
                    rect: cell,
                    gridX: col,
                    gridY: row
                });
            }
        }
        
        // Create highlight cell (current position)
        this.highlightCell = this.scene.add.rectangle(
            0, 0,
            this.cellSize,
            this.cellSize,
            0x790ECB // Kiro purple
        );
        this.highlightCell.setStrokeStyle(2, 0x9a3ee0);
        this.container.add(this.highlightCell);
        
        // Update highlight position
        this.updateHighlight();
    }

    /**
     * Update the highlight position
     */
    updateHighlight() {
        // Clamp position to grid bounds
        const x = Math.max(0, Math.min(this.gridWidth - 1, this.currentX));
        const y = Math.max(0, Math.min(this.gridHeight - 1, this.currentY));
        
        // Calculate highlight position
        const highlightX = x * (this.cellSize + this.cellSpacing);
        const highlightY = y * (this.cellSize + this.cellSpacing);
        
        this.highlightCell.setPosition(highlightX, highlightY);
    }

    /**
     * Update current position
     * @param {number} x - New X position in grid
     * @param {number} y - New Y position in grid
     */
    update(x, y) {
        this.currentX = x;
        this.currentY = y;
        
        // Update highlight
        this.updateHighlight();
    }

    /**
     * Mark a cell as visited (optional feature for exploration tracking)
     * @param {number} x - X position in grid
     * @param {number} y - Y position in grid
     */
    markVisited(x, y) {
        const cell = this.cells.find(c => c.gridX === x && c.gridY === y);
        if (cell) {
            cell.rect.setFillStyle(0x555555);
        }
    }

    /**
     * Mark a cell as having a dungeon entrance
     * @param {number} x - X position in grid
     * @param {number} y - Y position in grid
     */
    markDungeon(x, y) {
        const cell = this.cells.find(c => c.gridX === x && c.gridY === y);
        if (cell) {
            // Add a small marker for dungeon
            const markerX = x * (this.cellSize + this.cellSpacing) + this.cellSize / 2;
            const markerY = y * (this.cellSize + this.cellSpacing) + this.cellSize / 2;
            
            const marker = this.scene.add.circle(markerX, markerY, 3, 0xFF0000);
            this.container.add(marker);
        }
    }

    /**
     * Destroy the minimap
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Minimap;
}
