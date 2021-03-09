const defaultMaxSize = 999;
// Used to calculate number of items in inventory
const doSum = (accumulator, currentValue) => accumulator + currentValue;
/**
 * Buildings which hold resources (extractors, conveyors, etc)
 * have these.
 * `maxSize` is the maximum number of things that this inventory can 
 * hold.
 */
class Inventory {
    constructor(maxSize) {
        this._maxSize = maxSize ? maxSize : defaultMaxSize;
        this._bag = {};

        this.add = this.add.bind(this);
        this.remove = this.remove.bind(this);
        this.hasItems = this.hasItems.bind(this);
        this.getItemTypes = this.getItemTypes.bind(this);
        this.getRandomItemType = this.getRandomItemType.bind(this);
    }

    /**
     * Store an arbitrary number of things.
     * If it works, return true. If not, return false.
     * @param {string} itemType the thing to store
     * @param {number} amount the amount to store
     */
    add(itemType, amount) {
        if (!itemType || !amount) {
            console.error("⛔ Inventory.add() missing an argument!");
            return;
        }
        let existingAmount = this._bag[itemType];
        if (existingAmount) {
            // ex: maxSize 1 - only accept if we have 0
            if ((existingAmount + amount) < this._maxSize) {
                this._bag[itemType] += amount;
                return true;
            } else {
                return false;
            }
        } else {
            this._bag[itemType] = amount;
            return true;
        }
    }

    /**
     * Decrement some amount of some item. If it doesn't exist, return 0.
     * If it does, return how much was removed.
     * @param {string} itemType which item to grab.
     * @param {number} amount how much to remove
     */
    remove(itemType, amount) {
        let existingAmount = this._bag[itemType];
        if ((existingAmount - amount) >= 0) {
            this._bag[itemType] -= amount;
            return amount;
        } else {
            return 0;
        }
    }

    /**
     * Remove all the items, and return the number which was removed.
     * @param {string} itemType which item to grab
     */
    removeAll(itemType) {
        let existingAmount = this._bag[itemType];
        if (existingAmount) {
            this._bag[itemType] = 0;
            return existingAmount;
        } else {
            return 0;
        }
    }

    /**
     * Returns true if there are any items in the Inventory, false otherwise.
     */
    hasItems() {
        if (Object.keys(this._bag).length > 0) {
            if (Object.values(this._bag).reduce(doSum) > 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * Can this inventory fit one more item?
     * TODO: include types - eg an excavator can't accept anything, and an conveyor
     * can only have 1 type at a time
     */
    canAcceptItem() {
        // https://stackoverflow.com/questions/23359173/javascript-reduce-an-empty-array
        return Object.values(this._bag).reduce(doSum, 0) < this._maxSize;
    }

    /**
     * Return the number of the given type of item exist in the bag.
     * @param {string} itemType the item type to check
     */
    count(itemType) {
        if (!itemType) {
            console.error("Invalid itemType for count()");
        }
        let amount = this._bag[itemType];
        return amount ? amount : 0;
    }

    /**
     * Get names of all the types of items for which we have 
     * 1 or more in our inventory.
     */
    getItemTypes() {
        let allKeys = Object.keys(this._bag);
        let keysWithItems = [];
        for (let index in allKeys) {
            let key = allKeys[index];
            if (this._bag[key] > 0) {
                keysWithItems.push(key);
            }
        }
        return keysWithItems;
    }

    /**
     * Generates an array of <li> elements to be placed in an HTML UI element.
     */
    generateListItems() {
        var output = [];
        let itemTypesWithMoreThanZero = this.getItemTypes();
        for (let index in itemTypesWithMoreThanZero) {
            let itemType = itemTypesWithMoreThanZero[index];
            let elem = document.createElement("li");
            elem.innerText = `${itemType}: ${this._bag[itemType]}`
            output.push(elem);
        }
        return output;
    }

    /**
     * Get the name of an item that we have more than 1 of in our inventory.
     * 
     * This pulls the *only* item type for inventories which only have 1 thing.
     * 
     * When pulling things out of the inventory, sometimes we just want 
     * to get any old item, not something specific (ex: conveyor belts).
     * For conveyor belts specifically, this pulls the *only* item type.
     */
    getRandomItemType() {
        let keysLength = this.getItemTypes().length;
        if (keysLength == 0) {
            return null;
        }
        let index = Math.floor(Math.random() * Math.floor(keysLength));
        return this.getItemTypes()[index];
    }
}

export { Inventory };