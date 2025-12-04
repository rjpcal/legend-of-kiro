# Requirements Document

## Introduction

Legend of Kiro is a 2D top-down adventure game inspired by the original Legend of Zelda NES game. The player controls Kiro, a friendly ghost navigating a haunted world filled with hostile spirits. The game features an overworld with multiple dungeon entrances, a progression system based on experience and currency, combat mechanics, and puzzle-solving elements. The game uses Phaser.js framework and is playable in a web browser.

## Glossary

- **Kiro**: The player character, a friendly ghost represented by the kiro-logo.png image
- **Game System**: The Legend of Kiro game application
- **Overworld**: The main 6x6 screen outdoor area containing dungeon entrances and collectibles
- **Dungeon**: Underground maze areas with 5-10 rooms containing puzzles, enemies, and bosses
- **Enemy**: Hostile spirits (zombies, skeletons, ghouls, spirits) that attack Kiro
- **Health Meter**: Visual indicator of Kiro's current and maximum health points
- **XP**: Experience points gained by defeating enemies
- **Coin**: Currency collectible used to purchase items at stores
- **Melee Attack**: Close-range attack performed by swinging a weapon
- **Ranged Attack**: Throwing the equipped melee weapon when health is at maximum
- **Level Up**: Progression event that increases maximum health when XP threshold is reached
- **World Configuration**: JSON document defining map layout, dungeon structure, and game elements
- **Minimap**: UI element showing the player's relative position within the current area
- **Boss**: Powerful enemy located in the final room of each dungeon
- **Store**: Location in the overworld where coins can be exchanged for weapons and armor

## Requirements

### Requirement 1

**User Story:** As a player, I want to control Kiro's movement in all four directions, so that I can explore the game world.

#### Acceptance Criteria

1. WHEN the player presses movement keys (arrow keys or WASD), THE Game System SHALL move Kiro in the corresponding direction (up, down, left, right)
2. WHILE Kiro is moving, THE Game System SHALL display movement animation using sprite sheet frames
3. WHEN Kiro collides with an obstacle, THE Game System SHALL prevent Kiro from moving through the obstacle
4. WHEN Kiro moves, THE Game System SHALL update Kiro's position at 60 frames per second for smooth movement
5. WHEN the player releases movement keys, THE Game System SHALL stop Kiro's movement and display idle animation

### Requirement 2

**User Story:** As a player, I want to attack enemies using melee and ranged attacks, so that I can defeat hostile spirits and progress through the game.

#### Acceptance Criteria

1. WHEN the player presses the attack button, THE Game System SHALL perform a melee swing attack in the direction Kiro is facing
2. WHEN Kiro's melee attack collides with an Enemy, THE Game System SHALL convert the Enemy to friendly status and remove it from the game
3. WHEN Kiro's Health Meter is at maximum AND the player presses the ranged attack button, THE Game System SHALL throw the equipped melee weapon as a projectile
4. WHEN a thrown weapon collides with an Enemy, THE Game System SHALL convert the Enemy to friendly status and return the weapon to Kiro
5. WHEN Kiro performs an attack, THE Game System SHALL display attack animation and play attack sound effect

### Requirement 3

**User Story:** As a player, I want to see Kiro's health status and have it change based on damage and healing, so that I understand my survival state.

#### Acceptance Criteria

1. WHEN the game starts, THE Game System SHALL display a Health Meter showing Kiro's current and maximum health
2. WHEN an Enemy attack collides with Kiro, THE Game System SHALL reduce the Health Meter by the attack damage amount and pulse the meter once
3. WHEN Kiro collects a health power-up, THE Game System SHALL increase the Health Meter up to the current maximum
4. WHEN the Health Meter reaches zero, THE Game System SHALL respawn Kiro at the starting point while preserving all collectibles
5. WHEN Kiro levels up or completes a Dungeon, THE Game System SHALL increase the maximum health capacity of the Health Meter

### Requirement 4

**User Story:** As a player, I want to collect coins and gain experience points, so that I can purchase upgrades and increase my power.

#### Acceptance Criteria

1. WHEN Kiro collides with a Coin collectible, THE Game System SHALL add the Coin to the player's total and remove it from the world
2. WHEN Kiro collects a Coin, THE Game System SHALL play a coin collection sound effect and display particle effects
3. WHEN Kiro defeats an Enemy, THE Game System SHALL award XP to the player
4. WHEN the player's XP reaches a level threshold, THE Game System SHALL trigger a Level Up event and increase maximum health
5. WHEN collectibles are obtained, THE Game System SHALL display the current Coin count and XP progress in the UI

### Requirement 5

**User Story:** As a player, I want to navigate a large overworld with multiple screens, so that I can explore and discover dungeon entrances.

#### Acceptance Criteria

1. WHEN Kiro reaches the edge of a screen, THE Game System SHALL transition to the adjacent screen in the corresponding direction
2. WHEN a screen transition occurs, THE Game System SHALL scroll smoothly from the current screen to the next screen
3. WHEN the player is in the Overworld, THE Game System SHALL display a Minimap showing Kiro's position within the 6x6 screen grid
4. WHEN Kiro enters a Dungeon entrance, THE Game System SHALL transition from the Overworld to the Dungeon area and play entrance sound
5. THE Game System SHALL load the Overworld layout from the World Configuration JSON document

### Requirement 6

**User Story:** As a player, I want to explore dungeons with multiple rooms and puzzles, so that I can challenge myself and earn rewards.

#### Acceptance Criteria

1. WHEN Kiro enters a Dungeon, THE Game System SHALL load the Dungeon layout from the World Configuration JSON document
2. WHEN Kiro completes a room's objective (defeating all enemies, solving puzzle), THE Game System SHALL unlock doors to adjacent rooms
3. WHEN Kiro pushes a movable block, THE Game System SHALL move the block in the push direction until it collides with an obstacle
4. WHEN a block is moved onto a switch, THE Game System SHALL activate the switch and trigger associated door or mechanism
5. WHEN Kiro reaches the final room of a Dungeon, THE Game System SHALL spawn the Boss enemy

### Requirement 7

**User Story:** As a player, I want to fight boss enemies at the end of dungeons, so that I can complete dungeons and earn significant rewards.

#### Acceptance Criteria

1. WHEN Kiro enters a boss room, THE Game System SHALL spawn the Boss enemy with increased health and attack power
2. WHEN the Boss is defeated, THE Game System SHALL mark the Dungeon as complete and increase Kiro's maximum health
3. WHEN a Dungeon is completed, THE Game System SHALL play a completion sound effect and display a completion message
4. WHEN all four Dungeons are completed, THE Game System SHALL display a victory screen indicating the player has won
5. WHEN a Boss attacks, THE Game System SHALL use unique attack patterns different from regular enemies

### Requirement 8

**User Story:** As a player, I want to purchase weapons and armor at stores using coins, so that I can improve my combat effectiveness.

#### Acceptance Criteria

1. WHEN Kiro enters a Store location, THE Game System SHALL display available items with their Coin costs
2. WHEN the player selects an item AND has sufficient Coins, THE Game System SHALL deduct the cost and add the item to Kiro's inventory
3. WHEN the player selects an item AND has insufficient Coins, THE Game System SHALL display an error message and prevent the purchase
4. WHEN Kiro equips a new weapon, THE Game System SHALL update the melee and ranged attack damage values
5. WHEN Kiro equips new armor, THE Game System SHALL reduce incoming damage from Enemy attacks

### Requirement 9

**User Story:** As a player, I want accurate collision detection for all game entities, so that the game feels fair and responsive.

#### Acceptance Criteria

1. WHEN Kiro's hitbox overlaps with an Enemy hitbox, THE Game System SHALL register a collision and apply damage to Kiro
2. WHEN Kiro's attack hitbox overlaps with an Enemy hitbox, THE Game System SHALL register a hit and defeat the Enemy
3. WHEN Kiro's hitbox overlaps with a collectible hitbox, THE Game System SHALL register collection and add the item to inventory
4. WHEN any entity collides with a wall or obstacle, THE Game System SHALL prevent movement through the obstacle
5. THE Game System SHALL update collision detection every frame at 60 frames per second

### Requirement 10

**User Story:** As a player, I want to see visual and audio feedback for game events, so that the game feels polished and engaging.

#### Acceptance Criteria

1. WHEN Kiro successfully hits an Enemy, THE Game System SHALL display particle effects at the impact point
2. WHEN Kiro collects an item, THE Game System SHALL display particle effects and play the corresponding sound effect
3. WHEN Kiro takes damage, THE Game System SHALL pulse the Health Meter once and play a damage sound effect
4. WHERE background music is enabled, THE Game System SHALL play looping background music during gameplay
5. WHEN key game events occur (dungeon enter, dungeon complete, level up), THE Game System SHALL play unique sound effects

### Requirement 11

**User Story:** As a game designer, I want the world layout and dungeon structure defined in JSON configuration files, so that I can easily modify and balance the game.

#### Acceptance Criteria

1. WHEN the Game System initializes, THE Game System SHALL load the World Configuration JSON document
2. WHEN parsing the World Configuration, THE Game System SHALL create the Overworld screens based on the configuration data
3. WHEN parsing the World Configuration, THE Game System SHALL create Dungeon rooms, enemy placements, and puzzle elements based on the configuration data
4. WHEN the World Configuration is modified, THE Game System SHALL reflect changes on the next game load without code modifications
5. THE World Configuration SHALL define screen layouts, enemy types, collectible positions, dungeon structures, and store inventories

### Requirement 12

**User Story:** As a player, I want sprite-based animations for characters, so that the game has visual appeal and character.

#### Acceptance Criteria

1. WHEN Kiro is displayed, THE Game System SHALL render the kiro-logo.png with a rippling animation effect
2. WHEN Kiro moves, THE Game System SHALL cycle through movement animation frames from the sprite sheet
3. WHEN an Enemy is displayed, THE Game System SHALL render the Enemy sprite with appropriate animations (idle, move, attack)
4. WHEN an Enemy is defeated, THE Game System SHALL play a conversion animation showing the Enemy becoming friendly
5. THE Game System SHALL maintain 60 frames per second animation playback for smooth visual experience
