import { Building } from "./building.js"

const coalCounter = document.getElementById("coalCounter");

class Extractor extends Building {
    constructor(x, y) {
        super(x, y, "e");

        this.inventory = {
            'coal': 0,
            'iron': 0,
            'gold': 0
        };
    }

    act() {
        if (this._running) {
            // check to see what tile we're on
            // if the tile has resources, move one into our inventory
            // for now, just test value
            this.inventory['coal'] += 1
            coalCounter.innerText = `${this.inventory['coal']}`;
        }
    }
}

export { Extractor };