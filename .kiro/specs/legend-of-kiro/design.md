# Design Document

## Overview

Legend of Kiro is a 2D top-down adventure game built with Phaser.js that combines exploration, combat, and puzzle-solving mechanics. The game features a data-driven architecture where world layouts, dungeon structures, and game content are defined in JSON configuration files, allowing for easy modification and expansion. The system uses a component-based entity system for game objects, a state machine for game flow management, and a collision detection system for physics interactions.

## Architecture

### High-Level Architecture

The game follows a layered architecture pattern:

1. **Presentation Layer**: Phaser.js rendering engine, sprite management, animation system, UI components
2. **Game Logic Layer**: Entity management, combat system, progression system, puzzle mechanics
3. **Data Layer**: JSON configuration loader, save/load system, game state management
4. **Input Layer**: Keyboard/gamepad input handling, action mapping

### Core Systems

- **Scene Management**: Phaser scenes for different game states (MainMenu, Overworld, Dungeon, Store, GameOver)
- **Entity System**: Base entity class with components for position, sprite, collision, health, inventory
- **Combat System**: Attack handling, damage calculation, enemy AI, weapon management
- **Progression System**: XP tracking, level calculation, health scaling
- **World System**: Screen-based world grid, room transitions, dungeon generation from JSON
- **Collision System**: Spatial partitioning for efficient collision detection, hitbox management
- **Audio System**: Sound effect manager, background music controller with enable/disable
- **Configuration System**: JSON parser for world data, validation, hot-reloading support

## Components and Interfaces

### Entity Component System

```javascript
// Base Entity
class Entity {
  constructor(scene, x, y, sprite)
  update(delta)
  destroy()
}

// Player (Kiro)
class Player extends Entity {
  move(direction)
  attack()
  rangedAttack()
  takeDamage(amount)
  collectItem(item)
  levelUp()
}

// Enemy
class Enemy extends Entity {
  ai()
  attack()
  defeat()
  convertToFriendly()
}

// Boss extends Enemy with enhanced stats and patterns
class Boss extends Enemy {
  executeAttackPattern()
}
```

### World Management

```javascript
// World Configuration Loader
class WorldConfig {
  loadFromJSON(filepath)
  getOverworldScreen(x, y)
  getDungeonData(dungeonId)
  getStoreInventory(storeId)
}

// Screen Manager
class ScreenManager {
  currentScreen: {x, y}
  transitionToScreen(direction)
  loadScreen(screenData)
}

// Dungeon Manager
class DungeonManager {
  currentRoom: Room
  loadDungeon(dungeonId)
  transitionToRoom(roomId)
  checkRoomCompletion()
}
```

### Combat System

```javascript
// Weapon
class Weapon {
  damage: number
  range: number
  attackSpeed: number
  canThrow: boolean
  attack(direction)
  throw(direction)
}

// Combat Manager
class CombatManager {
  registerAttack(attacker, target)
  calculateDamage(weapon, target)
  applyDamage(entity, amount)
  checkHit(attackHitbox, targetHitbox)
}
```

### Progression System

```javascript
// Progression Manager
class ProgressionManager {
  xp: number
  level: number
  coins: number
  calculateLevelThreshold(level)
  addXP(amount)
  addCoins(amount)
  spendCoins(amount)
}
```

### UI Components

```javascript
// HUD
class HUD {
  healthMeter: HealthMeter
  coinCounter: CoinCounter
  xpBar: XPBar
  minimap: Minimap
  update()
}

// Health Meter
class HealthMeter {
  currentHealth: number
  maxHealth: number
  pulse()
  updateDisplay()
}
```

## Data Models

### World Configuration JSON Structure

```json
{
  "overworld": {
    "size": {"width": 6, "height": 6},
    "screens": [
      {
        "x": 0, "y": 0,
        "terrain": "grass",
        "obstacles": [...],
        "enemies": [...],
        "collectibles": [...],
        "dungeonEntrance": null
      }
    ]
  },
  "dungeons": [
    {
      "id": 1,
      "name": "Haunted Manor",
      "entranceScreen": {"x": 2, "y": 3},
      "rooms": [
        {
          "id": 1,
          "type": "combat",
          "enemies": [...],
          "doors": [...],
          "isBossRoom": false
        }
      ]
    }
  ],
  "stores": [
    {
      "id": 1,
      "location": {"x": 1, "y": 1},
      "inventory": [
        {"type": "weapon", "name": "Iron Sword", "cost": 50, "damage": 15}
      ]
    }
  ]
}
```

### Entity Data Model

```javascript
{
  id: string,
  type: "player" | "enemy" | "boss" | "collectible",
  position: {x: number, y: number},
  sprite: {
    key: string,
    frame: number,
    animations: string[]
  },
  health: {current: number, max: number},
  stats: {
    damage: number,
    defense: number,
    speed: number
  },
  inventory: Item[],
  state: "idle" | "moving" | "attacking" | "dead"
}
```

### Save Data Model

```javascript
{
  playerData: {
    position: {screen: {x, y}, local: {x, y}},
    health: {current, max},
    xp: number,
    level: number,
    coins: number,
    inventory: Item[],
    equippedWeapon: Weapon,
    equippedArmor: Armor
  },
  worldState: {
    collectedItems: string[],
    defeatedEnemies: string[],
    completedDungeons: number[],
    unlockedDoors: string[]
  },
  settings: {
    musicEnabled: boolean,
    sfxEnabled: boolean
  }
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Movement and Collision Properties

**Property 1: Movement direction correspondence**
*For any* movement input (up, down, left, right), Kiro's position should change in the corresponding direction by the movement speed amount
**Validates: Requirements 1.1**

**Property 2: Obstacle collision prevention**
*For any* obstacle position and Kiro's position, if moving Kiro would cause overlap with the obstacle, then Kiro's position should remain unchanged
**Validates: Requirements 1.3, 9.4**

**Property 3: Movement state animation**
*For any* movement state (moving or idle), the animation system should display the corresponding animation (movement frames when moving, idle frame when stopped)
**Validates: Requirements 1.2, 1.5, 12.2**

### Combat Properties

**Property 4: Melee attack direction**
*For any* direction Kiro is facing, pressing the attack button should create an attack hitbox in that direction
**Validates: Requirements 2.1**

**Property 5: Attack defeats enemies**
*For any* enemy, when Kiro's attack hitbox (melee or ranged) overlaps with the enemy's hitbox, the enemy should be removed from the game and marked as defeated
**Validates: Requirements 2.2, 2.4, 9.2**

**Property 6: Ranged attack health requirement**
*For any* health value less than maximum, attempting a ranged attack should not throw the weapon; for maximum health, the ranged attack should throw the weapon
**Validates: Requirements 2.3**

**Property 7: Weapon return after throw**
*For any* thrown weapon that hits an enemy, the weapon should return to Kiro's inventory after the hit
**Validates: Requirements 2.4**

### Health and Damage Properties

**Property 8: Damage reduces health**
*For any* enemy attack with damage value D that hits Kiro with current health H, Kiro's health should become max(0, H - D)
**Validates: Requirements 3.2, 9.1**

**Property 9: Healing respects maximum**
*For any* health power-up with healing value V collected when Kiro has current health H and maximum health M, Kiro's health should become min(M, H + V)
**Validates: Requirements 3.3**

**Property 10: Death respawn preserves collectibles**
*For any* game state where health reaches zero with collected items I and coins C, after respawn Kiro should have the same items I and coins C but be at the starting position
**Validates: Requirements 3.4**

**Property 11: Level up increases max health**
*For any* level up event or dungeon completion, the maximum health value should increase by the configured amount
**Validates: Requirements 3.5, 7.2**

### Collection and Progression Properties

**Property 12: Collectible acquisition**
*For any* collectible (coin, health, item) at position P, when Kiro's hitbox overlaps with the collectible's hitbox, the collectible should be added to inventory/counters and removed from the world
**Validates: Requirements 4.1, 9.3**

**Property 13: Enemy defeat grants XP**
*For any* enemy with XP value X, when the enemy is defeated, the player's XP should increase by X
**Validates: Requirements 4.3**

**Property 14: XP threshold triggers level up**
*For any* XP value that reaches or exceeds the level threshold, a level up event should trigger and the level counter should increment
**Validates: Requirements 4.4**

**Property 15: UI reflects game state**
*For any* game state with coins C, XP X, health H, the UI should display values matching C, X, and H
**Validates: Requirements 4.5**

### World Navigation Properties

**Property 16: Screen edge transitions**
*For any* screen position (x, y) in the overworld grid, when Kiro reaches the edge in direction D, the game should transition to the adjacent screen in direction D if it exists
**Validates: Requirements 5.1**

**Property 17: Minimap position accuracy**
*For any* screen position (x, y) in the overworld, the minimap should highlight the cell at coordinates (x, y)
**Validates: Requirements 5.3**

**Property 18: Dungeon entrance transitions**
*For any* dungeon entrance at position P, when Kiro's position overlaps with P, the game should transition from overworld to the corresponding dungeon
**Validates: Requirements 5.4**

### Configuration and World Generation Properties

**Property 19: World configuration round-trip**
*For any* valid world configuration JSON, loading and then serializing the world state should produce an equivalent structure with the same screens, dungeons, and entities
**Validates: Requirements 5.5, 6.1, 11.2, 11.3**

**Property 20: Configuration hot-reload**
*For any* modified world configuration, reloading the game should reflect the changes without requiring code modifications
**Validates: Requirements 11.4**

### Dungeon and Puzzle Properties

**Property 21: Room completion unlocks doors**
*For any* room with completion objective O (defeat all enemies, activate all switches), when O is satisfied, all locked doors in the room should unlock
**Validates: Requirements 6.2**

**Property 22: Block pushing physics**
*For any* pushable block at position P, pushing in direction D should move the block to position P + D unless an obstacle exists at P + D
**Validates: Requirements 6.3**

**Property 23: Switch activation**
*For any* switch at position S and block at position B, when B == S, the switch should activate and trigger its associated mechanism
**Validates: Requirements 6.4**

**Property 24: Boss spawning**
*For any* dungeon's final room, entering the room should spawn a boss enemy with stats higher than regular enemies
**Validates: Requirements 6.5, 7.1**

**Property 25: Boss defeat completes dungeon**
*For any* boss enemy, when defeated, the dungeon should be marked as complete and max health should increase
**Validates: Requirements 7.2**

**Property 26: Boss attack patterns differ**
*For any* boss enemy, the attack pattern should differ from regular enemy attack patterns (verified by comparing attack behavior)
**Validates: Requirements 7.5**

### Store and Equipment Properties

**Property 27: Store displays inventory**
*For any* store with inventory items I, entering the store should display all items in I with their costs
**Validates: Requirements 8.1**

**Property 28: Purchase with sufficient funds**
*For any* item with cost C and player coins P where P >= C, purchasing should deduct C from P and add the item to inventory
**Validates: Requirements 8.2**

**Property 29: Purchase validation**
*For any* item with cost C and player coins P where P < C, attempting to purchase should fail, display an error, and leave coins and inventory unchanged
**Validates: Requirements 8.3**

**Property 30: Weapon equipment updates damage**
*For any* weapon with damage value D, equipping the weapon should set Kiro's attack damage to D
**Validates: Requirements 8.4**

**Property 31: Armor reduces incoming damage**
*For any* armor with defense value A and incoming damage D, the actual damage applied should be max(1, D - A)
**Validates: Requirements 8.5**

### Visual Feedback Properties

**Property 32: Attack impact effects**
*For any* successful attack hit, particle effects should be created at the impact position
**Validates: Requirements 10.1**

**Property 33: Collection feedback**
*For any* collected item, particle effects should be created at the collection position
**Validates: Requirements 10.2**

**Property 34: Damage feedback**
*For any* damage event, the health meter should enter a pulsing state for one cycle
**Validates: Requirements 10.3**

### Animation Properties

**Property 35: Sprite animation states**
*For any* entity with animation states (idle, move, attack, defeat), the displayed animation should match the entity's current state
**Validates: Requirements 12.1, 12.3, 12.4**

## Error Handling

### Input Validation

- **Invalid Movement**: Attempting to move outside world boundaries should be ignored
- **Invalid Attacks**: Attacking without a weapon equipped should use default unarmed attack
- **Invalid Purchases**: Attempting to purchase with insufficient funds should display error message
- **Invalid Configuration**: Malformed JSON should log error and use default world configuration

### Collision Edge Cases

- **Simultaneous Collisions**: When multiple entities collide with Kiro in the same frame, process in order: enemies (damage), then collectibles (pickup)
- **Stuck Entities**: If an entity becomes stuck in geometry, teleport to nearest valid position
- **Hitbox Overlap**: Prevent entities from spawning in overlapping positions

### State Management

- **Save Corruption**: If save data is corrupted, start new game with default state
- **Missing Assets**: If sprite or audio file is missing, log warning and use placeholder
- **Scene Transition Errors**: If scene transition fails, reload current scene

### Combat Edge Cases

- **Zero Damage**: Attacks with 0 or negative damage should deal minimum 1 damage
- **Overkill**: Damage exceeding current health should set health to 0, not negative
- **Simultaneous Defeat**: If Kiro and enemy defeat each other simultaneously, process enemy defeat first, then check Kiro's health

### Progression Edge Cases

- **Max Level**: Reaching maximum level should stop XP accumulation or continue without level ups
- **Coin Overflow**: Collecting coins beyond maximum should cap at maximum value
- **Duplicate Collectibles**: Attempting to collect already-collected item should be ignored

## Testing Strategy

### Unit Testing

The game will use **Jest** as the unit testing framework for JavaScript. Unit tests will focus on:

- **Entity Logic**: Test individual entity behaviors (movement, attack, damage) with specific examples
- **Collision Detection**: Test hitbox overlap calculations with known positions
- **Progression Calculations**: Test XP thresholds, level calculations, damage formulas
- **Configuration Parsing**: Test JSON loading with valid and invalid configurations
- **State Management**: Test save/load functionality with specific save states
- **UI Components**: Test HUD updates with specific game state values

Unit tests will cover specific examples and edge cases such as:
- Boundary conditions (zero health, max coins, level cap)
- Error conditions (invalid input, missing files, corrupted data)
- Integration points between systems (combat → progression, collection → inventory)

### Property-Based Testing

The game will use **fast-check** as the property-based testing library for JavaScript. Property-based tests will verify universal properties across randomly generated inputs.

**Configuration**:
- Each property test will run a minimum of 100 iterations
- Tests will use custom generators for game entities, positions, and configurations
- Each test will be tagged with a comment referencing the design document property

**Test Organization**:
- Property tests will be co-located with unit tests in `.test.js` files
- Each correctness property will be implemented by a single property-based test
- Test tags will use format: `// Feature: legend-of-kiro, Property X: [property description]`

**Property Test Coverage**:
- Movement and collision (Properties 1-3)
- Combat mechanics (Properties 4-7)
- Health and damage (Properties 8-11)
- Collection and progression (Properties 12-15)
- World navigation (Properties 16-18)
- Configuration parsing (Properties 19-20)
- Dungeon mechanics (Properties 21-26)
- Store and equipment (Properties 27-31)
- Visual feedback (Properties 32-34)
- Animation states (Property 35)

**Custom Generators**:
- Position generator: Random x, y coordinates within world bounds
- Direction generator: Random direction (up, down, left, right)
- Entity generator: Random entity with valid stats and position
- Configuration generator: Random valid world configuration JSON
- Damage generator: Random positive damage values
- Health generator: Random health values between 0 and max

**Property Test Examples**:

```javascript
// Feature: legend-of-kiro, Property 2: Obstacle collision prevention
test('obstacle collision prevention', () => {
  fc.assert(fc.property(
    fc.record({
      kiroPos: positionGenerator(),
      obstaclePos: positionGenerator(),
      direction: directionGenerator()
    }),
    ({kiroPos, obstaclePos, direction}) => {
      const game = createTestGame();
      game.player.setPosition(kiroPos);
      game.addObstacle(obstaclePos);
      
      const initialPos = game.player.getPosition();
      game.player.move(direction);
      
      if (wouldCollide(kiroPos, direction, obstaclePos)) {
        expect(game.player.getPosition()).toEqual(initialPos);
      }
    }
  ), {numRuns: 100});
});

// Feature: legend-of-kiro, Property 8: Damage reduces health
test('damage reduces health correctly', () => {
  fc.assert(fc.property(
    fc.record({
      currentHealth: fc.integer({min: 1, max: 100}),
      damage: fc.integer({min: 1, max: 50})
    }),
    ({currentHealth, damage}) => {
      const game = createTestGame();
      game.player.setHealth(currentHealth);
      
      game.player.takeDamage(damage);
      
      const expectedHealth = Math.max(0, currentHealth - damage);
      expect(game.player.getHealth()).toBe(expectedHealth);
    }
  ), {numRuns: 100});
});
```

### Integration Testing

- **Scene Transitions**: Test full flow of moving between overworld, dungeons, and stores
- **Combat Flow**: Test complete combat sequence from attack input to enemy defeat to XP gain
- **Progression Flow**: Test collecting XP, leveling up, and health increase
- **Dungeon Completion**: Test entering dungeon, completing rooms, defeating boss, and returning to overworld

### Manual Testing Checklist

- Playtest each dungeon for completion
- Verify all collectibles are reachable
- Test all weapon and armor combinations
- Verify audio plays correctly for all events
- Test save/load functionality
- Verify performance maintains 60 FPS
- Test on different browsers (Chrome, Firefox, Safari)
