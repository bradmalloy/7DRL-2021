import { Game } from './index.js';

class Tile {
    constructor(tileType, x, y) {
        this.tileType = tileType;
        this._x = x;
        this._y = y;

        this.item = null;
        this.actor = null;
        this.walkable = true;
    }
    isEmpty() {
        return this.actor == null;
    }
    addActor(actor) {
        if (this.actor) {
            // If we already have someone in the tile, don't add another
            console.debug(`⛔ Can't add ${actor.represent()} in tile ${this.getPositionKey()}, already has ${this.actor.represent()}`);
        }
        this.actor = actor;
        Game.display.draw(this._x, this._y, this.display());
    }
    removeActor(actor) {
        if (actor == this.actor) {
            this.actor = null;
        } else {
            console.error("Tried to remove the wrong actor?");
        }
        Game.display.draw(this._x, this._y, this.display());
    }
    display() {
        let output = ".";
        // Items are less important than actors
        if (this.actor) {
            output = this.actor.represent();
        }
        return output;
    }
    getPositionKey() { return `${this._x},${this._y}`; }
}

export { Tile };