import { Inventory } from "./inventory.js";
import { Building } from "./building.js";

const uiCounter = document.getElementById("testBoxCounter");

/**
 * Stores a small number of items.
 */
class Box extends Building {
    constructor(x, y) {
        super(x, y, "b");
        this.inventory = new Inventory(50);
        // optimization - don't update the DOM 
        // unless we have something novel to say
        this.lastUiUpdate = null;
        this._priority = 1; // see realTimeEngine.update()
    }

    /**
     * Boxes do nothing, but do update UI elements.
     */
    act() {
        let itemType = this.inventory.getRandomItemType();
        if (!itemType) {
            return;
        }
        let amount = this.inventory.count(itemType);
        let uiText = `${itemType}: ${amount}`
        if (uiText != this.lastUiUpdate) {
            uiCounter.innerText = uiText;
            this.lastUiUpdate = uiText;
        }
        return;
    }
}

export { Box };