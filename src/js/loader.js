import { Building } from "./building.js";
import { Inventory } from "./inventory.js";
import { Game } from "./index.js";

const facingTile = {
    "north": "Ln",
    "south": "Ls",
    "west": "Lw",
    "east": "Le"
}

class Loader extends Building {
    constructor(x, y, inDir) {
        // Pick the tile based on facing
        let repr = facingTile[inDir];
        super(x, y, repr);
        this.inventory = new Inventory(1);
        // inDir can be "north", "south", "east", "west"
        if (inDir == "north") {
            this._inKey = `${x},${y - 1}`;
        } else if (inDir == "south") {
            this._inKey = `${x},${y + 1}`;
        } else if (inDir == "east") {
            this._inKey = `${x + 1},${y}`;
        } else if (inDir == "west") {
            this._inKey = `${x - 1},${y}`;
        } else {
            console.error("Bad inDir!");
        }
        // set our output tile
        if (inDir == "north") {
            this._outKey = `${x},${y + 1}`;
        } else if (inDir == "south") {
            this._outKey = `${x},${y - 1}`;
        } else if (inDir == "east") {
            this._outKey = `${x - 1},${y}`;
        } else if (inDir == "west") {
            this._outKey = `${x + 1},${y}`;
        } else {
            console.error("Bad inDir!");
        }
    }

    act() {
        if (this._running) {
            // check to see if the "in" tile has an inventory
            let inTile = Game.map[this._inKey];
            let building = inTile.actor;
            if (building && building.inventory && building.inventory.hasItems()) {
                // if it does, take out whatever's there and push it out the other side
                let typeToTake = inTile.actor.inventory.getRandomItemType();
                let result = inTile.actor.inventory.remove(typeToTake);
                if (result) {
                    this.inventory.add(typeToTake);
                }
            }
            let outTile = Game.map[this._outKey];
            if (this.inventory.hasItems() && outTile.actor && outTile.actor.inventory) {
                let typeToGive = this.inventory.getRandomItemType();
                let result = outTile.actor.inventory.add(typeToGive);
                if (result) {
                    this.inventory.remove(typeToGive);
                }
            }
        }
    }
}

export { Loader };