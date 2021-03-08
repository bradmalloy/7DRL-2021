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
     * Store 1 of an item, if there's room.
     * If we can, return true. If we can't, return false.
     * @param {string} itemType the thing to store
     */
    add(itemType) {
        if (!itemType) {
            return;
        }
        let existingAmount = this._bag[itemType];
        if (existingAmount) {
            // ex: maxSize 1 - only accept if we have 0
            if (existingAmount < this._maxSize) {
                this._bag[itemType] += 1;
                return true;
            } else {
                return false;
            }
        } else {
            this._bag[itemType] = 1;
            return true;
        }
    }

    /**
     * Decrement 1 of some item. If it doesn't exist, return null.
     * @param {string} itemType which item to grab.
     */
    remove(itemType) {
        let existingAmount = this._bag[itemType];
        if (existingAmount) {
            this._bag[itemType] -= 1;
            return true;
        } else {
            return false;
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
     * Get the name of an item that we have more than 1 of in our inventory.
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