/**
 * A stack of items. Stores item type (eg: coal, iron) and
 * number of items.
 */
class Stack {
    constructor(itemType, amount) {
        this.itemType = itemType;
        this.amount = amount;
    }
}

export { Stack };