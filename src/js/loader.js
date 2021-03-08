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
        this._priority = 2; // see realTimeEngine.update()
    }

    act() {
        if (this._running) {
            // Check to see if our input and output have items and can accept items
            let inTile = Game.map[this._inKey];
            let outTile = Game.map[this._outKey];
            if (inTile?.actor?.inventory.hasItems() && outTile?.actor?.inventory.canAcceptItem()) {
                // If so, take out whatever's there and push it out the other side
                let typeToMove = inTile.actor.inventory.getRandomItemType();
                let successfullyRemovedItem = inTile.actor.inventory.remove(typeToMove);
                if (successfullyRemovedItem) {
                    let gaveItem = outTile.actor.inventory.add(typeToMove);
                    console.debug(`Loader moved an item from [${this._inKey}] to [${this._outKey}]`);
                    if (!gaveItem) {
                        console.error(`Loader at ${this.getPositionKey()} deleted an item 😭`);
                    }
                }
            }
        }
    }
}

export { Loader };