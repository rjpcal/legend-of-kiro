// OverworldScene - Main overworld gameplay

class OverworldScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OverworldScene' });
        this.player = null;
        this.cursors = null;
        this.wasd = null;
        this.attackKey = null;
        this.rangedAttackKey = null;
        this.collisionSystem = null;
        this.collectionSystem = null;
        this.rippleEffect = null;
        this.animationManager = null;
        this.hud = null;
        this.obstacles = [];
        this.enemies = [];
        this.collectibles = [];
        this.projectiles = [];
        this.attackHitboxes = [];
    }

    create() {
        const { width, height } = this.cameras.main;

        // Initialize systems
        this.collisionSystem = new CollisionSystem(this);
        this.collectionSystem = new CollectionSystem(this, this.collisionSystem);
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
        
        // Set up attack keys
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.rangedAttackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        
        // Handle attack key press
        this.attackKey.on('down', () => {
            if (this.player) {
                const attackHitbox = this.player.attack();
                if (attackHitbox) {
                    this.handleMeleeAttack(attackHitbox);
                }
            }
        });
        
        // Handle ranged attack key press
        this.rangedAttackKey.on('down', () => {
            if (this.player) {
                const projectile = this.player.rangedAttack();
                if (projectile) {
                    this.projectiles.push(projectile);
                }
            }
        });

        // Create some test enemies
        this.createTestEnemies();

        // Create some test collectibles
        this.createTestCollectibles();

        // Create HUD
        this.hud = new HUD(this);
        this.hud.create(this.player);
        
        // Mark starting position as visited on minimap
        this.hud.markMinimapVisited(0, 0);
    }

    /**
     * Create test collectibles for collection testing
     */
    createTestCollectibles() {
        const { width, height } = this.cameras.main;

        // Create some test collectibles
        const collectibleData = [
            { x: width / 2 + 50, y: height / 2 - 100, type: 'coin', value: 5 },
            { x: width / 2 - 50, y: height / 2 - 100, type: 'coin', value: 10 },
            { x: width / 2, y: height / 2 + 150, type: 'health', value: 2 },
            { x: width / 2 + 200, y: height / 2, type: 'weapon', config: { name: 'Iron Sword', damage: 3 } },
            { x: width / 2 - 200, y: height / 2, type: 'armor', config: { name: 'Leather Armor', defense: 2 } }
        ];

        for (let data of collectibleData) {
            const collectible = new Collectible(this, data.x, data.y, data.type, data.config || { value: data.value });
            collectible.createSprite();
            this.collectibles.push(collectible);
            this.collectionSystem.addCollectible(collectible);
        }
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

    /**
     * Create test enemies for combat testing
     */
    createTestEnemies() {
        const { width, height } = this.cameras.main;

        // Create a few test enemies
        const enemyPositions = [
            { x: width / 2 + 100, y: height / 2 - 50 },
            { x: width / 2 - 100, y: height / 2 + 50 }
        ];

        for (let pos of enemyPositions) {
            const enemy = new Enemy(this, pos.x, pos.y, 'zombie', {
                health: 3,
                damage: 1,
                speed: 30
            });
            enemy.createSprite();
            enemy.setTarget(this.player);
            this.enemies.push(enemy);
        }
    }

    /**
     * Handle melee attack
     * @param {object} attackHitbox - Attack hitbox with x, y, width, height, damage
     */
    handleMeleeAttack(attackHitbox) {
        // Store attack hitbox temporarily for collision detection
        attackHitbox.lifetime = 100; // milliseconds
        attackHitbox.createdAt = Date.now();
        this.attackHitboxes.push(attackHitbox);
        
        // Visual feedback for attack (optional - can be replaced with animation)
        if (this.add && this.tweens) {
            const attackVisual = this.add.rectangle(
                attackHitbox.x + attackHitbox.width / 2,
                attackHitbox.y + attackHitbox.height / 2,
                attackHitbox.width,
                attackHitbox.height,
                0x790ECB,
                0.3
            );
            attackVisual.setDepth(20);
            
            // Fade out attack visual
            this.tweens.add({
                targets: attackVisual,
                alpha: 0,
                duration: 100,
                onComplete: () => {
                    attackVisual.destroy();
                }
            });
        }
        
        // Check for hits on enemies
        this.checkAttackHits(attackHitbox);
    }

    /**
     * Check if attack hitbox hits any enemies
     * @param {object} attackHitbox - Attack hitbox
     */
    checkAttackHits(attackHitbox) {
        for (let enemy of this.enemies) {
            if (!enemy.active || enemy.isFriendly) {
                continue;
            }
            
            const enemyHitbox = enemy.getHitbox();
            
            // Check AABB collision
            if (this.collisionSystem.checkAABB(attackHitbox, enemyHitbox)) {
                // Hit detected - apply damage
                enemy.takeDamage(attackHitbox.damage);
                
                // Award XP if enemy was defeated (Property 13, Requirements 4.3)
                if (enemy.health.current === 0) {
                    const leveledUp = this.player.addXP(enemy.getXPReward());
                    
                    // Update HUD to reflect XP and potential level up
                    if (this.hud) {
                        this.hud.update(this.player);
                    }
                }
            }
        }
    }

    /**
     * Check if projectile hits any enemies
     * @param {Projectile} projectile - Projectile to check
     */
    checkProjectileHits(projectile) {
        const projectileHitbox = projectile.getHitbox();
        
        for (let enemy of this.enemies) {
            if (!enemy.active || enemy.isFriendly) {
                continue;
            }
            
            const enemyHitbox = enemy.getHitbox();
            
            // Check AABB collision
            if (this.collisionSystem.checkAABB(projectileHitbox, enemyHitbox)) {
                // Hit detected - apply damage
                enemy.takeDamage(projectile.damage);
                
                // Award XP if enemy was defeated (Property 13, Requirements 4.3)
                if (enemy.health.current === 0) {
                    const leveledUp = this.player.addXP(enemy.getXPReward());
                    
                    // Update HUD to reflect XP and potential level up
                    if (this.hud) {
                        this.hud.update(this.player);
                    }
                }
                
                // Projectile starts returning after hit
                projectile.onHitEnemy();
                
                // Only hit one enemy per frame
                break;
            }
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
            
            // Update HUD
            if (this.hud) {
                this.hud.update(this.player);
            }
        }

        // Update enemies
        for (let enemy of this.enemies) {
            if (enemy.active) {
                enemy.update(delta);
            }
        }

        // Update projectiles
        for (let projectile of this.projectiles) {
            if (projectile.active) {
                projectile.update(delta);
                
                // Check projectile collision with enemies
                if (!projectile.returning) {
                    this.checkProjectileHits(projectile);
                }
            }
        }

        // Clean up old attack hitboxes
        const now = Date.now();
        this.attackHitboxes = this.attackHitboxes.filter(hitbox => {
            return (now - hitbox.createdAt) < hitbox.lifetime;
        });

        // Clean up inactive enemies
        this.enemies = this.enemies.filter(enemy => enemy.active);

        // Clean up inactive projectiles
        this.projectiles = this.projectiles.filter(projectile => projectile.active);

        // Update systems
        if (this.collisionSystem) {
            this.collisionSystem.update();
        }
        
        if (this.collectionSystem) {
            this.collectionSystem.update(this.player);
        }
        
        if (this.rippleEffect) {
            this.rippleEffect.update(delta);
        }
        
        if (this.animationManager) {
            this.animationManager.update();
        }
    }
}
