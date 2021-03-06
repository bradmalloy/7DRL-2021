import { Game } from "./index.js";

const coalCounter = document.getElementById("coalCounter");

class Extractor {
    constructor(x, y) {
        this._x = x;
        this._y = y;
        this._running = false;

        this.inventory = {
            'coal': 0,
            'iron': 0,
            'gold': 0
        };

        Game.map[this.getPositionKey()].addActor(this);
        Game.engine.add(this);
    }

    start() {
        this._running = true;
    }

    represent() {
        return "e";
    }

    getPositionKey() { return `${this._x},${this._y}`; }

    stop() {
        this._running = false;
    }

    act() {
        if (this._running) {
            // check to see what tile we're on
            // if the tile has resources, move one into our inventory
            // for now, just test value
            console.log("extractor acting...")
            this.inventory['coal'] += 1
            coalCounter.innerText = `${this.inventory['coal']}`;
        }
    }
}

export { Extractor };