import { Inventory } from "./inventory.js";
import { Game } from "./index.js";
import { Building } from "./building.js";

class Generator extends Building {
    static cost = { "iron": 300 };
    static requiresFacing = false;

    /**
     * When filled with coal, generates power.
     * 
     * @param {number} x x coordinate
     * @param {number} y y coordinate
     */
    constructor(x, y) {
        super(x, y);
        this._repr = "g";
        this.powerGenerated = 500;
        // Consume fuel every 5 turns
        this.ticksUntilGen = 10;
        this.delay = this.ticksUntilGen;
        this.inventory = new Inventory(500);
    }

    getName() {
        return "Generator";
    }

    act() {
        if (this.ticksUntilGen != 0) {
            this.ticksUntilGen -= 1;
            return;
        }
        // If we run out of power, we'll stop running and providing power
        if (this._running) {
            let success = this.inventory.remove("coal", 1);
            // If we run out of coal, stop
            if (!success) {
                this._running = false;
                return;
            }
            this._updateAllDirections(this.powerGenerated);
            this.ticksUntilGen = this.delay; 
        } else {
            // if we're not running, update to 0 power
            this._updateAllDirections(0);
        }
    }

    /**
     * Update all our connected directions with power.
     * @param {number} powerGenerated 
     */
    _updateAllDirections(powerGenerated) {
        // Otherwise, generate power and distribute it to everything N/S/E/W
        let north = Game.map[`${this._x},${this._y-1}`];
        let south = Game.map[`${this._x},${this._y+1}`];
        let east = Game.map[`${this._x+1},${this._y}`];
        let west = Game.map[`${this._x-1},${this._y}`];
        var cardinals = [north, south, east, west];

        for (let i = 0; i < cardinals.length; i++) {
            let dir = cardinals[i];
            if (dir?.actor?.powerSystem) {
                dir.actor.powerSystem.available = powerGenerated;
            }
        }
    }
}

export { Generator };