import { Game } from "./index.js";
/**
 * Base class for buildables.
 * Adds self to game on construct, provides getPositionKey, start, stop.
 * Buildables must:
 * - implement act()
 * - call super(x, y, repr) before anything else in constructor
 * 
 * `repr` is a character or short code that maps to a tile.
 */
class Building {
    /**
     * An example would be:
     * x = 1
     * y = 1
     * repr = [null, "#", null, null, "#", null, "#", "#", "#"]
     * 
     * This would draw an inverted T shape:
     * _#_
     * _#_
     * ###
     * @param {number} x top-left x value (or only x value)
     * @param {number} y top-left y value (or only y value)
     * @param {Array of Arrays} repr 2d array of charMap codes
     */
    constructor(x, y, repr) {
        this._x = x;
        this._y = y;
        this._repr = repr ? repr : ["?"];
        this._running = false;
        this._priority = null;
        Game.map[this.getPositionKey()].addActor(this);
        Game.engine.add(this);
    }

    start() {
        this._running = true;
    }

    toggleRunning() {
        this._running = !this._running;
        console.debug(`[${this.getPositionKey()}] was toggled ${this._running ? "on" : "off"}`);
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

export { Building };