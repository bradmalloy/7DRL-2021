import { Inventory } from "./inventory.js";
import { Building } from "./building.js";

/**
 * Stores a small number of items.
 */
class Box extends Building {
    constructor(x, y) {
        super(x, y, "b");
        this.inventory = new Inventory(50);
    }

    /**
     * Boxes do nothing.
     */
    act() {
        return;
    }
}

export { Box };