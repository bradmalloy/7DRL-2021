import { Inventory } from "./inventory.js";
import { Building } from "./building.js";
import { Game } from "./index.js";

const defaultConveyorDelay = 0;
const beltListUiCounter = document.getElementById("beltCounters");

const facingTile = {
    "north": "cv",
    "south": "cv",
    "east": "ch",
    "west": "ch"
};

class Conveyor extends Building {
    static cost = { 'iron': 50 }
    static requiresFacing = true;

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
            console.error("Bad outputDirection!");
        }
        // input direction matters for calculating priority
        // this assumes that this is a straight conveyor belt
        if (outputDirection == "north") {
            this._inKey = `${x},${y + 1}`;
        } else if (outputDirection == "south") {
            this._inKey = `${x},${y - 1}`;
        } else if (outputDirection == "east") {
            this._inKey = `${x - 1},${y}`;
        } else if (outputDirection == "west") {
            this._inKey = `${x + 1},${y}`;
        } else {
            console.error("Bad outputDirection!");
        }
        // when any conveyor is placed, all belts should calculate their priority
        this.calculatePriorityAndUpdateWholeBelt();
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
            // Check if the output can accept an item
            if (outTile?.actor?.inventory?.canAcceptItem()) {
                // If so, figure out our item type
                let typeToMove = this.inventory.getRandomItemType();
                // Try to add it to our outTile
                if (typeToMove) {
                    let result = outTile.actor.inventory.add(typeToMove, 1);
                    if (result) {
                        // If we succeeded, remove our copy of it
                        this.inventory.remove(typeToMove, 1);
                    }
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
     * Look at our output tile - if it contains a conveyor, look at the output's
     * output. Continue this until we find the last conveyor, and count how many
     * steps we are away from the end. Our priority level starts at 100, and goes
     * up by 1 for each step.
     * 
     * ex: A -> B -> C -> D
     * D: 100, C: 101, B: 102, A: 103
     */
    calculateAndSetPriority() {
        var stepsFromEnd = 0;
        var outTile = Game.map[this._outKey];
        while (outTile?.actor instanceof Conveyor) {
            stepsFromEnd += 1;
            //console.debug(`At ${outTile.actor.getPositionKey()}, checking ${outTile.actor._outKey}`);
            outTile = Game.map[outTile.actor._outKey];
        }
        console.debug(`${this.getPositionKey()} is ${stepsFromEnd} steps from the end of the belt.`)
        this._priority = 100 + stepsFromEnd;
    }

    /**
     * When a conveyor belt is placed, it needs to know where it is in the
     * line in order to set its update() priority. This causes the whole 
     * belt segment to shift.
     */
    calculatePriorityAndUpdateWholeBelt() {
        // First, update us
        this.calculateAndSetPriority();
        // Then walk the line BACKWARDS and have each belt update itself
        var inTile = Game.map[this._inKey];
        while (inTile?.actor instanceof Conveyor) {
            // update the tile
            inTile.actor.calculateAndSetPriority();
            // find the next one
            inTile = Game.map[inTile.actor._inKey];
        }
        // In case this belt connects two segments (on the in and out side)
        // also check the out-side
        var outTile = Game.map[this._outKey];
        while (outTile?.actor instanceof Conveyor) {
            outTile.actor.calculateAndSetPriority();
            outTile = Game.map[outTile.actor._outKey];
        }
    }

    /**
     * Unlike other buildings, conveyor belts should show their own tile,
     * with a tile for the resource overlaid on top.
     * This is accomplished by drawing an array:
     * http://ondras.github.io/rot.js/manual/#tiles
     */
    represent() {
        if (!this.inventory || !this.inventory.hasItems()) {
            // Empty conveyor - just one tile
            return this._repr;
        } else if (this.inventory && this.inventory.hasItems()) {
            // Has an item - stack the item tile on top
            return [this._repr, this.inventory.getRandomItemType()];
        }
    }

    getName() { return "Conveyor Belt"; }
}

export { Conveyor };