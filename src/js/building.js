/**
 * Base class for buildables.
 * Adds self to game on construct, provides getPositionKey, start, stop.
 */
class Building {
    constructor(x, y) {
        this._x = x;
        this._y = y;
        this._repr = "?";
        this._running = false;
        Game.map[this.getPositionKey()].addActor(this);
        Game.engine.add(this);
    }

    start() {
        this._running = true;
    }

    getPositionKey() { return `${this._x},${this._y}`; }

    stop() {
        this._running = false;
    }

    represent() {
        return this._repr;
    }

    act() {
        throw new Error("Children must implement this method");
    }
}