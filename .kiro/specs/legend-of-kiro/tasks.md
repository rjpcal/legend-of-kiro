# Implementation Plan

- [x]   1. Set up project structure and Phaser.js framework
    - Create HTML file with canvas element
    - Include Phaser.js library via CDN
    - Set up basic Phaser game configuration with scenes
    - Create directory structure for assets, scenes, entities, and systems
    - _Requirements: All_

- [x]   2. Create world configuration system
    - [x] 2.1 Design and create world configuration JSON schema
        - Define overworld 6x6 grid structure
        - Define dungeon room structures with 4 dungeons
        - Define enemy types, collectibles, and store inventories
        - _Requirements: 11.5_

    - [x] 2.2 Implement configuration loader
        - Write JSON parser to load world configuration
        - Create validation for configuration structure
        - Implement error handling for malformed JSON
        - _Requirements: 11.1, 11.2, 11.3_

    - [ ]\* 2.3 Write property test for configuration round-trip
        - **Property 19: World configuration round-trip**
        - **Validates: Requirements 5.5, 6.1, 11.2, 11.3**

    - [ ]\* 2.4 Write unit tests for configuration loader
        - Test valid configuration loading
        - Test invalid JSON handling
        - Test missing file handling
        - _Requirements: 11.1, 11.2, 11.3_

- [x]   3. Implement base entity system
    - [x] 3.1 Create Entity base class
        - Implement position, sprite, and collision properties
        - Add update and destroy methods
        - _Requirements: 9.1, 9.2, 9.3, 9.4_

    - [x] 3.2 Create Player (Kiro) class
        - Extend Entity with player-specific properties
        - Implement health, inventory, and stats
        - Add sprite loading for kiro-logo.png
        - _Requirements: 1.1, 3.1_

    - [x] 3.3 Create Enemy base class
        - Extend Entity with enemy-specific properties
        - Implement health and attack properties
        - Add enemy sprite loading
        - _Requirements: 2.2, 9.1_

    - [ ]\* 3.4 Write unit tests for entity classes
        - Test entity initialization
        - Test property getters and setters
        - _Requirements: 9.1, 9.2, 9.3_

- [x]   4. Implement movement and collision system
    - [x] 4.1 Create movement controller
        - Implement keyboard input handling (arrow keys, WASD)
        - Add movement logic for four directions
        - Implement movement speed and delta time
        - _Requirements: 1.1_

    - [x] 4.2 Implement collision detection
        - Create hitbox system for entities
        - Implement AABB collision detection
        - Add obstacle collision prevention
        - _Requirements: 1.3, 9.4_

    - [x] 4.3 Integrate movement with collision
        - Check collisions before applying movement
        - Prevent movement through obstacles
        - _Requirements: 1.3, 9.4_

    - [ ]\* 4.4 Write property test for movement direction
        - **Property 1: Movement direction correspondence**
        - **Validates: Requirements 1.1**

    - [ ]\* 4.5 Write property test for obstacle collision
        - **Property 2: Obstacle collision prevention**
        - **Validates: Requirements 1.3, 9.4**

    - [ ]\* 4.6 Write unit tests for movement
        - Test movement in each direction
        - Test stopping on key release
        - Test collision blocking
        - _Requirements: 1.1, 1.3, 1.5_

- [x]   5. Implement animation system
    - [x] 5.1 Create sprite animation manager
        - Load sprite sheets for Kiro and enemies
        - Define animation frames for idle, move, attack, defeat
        - Implement animation state machine
        - _Requirements: 12.1, 12.2, 12.3, 12.4_

    - [x] 5.2 Add ripple effect for Kiro sprite
        - Implement shader or animation for rippling effect
        - Apply to kiro-logo.png sprite
        - _Requirements: 12.1_

    - [x] 5.3 Integrate animations with entity states
        - Play movement animation when moving
        - Play idle animation when stopped
        - Play attack animation when attacking
        - _Requirements: 1.2, 1.5, 2.5_

    - [ ]\* 5.4 Write property test for animation states
        - **Property 3: Movement state animation**
        - **Validates: Requirements 1.2, 1.5, 12.2**

    - [ ]\* 5.5 Write property test for sprite animation states
        - **Property 35: Sprite animation states**
        - **Validates: Requirements 12.1, 12.3, 12.4**

- [x]   6. Checkpoint - Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [x]   7. Implement combat system
    - [x] 7.1 Create Weapon class
        - Define weapon properties (damage, range, attack speed)
        - Implement melee attack hitbox generation
        - Implement ranged attack projectile
        - _Requirements: 2.1, 2.3_

    - [x] 7.2 Implement melee attack
        - Add attack button input handling
        - Create attack hitbox in facing direction
        - Implement attack animation
        - _Requirements: 2.1, 2.5_

    - [x] 7.3 Implement ranged attack
        - Check health is at maximum before allowing throw
        - Create projectile entity
        - Implement projectile movement and collision
        - Return weapon to player after hit
        - _Requirements: 2.3, 2.4_

    - [x] 7.4 Implement enemy defeat logic
        - Detect attack hitbox collision with enemy
        - Convert enemy to friendly and remove from game
        - Play defeat animation
        - _Requirements: 2.2, 2.4_

    - [ ]\* 7.5 Write property test for melee attack direction
        - **Property 4: Melee attack direction**
        - **Validates: Requirements 2.1**

    - [ ]\* 7.6 Write property test for attack defeats enemies
        - **Property 5: Attack defeats enemies**
        - **Validates: Requirements 2.2, 2.4, 9.2**

    - [ ]\* 7.7 Write property test for ranged attack health requirement
        - **Property 6: Ranged attack health requirement**
        - **Validates: Requirements 2.3**

    - [ ]\* 7.8 Write property test for weapon return
        - **Property 7: Weapon return after throw**
        - **Validates: Requirements 2.4**

    - [ ]\* 7.9 Write unit tests for combat system
        - Test melee attack creation
        - Test ranged attack with various health values
        - Test enemy defeat
        - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x]   8. Implement health and damage system
    - [x] 8.1 Create health management
        - Implement current and max health tracking
        - Add health modification methods
        - _Requirements: 3.1, 3.2, 3.3_

    - [x] 8.2 Implement damage application
        - Detect enemy collision with player
        - Apply damage and reduce health
        - Trigger health meter pulse
        - _Requirements: 3.2, 9.1_

    - [x] 8.3 Implement healing system
        - Create health power-up collectible
        - Implement healing that respects max health
        - _Requirements: 3.3_

    - [x] 8.4 Implement death and respawn
        - Detect health reaching zero
        - Respawn player at starting position
        - Preserve collectibles and coins
        - _Requirements: 3.4_

    - [ ]\* 8.5 Write property test for damage reduces health
        - **Property 8: Damage reduces health**
        - **Validates: Requirements 3.2, 9.1**

    - [ ]\* 8.6 Write property test for healing respects maximum
        - **Property 9: Healing respects maximum**
        - **Validates: Requirements 3.3**

    - [ ]\* 8.7 Write property test for death respawn
        - **Property 10: Death respawn preserves collectibles**
        - **Validates: Requirements 3.4**

    - [ ]\* 8.8 Write unit tests for health system
        - Test damage application
        - Test healing
        - Test death and respawn
        - _Requirements: 3.2, 3.3, 3.4_

- [x]   9. Implement HUD and UI
    - [x] 9.1 Create Health Meter component
        - Display current and max health visually
        - Implement pulse animation on damage
        - _Requirements: 3.1, 3.2, 10.3_

    - [x] 9.2 Create Coin Counter component
        - Display current coin count
        - Update on coin collection
        - _Requirements: 4.1, 4.5_

    - [x] 9.3 Create XP Bar component
        - Display current XP and progress to next level
        - Update on XP gain
        - _Requirements: 4.3, 4.4, 4.5_

    - [x] 9.4 Create Minimap component
        - Display 6x6 grid representation
        - Highlight current screen position
        - _Requirements: 5.3_

    - [ ]\* 9.5 Write property test for UI reflects game state
        - **Property 15: UI reflects game state**
        - **Validates: Requirements 4.5**

    - [ ]\* 9.6 Write property test for minimap accuracy
        - **Property 17: Minimap position accuracy**
        - **Validates: Requirements 5.3**

    - [ ]\* 9.7 Write property test for damage feedback
        - **Property 34: Damage feedback**
        - **Validates: Requirements 10.3**

- [x]   10. Checkpoint - Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [x]   11. Implement collection and progression system
    - [x] 11.1 Create collectible entities
        - Implement coin collectible
        - Implement health power-up collectible
        - Implement weapon and armor collectibles
        - _Requirements: 4.1, 3.3_

    - [x] 11.2 Implement collection detection
        - Detect player collision with collectibles
        - Add collectible to inventory/counters
        - Remove collectible from world
        - _Requirements: 4.1, 9.3_

    - [x] 11.3 Implement XP and leveling system
        - Award XP on enemy defeat
        - Calculate level thresholds
        - Trigger level up when threshold reached
        - Increase max health on level up
        - _Requirements: 4.3, 4.4, 3.5_

    - [ ]\* 11.4 Write property test for collectible acquisition
        - **Property 12: Collectible acquisition**
        - **Validates: Requirements 4.1, 9.3**

    - [ ]\* 11.5 Write property test for enemy defeat grants XP
        - **Property 13: Enemy defeat grants XP**
        - **Validates: Requirements 4.3**

    - [ ]\* 11.6 Write property test for XP threshold triggers level up
        - **Property 14: XP threshold triggers level up**
        - **Validates: Requirements 4.4**

    - [ ]\* 11.7 Write property test for level up increases max health
        - **Property 11: Level up increases max health**
        - **Validates: Requirements 3.5, 7.2**

    - [ ]\* 11.8 Write unit tests for progression system
        - Test XP calculation
        - Test level threshold calculation
        - Test level up trigger
        - _Requirements: 4.3, 4.4_

- [x]   12. Implement overworld and screen transitions
    - [x] 12.1 Create overworld scene
        - Load overworld screens from configuration
        - Render current screen with terrain and obstacles
        - Place enemies and collectibles
        - _Requirements: 5.5, 11.2_

    - [x] 12.2 Implement screen transition system
        - Detect player reaching screen edge
        - Transition to adjacent screen
        - Implement smooth scrolling transition
        - _Requirements: 5.1, 5.2_

    - [x] 12.3 Add dungeon entrances
        - Place dungeon entrance markers on overworld
        - Detect player collision with entrance
        - Transition to dungeon scene
        - _Requirements: 5.4_

    - [ ]\* 12.4 Write property test for screen edge transitions
        - **Property 16: Screen edge transitions**
        - **Validates: Requirements 5.1**

    - [ ]\* 12.5 Write property test for dungeon entrance transitions
        - **Property 18: Dungeon entrance transitions**
        - **Validates: Requirements 5.4**

    - [ ]\* 12.6 Write unit tests for screen transitions
        - Test edge detection
        - Test adjacent screen loading
        - Test dungeon entrance detection
        - _Requirements: 5.1, 5.4_

- [ ]   13. Implement dungeon system
    - [ ] 13.1 Create dungeon scene
        - Load dungeon rooms from configuration
        - Render current room with walls and doors
        - Place enemies and puzzle elements
        - _Requirements: 6.1, 11.3_

    - [ ] 13.2 Implement room transition
        - Detect player reaching unlocked door
        - Transition to adjacent room
        - _Requirements: 6.2_

    - [ ] 13.3 Implement room completion logic
        - Track room objectives (defeat all enemies, activate switches)
        - Unlock doors when objectives complete
        - _Requirements: 6.2_

    - [ ] 13.4 Implement pushable blocks
        - Create pushable block entity
        - Implement push physics
        - Detect collision with obstacles
        - _Requirements: 6.3_

    - [ ] 13.5 Implement switch puzzle mechanics
        - Create switch entity
        - Detect block on switch
        - Activate switch and trigger mechanism
        - _Requirements: 6.4_

    - [ ]\* 13.6 Write property test for room completion unlocks doors
        - **Property 21: Room completion unlocks doors**
        - **Validates: Requirements 6.2**

    - [ ]\* 13.7 Write property test for block pushing physics
        - **Property 22: Block pushing physics**
        - **Validates: Requirements 6.3**

    - [ ]\* 13.8 Write property test for switch activation
        - **Property 23: Switch activation**
        - **Validates: Requirements 6.4**

    - [ ]\* 13.9 Write unit tests for dungeon mechanics
        - Test room completion detection
        - Test door unlocking
        - Test block pushing
        - Test switch activation
        - _Requirements: 6.2, 6.3, 6.4_

- [ ]   14. Checkpoint - Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [ ]   15. Implement boss system
    - [ ] 15.1 Create Boss class
        - Extend Enemy with enhanced stats
        - Implement unique attack patterns
        - _Requirements: 7.1, 7.5_

    - [ ] 15.2 Implement boss spawning
        - Detect final room of dungeon
        - Spawn boss enemy
        - _Requirements: 6.5, 7.1_

    - [ ] 15.3 Implement boss defeat and dungeon completion
        - Detect boss defeat
        - Mark dungeon as complete
        - Increase max health
        - Play completion sound and message
        - _Requirements: 7.2, 7.3_

    - [ ] 15.4 Implement victory condition
        - Track completed dungeons
        - Display victory screen when all 4 dungeons complete
        - _Requirements: 7.4_

    - [ ]\* 15.5 Write property test for boss spawning
        - **Property 24: Boss spawning**
        - **Validates: Requirements 6.5, 7.1**

    - [ ]\* 15.6 Write property test for boss defeat completes dungeon
        - **Property 25: Boss defeat completes dungeon**
        - **Validates: Requirements 7.2**

    - [ ]\* 15.7 Write property test for boss attack patterns differ
        - **Property 26: Boss attack patterns differ**
        - **Validates: Requirements 7.5**

    - [ ]\* 15.8 Write unit tests for boss system
        - Test boss initialization with enhanced stats
        - Test boss spawning in final room
        - Test dungeon completion on boss defeat
        - Test victory condition
        - _Requirements: 6.5, 7.1, 7.2, 7.3, 7.4_

- [ ]   16. Implement store system
    - [ ] 16.1 Create store scene
        - Load store inventory from configuration
        - Display available items with costs
        - _Requirements: 8.1_

    - [ ] 16.2 Implement purchase system
        - Handle item selection
        - Validate sufficient coins
        - Deduct cost and add item to inventory
        - Display error for insufficient funds
        - _Requirements: 8.2, 8.3_

    - [ ] 16.3 Implement equipment system
        - Allow equipping weapons and armor
        - Update player stats when equipped
        - _Requirements: 8.4, 8.5_

    - [ ]\* 16.4 Write property test for store displays inventory
        - **Property 27: Store displays inventory**
        - **Validates: Requirements 8.1**

    - [ ]\* 16.5 Write property test for purchase with sufficient funds
        - **Property 28: Purchase with sufficient funds**
        - **Validates: Requirements 8.2**

    - [ ]\* 16.6 Write property test for purchase validation
        - **Property 29: Purchase validation**
        - **Validates: Requirements 8.3**

    - [ ]\* 16.7 Write property test for weapon equipment updates damage
        - **Property 30: Weapon equipment updates damage**
        - **Validates: Requirements 8.4**

    - [ ]\* 16.8 Write property test for armor reduces incoming damage
        - **Property 31: Armor reduces incoming damage**
        - **Validates: Requirements 8.5**

    - [ ]\* 16.9 Write unit tests for store system
        - Test store initialization
        - Test purchase with sufficient coins
        - Test purchase with insufficient coins
        - Test equipment stat updates
        - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]   17. Implement visual effects system
    - [ ] 17.1 Create particle effect system
        - Implement particle emitter
        - Create particle effects for attacks
        - Create particle effects for collectibles
        - _Requirements: 10.1, 10.2_

    - [ ] 17.2 Integrate particle effects with game events
        - Trigger particles on attack hits
        - Trigger particles on item collection
        - _Requirements: 10.1, 10.2_

    - [ ]\* 17.3 Write property test for attack impact effects
        - **Property 32: Attack impact effects**
        - **Validates: Requirements 10.1**

    - [ ]\* 17.4 Write property test for collection feedback
        - **Property 33: Collection feedback**
        - **Validates: Requirements 10.2**

    - [ ]\* 17.5 Write unit tests for particle system
        - Test particle creation
        - Test particle lifecycle
        - _Requirements: 10.1, 10.2_

- [ ]   18. Implement audio system
    - [ ] 18.1 Create audio manager
        - Load sound effects
        - Load background music
        - Implement play/stop methods
        - Add enable/disable toggle
        - _Requirements: 10.4, 10.5_

    - [ ] 18.2 Integrate sound effects with game events
        - Play coin collection sound
        - Play enemy hit sound
        - Play Kiro damage sound
        - Play health pickup sound
        - Play dungeon enter sound
        - Play dungeon complete sound
        - Play level up sound
        - _Requirements: 4.2, 10.3, 10.5_

    - [ ] 18.3 Implement background music
        - Play looping background music during gameplay
        - Respect music enabled setting
        - _Requirements: 10.4_

    - [ ]\* 18.4 Write unit tests for audio system
        - Test audio manager initialization
        - Test sound effect triggering
        - Test music enable/disable
        - _Requirements: 10.4, 10.5_

- [ ]   19. Checkpoint - Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [ ]   20. Create initial world configuration
    - [ ] 20.1 Design overworld layout
        - Create 6x6 screen grid with varied terrain
        - Place 4 dungeon entrances
        - Place stores
        - Distribute enemies and collectibles
        - _Requirements: 5.5, 11.2_

    - [ ] 20.2 Design 4 dungeons
        - Create dungeon 1 with 5-10 rooms and puzzles
        - Create dungeon 2 with 5-10 rooms and puzzles
        - Create dungeon 3 with 5-10 rooms and puzzles
        - Create dungeon 4 with 5-10 rooms and puzzles
        - Place boss in final room of each dungeon
        - _Requirements: 6.1, 6.5, 11.3_

    - [ ] 20.3 Define enemy types and stats
        - Create zombie enemy configuration
        - Create skeleton enemy configuration
        - Create ghoul enemy configuration
        - Create spirit enemy configuration
        - Create boss configurations for each dungeon
        - _Requirements: 2.2, 7.1_

    - [ ] 20.4 Define store inventories
        - Create weapon progression (starter → advanced)
        - Create armor progression (starter → advanced)
        - Set appropriate coin costs
        - _Requirements: 8.1_

    - [ ]\* 20.5 Write property test for configuration hot-reload
        - **Property 20: Configuration hot-reload**
        - **Validates: Requirements 11.4**

- [ ]   21. Create game assets
    - [ ] 21.1 Prepare Kiro sprite
        - Use kiro-logo.png as base sprite
        - Create sprite sheet with animation frames if needed
        - _Requirements: 12.1_

    - [ ] 21.2 Create enemy sprites
        - Create zombie sprite with animations
        - Create skeleton sprite with animations
        - Create ghoul sprite with animations
        - Create spirit sprite with animations
        - Create boss sprites
        - _Requirements: 12.3, 12.4_

    - [ ] 21.3 Create environment sprites
        - Create terrain tiles (grass, stone, etc.)
        - Create obstacle sprites (walls, rocks, trees)
        - Create door sprites (locked, unlocked)
        - Create collectible sprites (coins, health, weapons, armor)
        - _Requirements: 5.5, 6.1_

    - [ ] 21.4 Create UI sprites
        - Create health meter graphics
        - Create minimap graphics
        - Create menu and store UI graphics
        - _Requirements: 3.1, 5.3, 8.1_

- [ ]   22. Implement save/load system
    - [ ] 22.1 Create save data structure
        - Define save data format
        - Include player state, world state, settings
        - _Requirements: 3.4_

    - [ ] 22.2 Implement save functionality
        - Serialize game state to JSON
        - Store in browser localStorage
        - _Requirements: 3.4_

    - [ ] 22.3 Implement load functionality
        - Load save data from localStorage
        - Restore game state
        - Handle missing or corrupted save data
        - _Requirements: 3.4_

    - [ ]\* 22.4 Write unit tests for save/load system
        - Test save data serialization
        - Test save data deserialization
        - Test corrupted save handling
        - _Requirements: 3.4_

- [ ]   23. Polish and optimization
    - [ ] 23.1 Optimize collision detection
        - Implement spatial partitioning
        - Reduce unnecessary collision checks
        - _Requirements: 9.5_

    - [ ] 23.2 Add visual polish
        - Refine animations
        - Adjust particle effects
        - Apply Kiro brand colors to UI (#790ECB purple, dark theme)
        - _Requirements: 10.1, 10.2_

    - [ ] 23.3 Balance gameplay
        - Adjust enemy difficulty
        - Balance weapon and armor costs
        - Tune XP and level thresholds
        - _Requirements: 4.4, 8.1_

    - [ ]\* 23.4 Write integration tests
        - Test complete gameplay flow
        - Test dungeon completion flow
        - Test store purchase flow
        - _Requirements: All_

- [ ]   24. Final Checkpoint - Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [ ]   25. Create main menu and game over screens
    - [ ] 25.1 Create main menu scene
        - Add start game button
        - Add load game button
        - Add settings (music/sfx toggle)
        - _Requirements: 10.4_

    - [ ] 25.2 Create game over scene
        - Display on death
        - Show stats (coins, level, dungeons completed)
        - Add restart and main menu buttons
        - _Requirements: 3.4_

    - [ ] 25.3 Create victory scene
        - Display when all dungeons complete
        - Show final stats
        - Add play again button
        - _Requirements: 7.4_

    - [ ]\* 25.4 Write unit tests for menu scenes
        - Test scene transitions
        - Test button functionality
        - _Requirements: 3.4, 7.4_
