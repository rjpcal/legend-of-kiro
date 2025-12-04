// OverworldScene - Main overworld gameplay

class OverworldScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OverworldScene' });
        this.player = null;
        this.cursors = null;
        this.wasd = null;
        this.collisionSystem = null;
        this.rippleEffect = null;
        this.animationManager = null;
        this.obstacles = [];
    }

    create() {
        const { width, height } = this.cameras.main;

        // Initialize systems
        this.collisionSystem = new CollisionSystem(this);
        this.rippleEffect = new RippleEffect(this);
        this.animationManager = new AnimationManager(this);

        // Create player at center of screen
        this.player = new Player(this, width / 2, height / 2);
        this.player.createSprite();
        
        // Initialize player in animation manager
        if (this.animationManager) {
            this.animationManager.initializeEntity(this.player, 'idle');
        }

        // Create some test obstacles
        this.createTestObstacles();

        // Set up keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Set up WASD keys
        this.wasd = {
            W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

        // Placeholder text
        const text = this.add.text(
            16,
            16,
            'Use Arrow Keys or WASD to move\nCollision detection active!',
            {
                fontSize: '16px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }
        );
    }

    /**
     * Create test obstacles for collision testing
     */
    createTestObstacles() {
        const { width, height } = this.cameras.main;

        // Create a few obstacles around the screen
        const obstaclePositions = [
            { x: width / 2, y: height / 2 - 100, w: 64, h: 64 },
            { x: width / 2 - 150, y: height / 2, w: 48, h: 48 },
            { x: width / 2 + 150, y: height / 2, w: 48, h: 48 },
            { x: width / 2, y: height / 2 + 100, w: 80, h: 32 }
        ];

        for (let pos of obstaclePositions) {
            const obstacle = new Obstacle(this, pos.x, pos.y, pos.w, pos.h);
            obstacle.createSprite();
            this.obstacles.push(obstacle);
            this.collisionSystem.addObstacle(obstacle);
        }
    }

    update(time, delta) {
        if (this.player) {
            // Handle player input
            this.player.handleInput(this.cursors, this.wasd, delta);
            
            // Check collision before applying movement
            if (this.player.isMoving) {
                // Check if intended movement would cause collision
                if (this.collisionSystem.checkIntendedCollision(this.player)) {
                    // Cancel movement if collision detected
                    this.player.cancelMovement();
                } else {
                    // Apply movement if no collision
                    this.player.applyMovement();
                }
            }
            
            // Update player
            this.player.update(delta);
        }

        // Update systems
        if (this.collisionSystem) {
            this.collisionSystem.update();
        }
        
        if (this.rippleEffect) {
            this.rippleEffect.update(delta);
        }
        
        if (this.animationManager) {
            this.animationManager.update();
        }
    }
}
