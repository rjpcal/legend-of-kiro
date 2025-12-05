// ParticleSystem - Manages particle effects for visual feedback
// Validates: Requirements 10.1, 10.2

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.activeParticles = [];

        // Configuration
        this.CONFIG = {
            // Attack impact particles
            ATTACK_PARTICLE_COUNT: 8,
            ATTACK_PARTICLE_SPEED: 150,
            ATTACK_PARTICLE_LIFETIME: 400,
            ATTACK_PARTICLE_SIZE: 4,
            ATTACK_PARTICLE_COLOR: 0x790ecb, // Kiro purple

            // Collection particles
            COIN_PARTICLE_COUNT: 12,
            COIN_PARTICLE_SPEED: 100,
            COIN_PARTICLE_LIFETIME: 600,
            COIN_PARTICLE_SIZE: 3,
            COIN_PARTICLE_COLOR: 0xffd700, // Gold

            HEALTH_PARTICLE_COUNT: 10,
            HEALTH_PARTICLE_SPEED: 80,
            HEALTH_PARTICLE_LIFETIME: 500,
            HEALTH_PARTICLE_SIZE: 3,
            HEALTH_PARTICLE_COLOR: 0x00ff00, // Green

            ITEM_PARTICLE_COUNT: 10,
            ITEM_PARTICLE_SPEED: 100,
            ITEM_PARTICLE_LIFETIME: 500,
            ITEM_PARTICLE_SIZE: 3,
            ITEM_PARTICLE_COLOR: 0xffffff, // White
        };
    }

    /**
     * Create attack impact particle effect
     * Validates: Requirements 10.1
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    createAttackImpactEffect(x, y) {
        this.createBurstEffect(x, y, {
            count: this.CONFIG.ATTACK_PARTICLE_COUNT,
            speed: this.CONFIG.ATTACK_PARTICLE_SPEED,
            lifetime: this.CONFIG.ATTACK_PARTICLE_LIFETIME,
            size: this.CONFIG.ATTACK_PARTICLE_SIZE,
            color: this.CONFIG.ATTACK_PARTICLE_COLOR,
        });
    }

    /**
     * Create coin collection particle effect
     * Validates: Requirements 10.2
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    createCoinCollectionEffect(x, y) {
        this.createBurstEffect(x, y, {
            count: this.CONFIG.COIN_PARTICLE_COUNT,
            speed: this.CONFIG.COIN_PARTICLE_SPEED,
            lifetime: this.CONFIG.COIN_PARTICLE_LIFETIME,
            size: this.CONFIG.COIN_PARTICLE_SIZE,
            color: this.CONFIG.COIN_PARTICLE_COLOR,
        });
    }

    /**
     * Create health collection particle effect
     * Validates: Requirements 10.2
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    createHealthCollectionEffect(x, y) {
        this.createBurstEffect(x, y, {
            count: this.CONFIG.HEALTH_PARTICLE_COUNT,
            speed: this.CONFIG.HEALTH_PARTICLE_SPEED,
            lifetime: this.CONFIG.HEALTH_PARTICLE_LIFETIME,
            size: this.CONFIG.HEALTH_PARTICLE_SIZE,
            color: this.CONFIG.HEALTH_PARTICLE_COLOR,
        });
    }

    /**
     * Create item collection particle effect
     * Validates: Requirements 10.2
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    createItemCollectionEffect(x, y) {
        this.createBurstEffect(x, y, {
            count: this.CONFIG.ITEM_PARTICLE_COUNT,
            speed: this.CONFIG.ITEM_PARTICLE_SPEED,
            lifetime: this.CONFIG.ITEM_PARTICLE_LIFETIME,
            size: this.CONFIG.ITEM_PARTICLE_SIZE,
            color: this.CONFIG.ITEM_PARTICLE_COLOR,
        });
    }

    /**
     * Create a burst particle effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {object} config - Particle configuration
     */
    createBurstEffect(x, y, config) {
        const particles = [];

        for (let i = 0; i < config.count; i++) {
            // Calculate random angle for particle direction
            const angle = (Math.PI * 2 * i) / config.count + (Math.random() - 0.5) * 0.5;

            // Calculate velocity
            const speed = config.speed * (0.7 + Math.random() * 0.6); // Vary speed
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            // Create particle sprite
            const particle = this.scene.add.circle(x, y, config.size, config.color, 1);
            particle.setDepth(50); // High depth to render above most things

            // Store particle data
            const particleData = {
                sprite: particle,
                vx: vx,
                vy: vy,
                lifetime: config.lifetime,
                createdAt: Date.now(),
                initialAlpha: 1,
            };

            particles.push(particleData);
            this.activeParticles.push(particleData);
        }

        return particles;
    }

    /**
     * Update all active particles
     * @param {number} delta - Time elapsed since last frame in milliseconds
     */
    update(delta) {
        const now = Date.now();
        const particlesToRemove = [];

        for (const particle of this.activeParticles) {
            const age = now - particle.createdAt;

            // Check if particle has expired
            if (age >= particle.lifetime) {
                particlesToRemove.push(particle);
                continue;
            }

            // Update particle position
            const deltaSeconds = delta / 1000;
            particle.sprite.x += particle.vx * deltaSeconds;
            particle.sprite.y += particle.vy * deltaSeconds;

            // Apply gravity (particles fall slightly)
            particle.vy += 200 * deltaSeconds;

            // Fade out particle based on lifetime
            const lifetimeProgress = age / particle.lifetime;
            particle.sprite.setAlpha(particle.initialAlpha * (1 - lifetimeProgress));

            // Shrink particle slightly
            const scale = 1 - lifetimeProgress * 0.5;
            particle.sprite.setScale(scale);
        }

        // Remove expired particles
        for (const particle of particlesToRemove) {
            particle.sprite.destroy();
            const index = this.activeParticles.indexOf(particle);
            if (index > -1) {
                this.activeParticles.splice(index, 1);
            }
        }
    }

    /**
     * Clear all active particles
     */
    clear() {
        for (const particle of this.activeParticles) {
            if (particle.sprite) {
                particle.sprite.destroy();
            }
        }
        this.activeParticles = [];
    }

    /**
     * Destroy the particle system
     */
    destroy() {
        this.clear();
    }
}
