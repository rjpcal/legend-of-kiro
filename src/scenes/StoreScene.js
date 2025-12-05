// StoreScene - Store for purchasing items

export class StoreScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StoreScene' });
        this.storeId = null;
        this.storeData = null;
        this.player = null;
        this.selectedItemIndex = 0;
        this.itemElements = [];
        this.errorMessage = null;
    }

    init(data) {
        this.storeId = data.storeId;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Get world configuration from registry
        const worldConfig = this.registry.get('worldConfig');
        if (!worldConfig) {
            console.error('World configuration not found in registry');
            return;
        }

        // Get store data from configuration
        this.storeData = worldConfig.getStoreData(this.storeId);
        if (!this.storeData) {
            console.error(`Store ${this.storeId} not found in configuration`);
            return;
        }

        // Start background music
        const audioManager = this.registry.get('audioManager');
        if (audioManager) {
            audioManager.playMusic(true);
        }

        // Get player state from registry
        const playerState = this.registry.get('playerState');
        if (!playerState) {
            console.error('Player state not found in registry');
            return;
        }

        // Create a simple player object with the state
        this.player = {
            inventory: playerState.inventory,
            stats: playerState.stats,
            health: playerState.health,
        };

        // Create background
        const background = this.add.rectangle(0, 0, width, height, 0x1a1a1a);
        background.setOrigin(0, 0);

        // Create store title
        const title = this.add.text(width / 2, 50, this.storeData.name || 'Store', {
            fontSize: '32px',
            fill: '#790ECB',
            fontFamily: 'Arial',
            fontStyle: 'bold',
        });
        title.setOrigin(0.5);

        // Display coin count
        const coinText = this.add.text(width / 2, 100, `Coins: ${this.player.inventory.coins}`, {
            fontSize: '20px',
            fill: '#FFD700',
            fontFamily: 'Arial',
        });
        coinText.setOrigin(0.5);
        this.coinText = coinText;

        // Display inventory items
        this.renderInventory();

        // Display instructions
        const instructions = this.add.text(
            width / 2,
            height - 80,
            'Arrow Keys: Navigate | SPACE: Purchase | ESC: Exit',
            {
                fontSize: '16px',
                fill: '#CCCCCC',
                fontFamily: 'Arial',
            }
        );
        instructions.setOrigin(0.5);

        // Error message placeholder
        this.errorMessage = this.add.text(width / 2, height - 40, '', {
            fontSize: '16px',
            fill: '#FF0000',
            fontFamily: 'Arial',
        });
        this.errorMessage.setOrigin(0.5);

        // Set up keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.selectKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.exitKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        // Handle navigation
        this.cursors.up.on('down', () => this.navigateUp());
        this.cursors.down.on('down', () => this.navigateDown());

        // Handle purchase
        this.selectKey.on('down', () => this.purchaseSelectedItem());

        // Handle exit
        this.exitKey.on('down', () => this.exitStore());

        // Highlight first item
        this.updateSelection();
    }

    /**
     * Render store inventory items
     */
    renderInventory() {
        const { width, height } = this.cameras.main;
        const startY = 150;
        const itemHeight = 80;

        if (!this.storeData.inventory || this.storeData.inventory.length === 0) {
            const emptyText = this.add.text(width / 2, height / 2, 'No items available', {
                fontSize: '20px',
                fill: '#CCCCCC',
                fontFamily: 'Arial',
            });
            emptyText.setOrigin(0.5);
            return;
        }

        this.storeData.inventory.forEach((item, index) => {
            const y = startY + index * itemHeight;

            // Create item container
            const container = this.add.container(width / 2, y);

            // Background rectangle for item
            const bg = this.add.rectangle(0, 0, 600, 70, 0x2a2a2a);
            bg.setStrokeStyle(2, 0x444444);

            // Item name
            const nameText = this.add.text(-280, -20, item.name, {
                fontSize: '18px',
                fill: '#FFFFFF',
                fontFamily: 'Arial',
                fontStyle: 'bold',
            });

            // Item description
            const descText = this.add.text(-280, 5, item.description || '', {
                fontSize: '14px',
                fill: '#CCCCCC',
                fontFamily: 'Arial',
            });

            // Item stats
            let statsText = '';
            if (item.type === 'weapon') {
                statsText = `Damage: ${item.damage}`;
            } else if (item.type === 'armor') {
                statsText = `Defense: ${item.defense}`;
            }
            const stats = this.add.text(100, -10, statsText, {
                fontSize: '16px',
                fill: '#790ECB',
                fontFamily: 'Arial',
            });

            // Item cost
            const costText = this.add.text(220, -10, `${item.cost} coins`, {
                fontSize: '16px',
                fill: '#FFD700',
                fontFamily: 'Arial',
            });

            container.add([bg, nameText, descText, stats, costText]);

            this.itemElements.push({
                container: container,
                background: bg,
                item: item,
            });
        });
    }

    /**
     * Navigate up in item list
     */
    navigateUp() {
        if (this.itemElements.length === 0) return;

        this.selectedItemIndex =
            (this.selectedItemIndex - 1 + this.itemElements.length) % this.itemElements.length;
        this.updateSelection();
        this.clearErrorMessage();
    }

    /**
     * Navigate down in item list
     */
    navigateDown() {
        if (this.itemElements.length === 0) return;

        this.selectedItemIndex = (this.selectedItemIndex + 1) % this.itemElements.length;
        this.updateSelection();
        this.clearErrorMessage();
    }

    /**
     * Update visual selection highlight
     */
    updateSelection() {
        // Reset all backgrounds
        this.itemElements.forEach(element => {
            element.background.setStrokeStyle(2, 0x444444);
        });

        // Highlight selected item
        if (this.itemElements[this.selectedItemIndex]) {
            this.itemElements[this.selectedItemIndex].background.setStrokeStyle(3, 0x790ecb);
        }
    }

    /**
     * Purchase the selected item
     */
    purchaseSelectedItem() {
        if (this.itemElements.length === 0) return;

        const selectedElement = this.itemElements[this.selectedItemIndex];
        const item = selectedElement.item;

        // Validate sufficient coins (Property 29, Requirements 8.3)
        if (this.player.inventory.coins < item.cost) {
            this.showErrorMessage('Insufficient coins!');
            return;
        }

        // Deduct cost and add item to inventory (Property 28, Requirements 8.2)
        this.player.inventory.coins -= item.cost;

        // Add item to inventory based on type
        if (item.type === 'weapon') {
            // Create weapon object
            const weapon = {
                id: item.id,
                name: item.name,
                damage: item.damage,
                type: 'weapon',
            };
            this.player.inventory.items.push(weapon);

            // Auto-equip if no weapon equipped or if better
            if (
                !this.player.inventory.equippedWeapon ||
                weapon.damage > this.player.inventory.equippedWeapon.damage
            ) {
                this.equipWeapon(weapon);
            }
        } else if (item.type === 'armor') {
            // Create armor object
            const armor = {
                id: item.id,
                name: item.name,
                defense: item.defense,
                type: 'armor',
            };
            this.player.inventory.items.push(armor);

            // Auto-equip if no armor equipped or if better
            if (
                !this.player.inventory.equippedArmor ||
                armor.defense > this.player.inventory.equippedArmor.defense
            ) {
                this.equipArmor(armor);
            }
        }

        // Update coin display
        this.coinText.setText(`Coins: ${this.player.inventory.coins}`);

        // Show success message
        this.showErrorMessage(`Purchased ${item.name}!`, '#00FF00');

        // Update player state in registry
        this.updatePlayerState();
    }

    /**
     * Equip a weapon (Property 30, Requirements 8.4)
     * @param {object} weapon - Weapon to equip
     */
    equipWeapon(weapon) {
        this.player.inventory.equippedWeapon = weapon;
        this.player.stats.damage = weapon.damage;
    }

    /**
     * Equip armor (Property 31, Requirements 8.5)
     * @param {object} armor - Armor to equip
     */
    equipArmor(armor) {
        this.player.inventory.equippedArmor = armor;
        this.player.stats.defense = armor.defense;
    }

    /**
     * Show error or success message
     * @param {string} message - Message to display
     * @param {string} color - Text color (default red)
     */
    showErrorMessage(message, color = '#FF0000') {
        if (this.errorMessage) {
            this.errorMessage.setText(message);
            this.errorMessage.setColor(color);

            // Clear message after 2 seconds
            this.time.delayedCall(2000, () => {
                this.clearErrorMessage();
            });
        }
    }

    /**
     * Clear error message
     */
    clearErrorMessage() {
        if (this.errorMessage) {
            this.errorMessage.setText('');
        }
    }

    /**
     * Update player state in registry
     */
    updatePlayerState() {
        const playerState = this.registry.get('playerState');
        if (playerState) {
            playerState.inventory = this.player.inventory;
            playerState.stats = this.player.stats;
            this.registry.set('playerState', playerState);
        }
    }

    /**
     * Exit store and return to overworld
     */
    exitStore() {
        // Update player state in registry
        this.updatePlayerState();

        // Return to overworld
        this.scene.start('OverworldScene');
    }
}
