# Health and Damage System Integration Guide

This document explains how to integrate the health and damage systems into your game scenes.

## Systems Overview

The health and damage system consists of four main components:

1. **HealthSystem** - Manages health tracking and modifications
2. **DamageSystem** - Handles damage application and enemy collision detection
3. **CollectionSystem** - Manages collectible detection and collection (including health power-ups)
4. **RespawnSystem** - Handles player death and respawning

## Integration Example

Here's how to integrate these systems into a Phaser scene:

```javascript
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // Initialize system references
        this.collisionSystem = null;
        this.healthSystem = null;
        this.damageSystem = null;
        this.collectionSystem = null;
        this.respawnSystem = null;
        
        this.player = null;
        this.enemies = [];
        this.collectibles = [];
    }

    create() {
        // 1. Initialize collision system first (required by other systems)
        this.collisionSystem = new CollisionSystem(this);
        
        // 2. Initialize health system
        this.healthSystem = new HealthSystem();
        
        // 3. Initialize damage system
        this.damageSystem = new DamageSystem(this, this.collisionSystem, this.healthSystem);
        
        // 4. Initialize collection system
        this.collectionSystem = new CollectionSystem(this, this.collisionSystem);
        
        // 5. Initialize respawn system
        this.respawnSystem = new RespawnSystem(this);
        this.respawnSystem.setSpawnPoint(400, 300); // Set starting position
        
        // 6. Create player
        this.player = new Player(this, 400, 300);
        this.player.createSprite();
        
        // 7. Register player with health system (optional - player has built-in health)
        this.healthSystem.registerEntity(this.player, this.player.health.current, this.player.health.max);
        
        // 8. Create enemies and register them
        this.createEnemies();
        
        // 9. Create collectibles
        this.createCollectibles();
        
        // 10. Set up health meter pulse callback (for UI)
        this.damageSystem.setHealthMeterPulseCallback(() => {
            this.pulseHealthMeter();
        });
    }
    
    createEnemies() {
        // Create some enemies
        const enemy1 = new Enemy(this, 500, 300, 'zombie', {
            health: 3,
            damage: 1,
            speed: 30
        });
        enemy1.createSprite();
        enemy1.setTarget(this.player);
        
        // Register enemy with damage system
        this.damageSystem.registerEnemy(enemy1);
        
        this.enemies.push(enemy1);
    }
    
    createCollectibles() {
        // Create health power-up
        const healthPowerUp = new Collectible(this, 300, 200, 'health', {
            value: 2 // Heals 2 health points
        });
        healthPowerUp.createSprite();
        
        // Register with collection system
        this.collectionSystem.addCollectible(healthPowerUp);
        
        this.collectibles.push(healthPowerUp);
        
        // Create coin
        const coin = new Collectible(this, 500, 200, 'coin', {
            value: 5 // Worth 5 coins
        });
        coin.createSprite();
        this.collectionSystem.addCollectible(coin);
        this.collectibles.push(coin);
    }
    
    pulseHealthMeter() {
        // Implement health meter pulse animation
        // This will be called when player takes damage
        console.log('Health meter pulse!');
        
        // Example: if you have a health meter sprite
        // this.tweens.add({
        //     targets: this.healthMeterSprite,
        //     scale: 1.2,
        //     duration: 100,
        //     yoyo: true,
        //     ease: 'Power2'
        // });
    }
    
    update(time, delta) {
        // Update player
        if (this.player) {
            this.player.update(delta);
        }
        
        // Update enemies
        for (let enemy of this.enemies) {
            if (enemy.active) {
                enemy.update(delta);
            }
        }
        
        // Update damage system (checks enemy collisions with player)
        this.damageSystem.update(this.player);
        
        // Update collection system (checks collectible collisions)
        this.collectionSystem.update(this.player);
        
        // Update respawn system (checks for death and handles respawn)
        this.respawnSystem.update(this.player);
        
        // Clean up inactive enemies
        this.enemies = this.enemies.filter(enemy => {
            if (!enemy.active) {
                this.damageSystem.unregisterEnemy(enemy);
                return false;
            }
            return true;
        });
    }
}
```

## Key Features

### Health Management

The player has built-in health tracking:
```javascript
player.health.current  // Current health
player.health.max      // Maximum health
player.takeDamage(amount)  // Apply damage
player.heal(amount)    // Heal player
```

### Damage Application

The DamageSystem automatically:
- Detects enemy collision with player
- Applies damage considering player's defense
- Enforces damage cooldown (prevents rapid repeated damage)
- Triggers health meter pulse callback
- Plays damage sound effects (if available)

### Health Power-ups

Create health collectibles that respect max health:
```javascript
const healthPowerUp = new Collectible(this, x, y, 'health', {
    value: 2  // Heals 2 HP
});
```

When collected, healing automatically respects max health:
```javascript
// Player at 4/6 health collects +2 health power-up
// Result: 6/6 health (capped at max)
```

### Death and Respawn

The RespawnSystem automatically:
- Detects when health reaches zero
- Plays death animation
- Respawns player at spawn point after delay
- Restores health to maximum
- **Preserves all collectibles and coins** (key requirement!)

### Damage Cooldown

Enemies can only damage the player once per second (configurable):
```javascript
this.damageSystem.defaultCooldown = 1000; // milliseconds
```

This prevents the player from taking damage every frame when touching an enemy.

## Testing the System

You can test the health system by:

1. **Taking Damage**: Walk into an enemy to take damage
2. **Collecting Health**: Pick up health power-ups to heal
3. **Death**: Let health reach zero to test respawn
4. **Collectible Preservation**: Collect coins, die, and verify coins are preserved

## Scene Integration Checklist

- [ ] Initialize CollisionSystem
- [ ] Initialize HealthSystem
- [ ] Initialize DamageSystem with collision and health systems
- [ ] Initialize CollectionSystem with collision system
- [ ] Initialize RespawnSystem and set spawn point
- [ ] Create player
- [ ] Create and register enemies with DamageSystem
- [ ] Create and register collectibles with CollectionSystem
- [ ] Set health meter pulse callback
- [ ] Update all systems in update() method
- [ ] Clean up inactive entities

## Next Steps

To complete the health and damage system integration:

1. **Create HUD** (Task 9) - Display health meter, coin counter, XP bar
2. **Add Visual Effects** (Task 17) - Particle effects for damage and collection
3. **Add Audio** (Task 18) - Sound effects for damage, healing, death
4. **Implement Progression** (Task 11) - XP and leveling system

## Files Created

- `src/systems/HealthSystem.js` - Health tracking and modification
- `src/systems/DamageSystem.js` - Damage application and enemy collision
- `src/entities/Collectible.js` - Collectible items (coins, health, weapons, armor)
- `src/systems/CollectionSystem.js` - Collectible detection and collection
- `src/systems/RespawnSystem.js` - Death detection and respawning
