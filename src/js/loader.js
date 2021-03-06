import { Game } from "./index.js";

class Loader {
    _repr = null;
    constructor(x, y, inDir) {
        this._x = x;
        this._y = y;
        // inDir can be "north", "south", "east", "west"
        if (inDir == "north") {
            this._in = [x, y - 1];
            this._repr = "Ln";
        } else if (inDir == "south") {
            this._in = [x, y + 1];
            this._repr = "Ls";
        } else if (inDir == "east") {
            this._in = [x + 1, y];
            this._repr = "Le";
        } else if (inDir == "west") {
            this._in = [x - 1, y];
            this._repr = "Lw";
        } else {
            console.error("Bad inDir!");
        }

        Game.map[this.getPositionKey()].addActor(this);
        Game.engine.add(this);
    }

    start() {
        this._running = true;
    }

    represent() {
        // The facing of the loader impacts the 
        // facing of the tile
        return this._repr;
    }

    getPositionKey() { return `${this._x},${this._y}`; }

    stop() {
        this._running = false;
    }

    act() {
        if (this._running) {
            // check to see if the "in" tile has an inventory
            // if it does, take out whatever's there and push it out the other side
        }
    }
}

export { Loader };