import { Inventory } from "./inventory.js";
import { Building } from "./building.js";
import { Game } from "./index.js";

const defaultConveyorDelay = 5;

const facingTile = {
    "north": "cv",
    "south": "cv",
    "east": "ch",
    "west": "ch"
};

class Conveyor extends Building {
    /**
     * Conveyor belts don't load anything - they only spit out their
     * contents in the direction indicated by the outputDirection.
     * They will act once, then set a delay and count down until they 
     * can act again. "Higher level" conveyer belts have a lower delay,
     * meaning they can move goods faster.
     * @param {number} x x coordinate
     * @param {number} y y coordinate
     * @param {string} outputDirection "north"|"south"|"west"|"east"
     * @param {number} delay number of ticks between actions
     */
    constructor(x, y, outputDirection, delay) {
        let repr = facingTile[outputDirection];
        super(x, y, repr);
        this.inventory = new Inventory(1);
        this.delay = delay ? delay : defaultConveyorDelay;
        this.ticksUntilPull = this.delay;
        // set our output tile
        if (outputDirection == "north") {
            this._outKey = `${x},${y - 1}`;
        } else if (outputDirection == "south") {
            this._outKey = `${x},${y + 1}`;
        } else if (outputDirection == "east") {
            this._outKey = `${x + 1},${y}`;
        } else if (outputDirection == "west") {
            this._outKey = `${x - 1},${y}`;
        } else {
            console.error("Bad inDir!");
        }
        // conveyors start active
        this.start();
    }

    /**
     * A conveyor belt only has one task - take whatever's in its inventory,
     * and move it to the output tile. If the output tile doesn't have an
     * inventory, just don't do anything. Once our inventory fills up, we
     * won't be able to receive any more things.
     */
    act() {
        if (this._running && this.ticksUntilPull == 0) {
            let outTile = Game.map[this._outKey];
            if (outTile.actor && outTile.actor.inventory) {
                // In this case, always moving one item
                // Remove it from us
                let typeToMove = this.inventory.getRandomItemType();
                // Try to add it to our outTile
                let result = outTile.actor.inventory.add(typeToMove);
                if (result) {
                    // If we succeeded, remove our copy of it
                    this.inventory.remove(typeToMove);
                }
            }
            // If outTile is full or doesn't have an inventory, do nothing
        } else {
            // this means we run down the counter, even when off
            // so when turning back on, we'll kick on immediately
            this.ticksUntilPull -= 1;
        } 
    }

    /**
     * Unlike other buildings, conveyor belts should show their own tile,
     * with a tile for the resource overlaid on top.
     * This is accomplished by drawing an array:
     * http://ondras.github.io/rot.js/manual/#tiles
     */
    represent() {
        console.log("Conveyor belt drawing!");
        if (!this.inventory || !this.inventory.hasItems()) {
            // Empty conveyor - just one tile
            return this._repr;
        } else if (this.inventory && this.inventory.hasItems()) {
            // Has an item - stack the item tile on top
            console.info(this.inventory.getRandomItemType());
            return [this._repr, this.inventory.getRandomItemType()];
        }
    }
}

export { Conveyor };