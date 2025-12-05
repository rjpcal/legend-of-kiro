// AudioManager.test.js - Tests for AudioManager
// Tests audio system initialization, sound effects, and music control

// Import jest globals for ES modules
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock Phaser scene
class MockScene {
    constructor() {
        this.sound = {
            context: {
                createOscillator: jest.fn(() => ({
                    connect: jest.fn(),
                    start: jest.fn(),
                    stop: jest.fn(),
                    frequency: { value: 440 },
                    type: 'sine',
                })),
                createGain: jest.fn(() => ({
                    connect: jest.fn(),
                    gain: {
                        setValueAtTime: jest.fn(),
                        exponentialRampToValueAtTime: jest.fn(),
                    },
                })),
                destination: {},
                currentTime: 0,
            },
            add: jest.fn(() => ({
                play: jest.fn(),
                stop: jest.fn(),
                pause: jest.fn(),
                resume: jest.fn(),
                isPlaying: false,
                isPaused: false,
            })),
        };
        this.cache = {
            audio: {
                exists: jest.fn(() => false),
            },
        };
        this.registry = {
            get: jest.fn(),
            set: jest.fn(),
        };
    }
}

// Import AudioManager
import { AudioManager } from './AudioManager.js';

describe('AudioManager', () => {
    let scene;
    let audioManager;

    beforeEach(() => {
        scene = new MockScene();
        audioManager = new AudioManager(scene);
    });

    describe('Initialization', () => {
        test('audio manager is created with default settings', () => {
            expect(audioManager.musicEnabled).toBe(true);
            expect(audioManager.sfxEnabled).toBe(true);
            expect(audioManager.sounds).toEqual({});
            expect(audioManager.music).toBeNull();
        });

        test('initialize sets up audio system', () => {
            audioManager.initialize();
            expect(audioManager.sounds).toBeDefined();
        });

        test('initialize loads settings from registry', () => {
            scene.registry.get.mockImplementation(key => {
                if (key === 'musicEnabled') return false;
                if (key === 'sfxEnabled') return false;
                return undefined;
            });

            audioManager.initialize();
            expect(audioManager.musicEnabled).toBe(false);
            expect(audioManager.sfxEnabled).toBe(false);
        });
    });

    describe('Sound Effects', () => {
        beforeEach(() => {
            audioManager.initialize();
        });

        test('playCoinCollect plays sound when sfx enabled', () => {
            audioManager.playCoinCollect();
            // Should not throw error
            expect(audioManager.sfxEnabled).toBe(true);
        });

        test('playEnemyHit plays sound when sfx enabled', () => {
            audioManager.playEnemyHit();
            expect(audioManager.sfxEnabled).toBe(true);
        });

        test('playKiroDamage plays sound when sfx enabled', () => {
            audioManager.playKiroDamage();
            expect(audioManager.sfxEnabled).toBe(true);
        });

        test('playHealthPickup plays sound when sfx enabled', () => {
            audioManager.playHealthPickup();
            expect(audioManager.sfxEnabled).toBe(true);
        });

        test('playDungeonEnter plays sound when sfx enabled', () => {
            audioManager.playDungeonEnter();
            expect(audioManager.sfxEnabled).toBe(true);
        });

        test('playDungeonComplete plays sound when sfx enabled', () => {
            audioManager.playDungeonComplete();
            expect(audioManager.sfxEnabled).toBe(true);
        });

        test('playLevelUp plays sound when sfx enabled', () => {
            audioManager.playLevelUp();
            expect(audioManager.sfxEnabled).toBe(true);
        });

        test('sound effects do not play when sfx disabled', () => {
            audioManager.setSfxEnabled(false);
            audioManager.playCoinCollect();
            // Should not throw error and should not play
            expect(audioManager.sfxEnabled).toBe(false);
        });
    });

    describe('Background Music', () => {
        beforeEach(() => {
            audioManager.initialize();
        });

        test('playMusic starts music when enabled', () => {
            audioManager.playMusic();
            // Should not throw error
            expect(audioManager.musicEnabled).toBe(true);
        });

        test('playMusic does not start when disabled', () => {
            audioManager.setMusicEnabled(false);
            audioManager.playMusic();
            expect(audioManager.music).toBeNull();
        });

        test('stopMusic stops playing music', () => {
            audioManager.playMusic();
            audioManager.stopMusic();
            expect(audioManager.music).toBeNull();
        });

        test('toggleMusic switches music state', () => {
            const initialState = audioManager.musicEnabled;
            const newState = audioManager.toggleMusic();
            expect(newState).toBe(!initialState);
            expect(audioManager.musicEnabled).toBe(!initialState);
        });

        test('toggleSfx switches sfx state', () => {
            const initialState = audioManager.sfxEnabled;
            const newState = audioManager.toggleSfx();
            expect(newState).toBe(!initialState);
            expect(audioManager.sfxEnabled).toBe(!initialState);
        });
    });

    describe('Settings Persistence', () => {
        test('setMusicEnabled saves to registry', () => {
            audioManager.setMusicEnabled(false);
            expect(scene.registry.set).toHaveBeenCalledWith('musicEnabled', false);
        });

        test('setSfxEnabled saves to registry', () => {
            audioManager.setSfxEnabled(false);
            expect(scene.registry.set).toHaveBeenCalledWith('sfxEnabled', false);
        });

        test('isMusicEnabled returns current state', () => {
            audioManager.setMusicEnabled(false);
            expect(audioManager.isMusicEnabled()).toBe(false);
        });

        test('isSfxEnabled returns current state', () => {
            audioManager.setSfxEnabled(false);
            expect(audioManager.isSfxEnabled()).toBe(false);
        });
    });

    describe('Cleanup', () => {
        test('destroy cleans up resources', () => {
            audioManager.initialize();
            audioManager.playMusic();
            audioManager.destroy();
            expect(audioManager.music).toBeNull();
            expect(audioManager.sounds).toEqual({});
        });
    });
});
