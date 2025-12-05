// AudioManager - Centralized audio system for sound effects and music

/**
 * AudioManager handles all audio playback in the game
 * Manages sound effects, background music, and audio settings
 */
export class AudioManager {
    /**
     * @param {Phaser.Scene} scene - The Phaser scene to attach audio to
     */
    constructor(scene) {
        this.scene = scene;

        // Audio settings
        this.musicEnabled = true;
        this.sfxEnabled = true;

        // Audio objects
        this.sounds = {};
        this.music = null;

        // Sound effect keys
        this.soundKeys = {
            COIN_COLLECT: 'coin_collect',
            ENEMY_HIT: 'enemy_hit',
            KIRO_DAMAGE: 'kiro_damage',
            HEALTH_PICKUP: 'health_pickup',
            DUNGEON_ENTER: 'dungeon_enter',
            DUNGEON_COMPLETE: 'dungeon_complete',
            LEVEL_UP: 'level_up',
        };

        // Music key
        this.musicKey = 'background_music';
    }

    /**
     * Load all audio assets
     * Should be called in the preload phase of a scene
     */
    preloadAudio() {
        // Note: These are placeholder paths
        // In a real implementation, you would have actual audio files
        // For now, we'll create simple beep sounds programmatically

        // Sound effects would be loaded like this:
        // this.scene.load.audio('coin_collect', 'assets/audio/coin.mp3');
        // this.scene.load.audio('enemy_hit', 'assets/audio/hit.mp3');
        // etc.

        // Background music would be loaded like this:
        // this.scene.load.audio('background_music', 'assets/audio/music.mp3');

        console.log('Audio assets ready for loading (using programmatic sounds for now)');
    }

    /**
     * Initialize audio system
     * Should be called in the create phase of a scene
     */
    initialize() {
        // Create programmatic sound effects using Web Audio API
        // This is a fallback for when actual audio files aren't available
        this.createProgrammaticSounds();

        // Load settings from registry if available
        const savedMusicEnabled = this.scene.registry.get('musicEnabled');
        const savedSfxEnabled = this.scene.registry.get('sfxEnabled');

        if (savedMusicEnabled !== undefined) {
            this.musicEnabled = savedMusicEnabled;
        }
        if (savedSfxEnabled !== undefined) {
            this.sfxEnabled = savedSfxEnabled;
        }

        console.log('AudioManager initialized');
    }

    /**
     * Create simple programmatic sounds as placeholders
     * These can be replaced with actual audio files later
     */
    createProgrammaticSounds() {
        // Create simple beep sounds for each sound effect
        // In Phaser, we can use the Web Audio API to generate tones

        // For now, we'll just prepare the sound keys
        // Actual sound generation will happen when sounds are played
        Object.values(this.soundKeys).forEach(key => {
            this.sounds[key] = null; // Will be created on first play
        });
    }

    /**
     * Play a sound effect
     * @param {string} soundKey - The key of the sound to play
     * @param {object} config - Optional configuration (volume, rate, etc.)
     */
    playSound(soundKey, config = {}) {
        if (!this.sfxEnabled) {
            return;
        }

        try {
            // Try to play the sound if it exists in the cache
            if (this.scene.cache.audio.exists(soundKey)) {
                const sound = this.scene.sound.add(soundKey, {
                    volume: config.volume || 0.5,
                    rate: config.rate || 1,
                });
                sound.play();
            } else {
                // Fallback: create a simple beep sound
                this.playBeep(soundKey);
            }
        } catch (error) {
            console.warn(`Failed to play sound: ${soundKey}`, error);
        }
    }

    /**
     * Play a simple beep sound as a fallback
     * @param {string} soundKey - The sound key to determine frequency
     */
    playBeep(soundKey) {
        // Create different frequency beeps for different sounds
        const frequencies = {
            [this.soundKeys.COIN_COLLECT]: 800,
            [this.soundKeys.ENEMY_HIT]: 400,
            [this.soundKeys.KIRO_DAMAGE]: 200,
            [this.soundKeys.HEALTH_PICKUP]: 600,
            [this.soundKeys.DUNGEON_ENTER]: 300,
            [this.soundKeys.DUNGEON_COMPLETE]: 500,
            [this.soundKeys.LEVEL_UP]: 700,
        };

        const frequency = frequencies[soundKey] || 440;
        const duration = 0.1;

        // Use Web Audio API to create a simple tone
        if (this.scene.sound.context) {
            const context = this.scene.sound.context;
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);

            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + duration);
        }
    }

    /**
     * Play coin collection sound
     */
    playCoinCollect() {
        this.playSound(this.soundKeys.COIN_COLLECT);
    }

    /**
     * Play enemy hit sound
     */
    playEnemyHit() {
        this.playSound(this.soundKeys.ENEMY_HIT);
    }

    /**
     * Play Kiro damage sound
     */
    playKiroDamage() {
        this.playSound(this.soundKeys.KIRO_DAMAGE);
    }

    /**
     * Play health pickup sound
     */
    playHealthPickup() {
        this.playSound(this.soundKeys.HEALTH_PICKUP);
    }

    /**
     * Play dungeon enter sound
     */
    playDungeonEnter() {
        this.playSound(this.soundKeys.DUNGEON_ENTER);
    }

    /**
     * Play dungeon complete sound
     */
    playDungeonComplete() {
        this.playSound(this.soundKeys.DUNGEON_COMPLETE);
    }

    /**
     * Play level up sound
     */
    playLevelUp() {
        this.playSound(this.soundKeys.LEVEL_UP);
    }

    /**
     * Start playing background music
     * @param {boolean} loop - Whether to loop the music (default: true)
     */
    playMusic(loop = true) {
        if (!this.musicEnabled) {
            return;
        }

        // Stop any existing music
        this.stopMusic();

        try {
            // Try to play music if it exists in the cache
            if (this.scene.cache.audio.exists(this.musicKey)) {
                this.music = this.scene.sound.add(this.musicKey, {
                    volume: 0.3,
                    loop: loop,
                });
                this.music.play();
            } else {
                console.log('Background music not loaded (audio file not available)');
            }
        } catch (error) {
            console.warn('Failed to play background music:', error);
        }
    }

    /**
     * Stop background music
     */
    stopMusic() {
        if (this.music) {
            this.music.stop();
            this.music = null;
        }
    }

    /**
     * Pause background music
     */
    pauseMusic() {
        if (this.music && this.music.isPlaying) {
            this.music.pause();
        }
    }

    /**
     * Resume background music
     */
    resumeMusic() {
        if (this.music && this.music.isPaused) {
            this.music.resume();
        }
    }

    /**
     * Enable or disable background music
     * @param {boolean} enabled - Whether music should be enabled
     */
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        this.scene.registry.set('musicEnabled', enabled);

        if (enabled) {
            this.playMusic();
        } else {
            this.stopMusic();
        }
    }

    /**
     * Enable or disable sound effects
     * @param {boolean} enabled - Whether sound effects should be enabled
     */
    setSfxEnabled(enabled) {
        this.sfxEnabled = enabled;
        this.scene.registry.set('sfxEnabled', enabled);
    }

    /**
     * Toggle music on/off
     * @returns {boolean} New music enabled state
     */
    toggleMusic() {
        this.setMusicEnabled(!this.musicEnabled);
        return this.musicEnabled;
    }

    /**
     * Toggle sound effects on/off
     * @returns {boolean} New sfx enabled state
     */
    toggleSfx() {
        this.setSfxEnabled(!this.sfxEnabled);
        return this.sfxEnabled;
    }

    /**
     * Get current music enabled state
     * @returns {boolean}
     */
    isMusicEnabled() {
        return this.musicEnabled;
    }

    /**
     * Get current sfx enabled state
     * @returns {boolean}
     */
    isSfxEnabled() {
        return this.sfxEnabled;
    }

    /**
     * Clean up audio resources
     */
    destroy() {
        this.stopMusic();
        this.sounds = {};
    }
}
