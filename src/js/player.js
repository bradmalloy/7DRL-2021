import { Game } from "./index.js";

const keyMappings = {
    '37': 6, // west (ROT.DIRS)
    '38': 0, // north
    '39': 2, // east
    '40': 4 // south
}

// 0-7 are the 8 directions
const moveKeys = [6,0,2,4];

/**
 * For now, the player is just a cursor w/o a physical body.
 */
class Player {
    constructor(x, y) {
        this._x = x;
        this._y = y;

        // Maps to handleEvent(e)
        window.addEventListener("keydown", this);
    }

    /**
     * Handles key presses in the browser.
     * @param {Event} e the keydown event
     */
    handleEvent(e) {
        var eventCode = e.keyCode;
        if (!eventCode in Object.keys(keyMappings)) {
            // ignore unmapped keypresses 
            return;
        }
        var code = keyMappings[`${eventCode}`];

        // Cursor movement
        if (moveKeys.includes(code)) {
            var diff = ROT.DIRS[8][code];
            var newX = this._x + diff[0];
            var newY = this._y + diff[1];
            var newKey = `${newX},${newY}`;
            if (!(newKey in Game.map)) {
                console.debug(`Player tried to move out of bounds to [${newKey}]`);
                return;
            }
            var destination = Game.map[newKey];
            this._x = newX;
            this._y = newY;
        }
        // Build

        // Delete

        // Every time the player presses a button, render their cursor.
        // This should feel snappier than waiting on Game update() cycles.
        Game._drawWholeMap();
    }

    represent() { 
        return "@";
    }

    getPositionKey() { return `${this._x},${this._y}`; }
}

export { Player };