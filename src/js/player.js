import { Conveyor } from "./conveyor.js";
import { Extractor } from "./extractor.js";
import { Game } from "./index.js";
import { Loader } from "./loader.js";
import { Box } from "./storage.js";

const keyMappings = {
  27: "Escape",
  37: 6, // left arrow (ROT.DIRS)
  38: 0, // up arrow
  39: 2, // right arrow
  40: 4, // down arroy
  66: "b", // toggle build menu
  77: "m", // miner
  76: "l", // loader
  67: "c", // conveyor
  83: "s", // storage & south
  69: "e", // east
  87: "w", // west
  78: "n" // north
};

// For use with Building constructors which require facing
const codeToFacingMap = {
    'n': 'north',
    's': 'south',
    'w': 'west',
    'e': 'east'
}

// 0-7 are the 8 directions
const moveKeys = [6, 0, 2, 4];

const buildMenuElement = document.getElementById("buildMenu");

/**
 * For now, the player is just a cursor w/o a physical body.
 */
class Player {
  constructor(x, y) {
    this._x = x;
    this._y = y;
    // When this is true, keypresses will be judged by the build menu
    this._inBuildMenu = false;
    // This holds part of a building code. ex: 'c' for conveyor
    // before the player chooses a facing ('cn' or 'cs', etc)
    this._buildingOnDeck = null;

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
    // Stop keys from doing anything else, like scrolling the page
    e.preventDefault();
    e.stopPropagation();

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
      this._x = newX;
      this._y = newY;
    }

    // Cancel building, close build menu
    if (code == 'Escape') {
        this._buildingOnDeck = null;
        this._inBuildMenu = false;
        buildMenuElement.style.display = "none";
    }

    // Open build menu
    if (code == "b") {
      this.toggleBuildMenu();
      // Toggle on and off with 'b'
      this._inBuildMenu = !this._inBuildMenu;
      return;
    }

    // In build menu
    if (this._inBuildMenu && !this._buildingOnDeck) {
        if (code == 'm') {
            let newMiner = new Extractor(this._x, this._y);
            // TODO: don't autostart
            newMiner.start();
        } else if (code == 'l') {
            // Put this on-deck - the player will need to choose a facing
            this._buildingOnDeck = 'loader';
        } else if (code == 'c') {
            // Put this on-deck - the player will need to choose a facing
            this._buildingOnDeck = 'conveyor';
        } else if (code == 's') {
            let newBox = new Box(this._x, this._y);
        }
        return;
    }

    // In build menu, with building on-deck, choosing facing
    if (this._inBuildMenu && this._buildingOnDeck) {
        var facing = codeToFacingMap[code]
        if (!facing) {
            // if they press something outside n/s/e/w
            return;
        }
        if (this._buildingOnDeck == 'conveyor') {
            let newConveyor = new Conveyor(this._x, this._y, facing);
            this._buildingOnDeck = null;
        } else if (this._buildingOnDeck == 'loader') {
            let newLoader = new Loader(this._x, this._y, facing);
            newLoader.start();
            this._buildingOnDeck = null;
        }
        return;
    }

    // Delete

    // Every time the player presses a button, render their cursor.
    // This should feel snappier than waiting on Game update() cycles.
    Game._drawWholeMap();
  }

  toggleBuildMenu() {
    if (
      buildMenuElement.style.display == "none" ||
      buildMenuElement.style.display == ""
    ) {
      buildMenuElement.style.display = "flex";
    } else {
      buildMenuElement.style.display = "none";
    }
  }

  represent() {
    return "@";
  }

  getPositionKey() {
    return `${this._x},${this._y}`;
  }
}

export { Player };
