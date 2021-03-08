import { Building } from "./building.js"
import { Inventory } from "./inventory.js";

const defaultExtractorDelay = 5;
const extractorTestUi = document.getElementById("extractorCounter");

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
        this._priority = 1; // see realTimeEngine.update()
    }

    act() {
        if (this._running && this.ticksUntilPull < 1) {
            // check to see what tile we're on
            // if the tile has resources, move one into our inventory
            // for now, just test value
            this.inventory.add('coal');
            this.ticksUntilPull = this.delay;
        } else {
            this.ticksUntilPull -= 1;
        }
        let itemType = this.inventory.getRandomItemType();
        if (!itemType) {
            return;
        }
        let amount = this.inventory.count(itemType);
        let uiText = `${itemType}: ${amount}`;
        extractorTestUi.innerText = uiText;
    }
}

export { Extractor };