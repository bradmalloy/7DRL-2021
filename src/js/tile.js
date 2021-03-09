import { Game } from './index.js';

class Tile {
    constructor(tileType, x, y) {
        this.tileType = tileType;
        this._x = x;
        this._y = y;

        this.actor = null;
        this.resources = 0;
    }
    /**
     * Used in map generation during the resource-adding stage.
     * @param {string} tileType the resource type (coal, iron, etc)
     * @param {amount} amount the amount to start with
     */
    addResources(tileType, amount) {
        this.tileType = tileType;
        this.resources = amount;
    }
    /**
     * Remove one copy of the resource from this tile and return the type.
     * If no resources are left, returns null.
     */
    extractResource() {
        if (this.resources < 1 || this.tileType == "empty") {
            this.tileType = "empty";
            return null;
        }
        this.resources -= 1;
        return this.tileType;
    }
    getType() {
        return this.tileType;
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
        let output = this.tileType; // matches to entry in tile map
        if (this.actor) {
            output = this.actor.represent();
        }
        return output;
    }
    getPositionKey() { return `${this._x},${this._y}`; }
}

export { Tile };