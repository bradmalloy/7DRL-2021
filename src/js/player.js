import { config } from "./config.js";
import { Conveyor } from "./conveyor.js";
import { Extractor } from "./extractor.js";
import { Game } from "./index.js";
import { Inventory } from "./inventory.js";
import { Loader } from "./loader.js";
import { Box } from "./storage.js";

const keyMappings = {
  27: "Escape",
  8: "Backspace",
  46: "Delete",
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
  78: "n", // north
  71: "g" // get
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

const playerInventoryListElement = document.getElementById("playerInventoryList");

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
    // Player now has an inventory from which resources are spent to build buildings
    this.inventory = new Inventory(99999);

    // TODO: remove this
    this.inventory.add("iron", 500);
    this.updateInventoryUi();

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
    var currentTile = Game.map[this.getPositionKey()]; // pre-movement

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
      Game.updateCurrentTileUi();
    }

    // Cancel building, close build menu
    if (code == 'Escape') {
        this._buildingOnDeck = null;
        this._inBuildMenu = false;
        buildMenuElement.style.display = "none";
    }

    // Delete building
    if (code == 'Backspace' || code == 'Delete') {
        if (currentTile.hasBuilding()) {
            // Refund part of the cost of the building
            let staticCost = currentTile.actor.constructor.cost;
            var itemKeys = Object.keys(staticCost);
            for (let i in itemKeys) {
                let key = itemKeys[i];
                // Apply the modifier and round up
                // ex: a building costs 150 iron, return 75 at 0.5 refundRate
                let amountToRefund = Math.ceil(staticCost[key] * config.game.buildingRefundRate);
                this.inventory.add(key, amountToRefund);
            }
            // Remove it from the tile
            currentTile.removeActor();
        }
        return;
    }

    // Pickup resources
    if (code == 'g') {
        // only get resources from buildings with inventory that's not empty
        if (currentTile?.actor?.inventory?.hasItems()) {
            let toGrab = currentTile.actor.inventory.getRandomItemType();
            let amount = currentTile.actor.inventory.removeAll(toGrab);
            let result = this.inventory.add(toGrab, amount);
            if (!result) {
                // if we failed to add the stuff to our inventory, try to return it
                let undoResult = currentTile.actor.inventory.add(toGrab, amount);
                if (!undoResult) {
                    console.error("😲 Failed to return items to inventory after failed pickup!");
                }
            } else {
                // update the UI with our new stuff
                this.updateInventoryUi();
            }
        }
    }

    // Open and close the build menu
    if (code == "b") {
      this.toggleBuildMenu();
      // Toggle on and off with 'b'
      this._inBuildMenu = !this._inBuildMenu;
      return;
    }

    // In build menu
    if (this._inBuildMenu && !this._buildingOnDeck) {
        if (code == 'm') {
            this.constructBuilding(Extractor);
        } else if (code == 'l') {
            // Put this on-deck - the player will need to choose a facing
            this._buildingOnDeck = 'loader';
        } else if (code == 'c') {
            // Put this on-deck - the player will need to choose a facing
            this._buildingOnDeck = 'conveyor';
        } else if (code == 's') {
            this.constructBuilding(Box);
        }
    }

    // In build menu, with building on-deck, choosing facing
    if (this._inBuildMenu && this._buildingOnDeck) {
        var facing = codeToFacingMap[code]
        if (!facing) {
            // if they press something outside n/s/e/w
            return;
        }
        if (this._buildingOnDeck == 'conveyor') {
            this.constructBuilding(Conveyor, facing);
            this._buildingOnDeck = null;
        } else if (this._buildingOnDeck == 'loader') {
            this.constructBuilding(Loader, facing);
            this._buildingOnDeck = null;
        }
    }

    // Every time the player presses a button, render their cursor.
    // This should feel snappier than waiting on Game update() cycles.
    Game._drawWholeMap();
  }

  /**
   * Creates a building at our current location, if possible,
   * and removes the cost in resources/items from the player's inventory.
   * Tile must not have any other buildings, and player must have
   * the resources to pay the cost.
   * @param {class} clazz Conveyor, Box, etc
   */
  constructBuilding(clazz, facing) {
      let cost = clazz.cost;
      if (!cost) {
        console.warn(`😬 ${clazz.name} didn't have a cost, so we're not building it.`);
        return;
      }
      if (clazz.requiresFacing && !facing) {
        console.warn(`😬 ${clazz.name} requires facing and no facing was provided.`);
        return;
      }
      let itemKeys = Object.keys(cost);
      var canPayCost = true;
      // Check to make sure we can pay the WHOLE cost before
      // we start subtracting
      for (let i in itemKeys) {
        let key = itemKeys[i];
        // If we have less than the cost of the item, set the flag to false
        if (this.inventory.count(key) < cost[key]) {
            canPayCost = false;
        }
      }
      // If we can pay the whole cost, go ahead~
      if (canPayCost) {
          for (let i in itemKeys) {
              let key = itemKeys[i];
              this.inventory.remove(key, cost[key]);
          }
          if (facing) {
              var newBuild = new clazz(this._x, this._y, facing);
          } else {
              var newBuild = new clazz(this._x, this._y);
          }
          newBuild.start();
          this.updateInventoryUi();
      } else {
          console.debug(`🤑 Not enough resources to build ${clazz.name}`);
      }
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

  /**
   * Delete old inventory items and replace them with current inventory.
   */
  updateInventoryUi() {
    // remove old children
    while (playerInventoryListElement.firstChild) {
        playerInventoryListElement.removeChild(playerInventoryListElement.firstChild);
    }
    let newListItems = this.inventory.generateListItems();
    // attach new ones
    newListItems.forEach(listItem => playerInventoryListElement.appendChild(listItem));
  }

  represent() {
    return "@";
  }

  getPositionKey() {
    return `${this._x},${this._y}`;
  }
}

export { Player };
