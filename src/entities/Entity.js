// Entity - Base class for all game entities
// To be implemented in future tasks

class Entity {
    constructor(scene, x, y, sprite) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.sprite = sprite;
    }

    update(delta) {
        // To be implemented
    }

    destroy() {
        // To be implemented
    }
}
