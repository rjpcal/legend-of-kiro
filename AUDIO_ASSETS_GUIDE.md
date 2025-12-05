# Audio Assets Guide for Legend of Kiro

This guide provides resources and instructions for adding audio assets to the game.

## Current Status

✅ **Audio System Implemented** - The AudioManager is fully functional and integrated
⏳ **Audio Files Needed** - Currently using programmatic beep sounds as placeholders

## Required Audio Files

The game needs the following audio files:

### Sound Effects (7 files)

1. **coin_collect** - Played when player collects coins
2. **enemy_hit** - Played when enemies are defeated
3. **kiro_damage** - Played when player takes damage
4. **health_pickup** - Played when player collects health power-ups
5. **dungeon_enter** - Played when entering a dungeon
6. **dungeon_complete** - Played when boss is defeated
7. **level_up** - Played when player levels up

### Background Music (1 file)

1. **background_music** - Looping music for gameplay (Overworld, Dungeon, Store)

## 🎵 Best Free Audio Resources

### For Sound Effects

#### 1. **Kenney.nl** ⭐ RECOMMENDED

- **URL**: https://kenney.nl/assets?q=audio
- **License**: Public domain (CC0) - No attribution required!
- **Best Packs**:
    - "Digital Audio" pack
    - "RPG Audio" pack
    - "Interface Sounds" pack
- **Why**: High quality, consistent style, completely free

#### 2. **Freesound.org**

- **URL**: https://freesound.org/
- **License**: Various Creative Commons licenses (check each sound)
- **Search Terms**:
    - "coin pickup" or "collect coin"
    - "8bit hit" or "retro damage"
    - "hurt sound" or "damage"
    - "health pickup" or "power up"
    - "door open" or "dungeon enter"
    - "victory" or "level complete"
    - "level up" or "achievement"
- **Why**: Huge library with preview and download

#### 3. **OpenGameArt.org**

- **URL**: https://opengameart.org/
- **License**: Various (check each asset)
- **Browse**: Sound Effects category
- **Why**: Specifically curated for games

#### 4. **Zapsplat**

- **URL**: https://www.zapsplat.com/
- **License**: Free with attribution
- **Categories**: Game Sounds, Retro, 8-bit
- **Why**: Good search and preview features

#### 5. **Chiptone** (Sound Generator)

- **URL**: https://sfbgames.itch.io/chiptone
- **License**: Create your own sounds
- **Why**: Perfect for making custom retro 8-bit sound effects

### For Background Music

#### 1. **Incompetech** ⭐ RECOMMENDED

- **URL**: https://incompetech.com/music/royalty-free/
- **License**: Free with attribution (credit Kevin MacLeod)
- **Genres to Try**: "Chiptune", "Video Game", "Dark", "Adventure"
- **Why**: Professional quality, easy licensing, looping tracks available

#### 2. **OpenGameArt.org Music**

- **URL**: https://opengameart.org/art-search-advanced?keys=&field_art_type_tid%5B%5D=12
- **License**: Various (check each track)
- **Filter**: Music type, looping tracks
- **Why**: Game-specific music with looping versions

#### 3. **FreePD**

- **URL**: https://freepd.com/
- **License**: Public domain
- **Why**: No attribution needed, atmospheric tracks

#### 4. **Purple Planet Music**

- **URL**: https://www.purple-planet.com/
- **License**: Free with attribution
- **Why**: High quality, categorized by mood/genre

## 📝 Recommended Search Terms

### Sound Effects

- **Coin**: "coin collect", "pickup coin", "8bit coin", "retro coin"
- **Enemy Hit**: "8bit hit", "retro damage", "enemy defeat", "impact"
- **Kiro Damage**: "hurt", "damage", "player hit", "ouch"
- **Health Pickup**: "health pickup", "power up", "heal", "restore"
- **Dungeon Enter**: "door open", "dungeon enter", "gate", "transition"
- **Dungeon Complete**: "victory", "level complete", "fanfare", "success"
- **Level Up**: "level up", "achievement", "power up", "upgrade"

### Background Music

- "dungeon theme"
- "adventure loop"
- "retro game music"
- "chiptune loop"
- "8bit background"
- "pixel art game music"
- "haunted theme" (for the ghost/spirit theme)

## 🎯 Quick Start Guide

### Step 1: Download Audio Files

1. Visit **Kenney.nl** and download the "Digital Audio" pack for sound effects
2. Visit **Incompetech** and search for a looping adventure/chiptune track
3. Rename files to match the required names above

### Step 2: Add Files to Project

Create the audio directory and add your files:

```bash
mkdir -p assets/audio
```

Place your audio files in `assets/audio/`:

- `assets/audio/coin_collect.mp3` (or .wav, .ogg)
- `assets/audio/enemy_hit.mp3`
- `assets/audio/kiro_damage.mp3`
- `assets/audio/health_pickup.mp3`
- `assets/audio/dungeon_enter.mp3`
- `assets/audio/dungeon_complete.mp3`
- `assets/audio/level_up.mp3`
- `assets/audio/background_music.mp3`

### Step 3: Update BootScene.js

Add the audio loading code to `src/scenes/BootScene.js` in the `preload()` method:

```javascript
preload() {
    // ... existing code ...

    // Load sound effects
    this.load.audio('coin_collect', 'assets/audio/coin_collect.mp3');
    this.load.audio('enemy_hit', 'assets/audio/enemy_hit.mp3');
    this.load.audio('kiro_damage', 'assets/audio/kiro_damage.mp3');
    this.load.audio('health_pickup', 'assets/audio/health_pickup.mp3');
    this.load.audio('dungeon_enter', 'assets/audio/dungeon_enter.mp3');
    this.load.audio('dungeon_complete', 'assets/audio/dungeon_complete.mp3');
    this.load.audio('level_up', 'assets/audio/level_up.mp3');

    // Load background music
    this.load.audio('background_music', 'assets/audio/background_music.mp3');
}
```

### Step 4: Test

Run the game and test:

- Collect coins to hear coin sound
- Get hit by enemies to hear damage sound
- Defeat enemies to hear enemy hit sound
- Collect health to hear health pickup sound
- Enter dungeons to hear dungeon enter sound
- Defeat a boss to hear dungeon complete sound
- Level up to hear level up sound
- Background music should play automatically

## 🎨 Audio Style Recommendations

For Legend of Kiro's ghost/haunted theme:

### Sound Effects Style

- **Retro/8-bit style** to match the pixel art aesthetic
- **Short and punchy** (0.1-0.5 seconds for most effects)
- **Slightly eerie** tones for the ghost theme
- **Satisfying** feedback sounds (especially for coins and level ups)

### Music Style

- **Chiptune or 8-bit** style
- **Looping** (seamless loop points)
- **Moderate tempo** (not too fast, not too slow)
- **Slightly mysterious/adventurous** mood
- **Not too intense** (should work for both overworld and dungeons)

## 📋 Attribution Template

If you use assets that require attribution, add this to your game credits:

```
AUDIO CREDITS

Sound Effects:
- [Asset Name] by [Creator] from [Source]
- Licensed under [License Type]

Music:
- [Track Name] by [Composer] from [Source]
- Licensed under [License Type]

Example:
- "Coin Collect" by Kenney from Kenney.nl (CC0)
- "Adventure Theme" by Kevin MacLeod from Incompetech.com (CC BY 4.0)
```

## 🔧 Technical Notes

### Supported Audio Formats

Phaser.js supports:

- **MP3** - Best browser compatibility
- **OGG** - Good compression, open format
- **WAV** - Uncompressed, larger files
- **M4A** - Good for iOS

**Recommendation**: Use MP3 for best compatibility, or provide multiple formats for fallback.

### File Size Considerations

- **Sound Effects**: Keep under 100KB each (they're short)
- **Background Music**: Aim for 1-3MB (depends on length and quality)
- **Total Audio**: Try to keep under 10MB for web game

### Audio Settings

The AudioManager is configured with:

- **Music Volume**: 0.3 (30%)
- **SFX Volume**: 0.5 (50%)
- Users can toggle music and SFX on/off in the main menu

## ✅ Checklist

- [ ] Download sound effects from Kenney.nl or other source
- [ ] Download background music from Incompetech or other source
- [ ] Create `assets/audio/` directory
- [ ] Add all 8 audio files to the directory
- [ ] Update `src/scenes/BootScene.js` with audio loading code
- [ ] Test all sounds in-game
- [ ] Add attribution to credits (if required)
- [ ] Optimize file sizes if needed

## 🆘 Troubleshooting

**Audio not playing?**

- Check browser console for loading errors
- Verify file paths are correct
- Ensure files are in supported format (MP3 recommended)
- Check that audio files aren't corrupted
- Try different browsers (some have autoplay restrictions)

**Music not looping?**

- The AudioManager sets `loop: true` automatically
- Ensure the music file has clean loop points
- Some audio editors can help create seamless loops

**Volume too loud/quiet?**

- Adjust volume in AudioManager.js:
    - Music: Change `volume: 0.3` in `playMusic()`
    - SFX: Change `volume: 0.5` in `playSound()`

---

**Need Help?** The audio system is fully implemented and ready to go. Just add the files and update BootScene.js!
