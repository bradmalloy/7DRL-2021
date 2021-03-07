import { Building } from "./building.js"
import { Inventory } from "./inventory.js";

class Extractor extends Building {
    constructor(x, y) {
        super(x, y, "e");

        this.inventory = new Inventory(25);
    }

    act() {
        if (this._running) {
            // check to see what tile we're on
            // if the tile has resources, move one into our inventory
            // for now, just test value
            this.inventory.add('coal');
        }
    }
}

export { Extractor };