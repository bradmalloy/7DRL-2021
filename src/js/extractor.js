import { Building } from "./building.js"
import { Inventory } from "./inventory.js";

const defaultExtractorDelay = 5;

class Extractor extends Building {
    /**
     * Extractors generate a mineral every `delay` turns.
     * @param {number} x x coordinates
     * @param {number} y y coordinates
     * @param {number} delay generate 1 mineral every x turns
     */
    constructor(x, y, delay) {
        super(x, y, "e");
        this.delay = delay ? delay : defaultExtractorDelay;
        this.ticksUntilPull = this.delay;
        this.inventory = new Inventory(25);
    }

    act() {
        if (this._running && this.ticksUntilPull == 0) {
            // check to see what tile we're on
            // if the tile has resources, move one into our inventory
            // for now, just test value
            this.inventory.add('coal');
            this.ticksUntilPull = this.delay;
        } else {
            this.ticksUntilPull -= 1;
        }
    }
}

export { Extractor };