import { Building } from "./building.js"
import { Inventory } from "./inventory.js";
import { Game } from "./index.js";

const defaultExtractorDelay = 5;

class Extractor extends Building {
    static cost = { 'iron': 200 }
    static requiresFacing = false;

    /**
     * Extractors generate a mineral every `delay` turns.
     * @param {number} x x coordinates
     * @param {number} y y coordinates
     * @param {number} delay generate 1 mineral every x turns
     */
    constructor(x, y, delay) {
        super(x, y, [["e"],["e"]]);
        this.delay = delay ? delay : defaultExtractorDelay;
        this.ticksUntilPull = this.delay;
        this.inventory = new Inventory(25);
        this._priority = 1; // see realTimeEngine.update()
        // Used to check for resource type, etc
        this._tile = Game.map[this.getPositionKey()];
    }

    act() {
        // Only act if we're running and off cooldown
        if (this._running && this.ticksUntilPull < 1) {
            // Try to extract resources from the tile
            // Returns null if the tile is empty or out of resources.
            var toAdd = this._tile.getType()
            var amount = this._tile.extractResources(1);
            if (toAdd) {
                this.ticksUntilPull = this.delay;
                this.inventory.add(toAdd, amount);
            } else {
                // if the tile's empty, shut down the miner
                this._running = false;
            }
        } else {
            // if we're running but on cooldown, decrement the counter
            this.ticksUntilPull -= 1;
        }
    }

    getName() { return "Extractor"; }
}

export { Extractor };