import { Extractor } from "./extractor.js";
import { Loader } from "./loader.js";
import { Conveyor } from "./conveyor.js";
import { Box } from "./storage.js";
import { RealTimeEngine } from "./realTimeEngine.js";
import { Tile } from "./tile.js";
import { Player } from "./player.js";
import { config } from "./config.js";

var tileSet = document.createElement("img");
tileSet.src = "urizen-700.png";

var options = {
    layout: "tile",
    bg: "transparent",
    tileWidth: 24,
    tileHeight: 24,
    tileSet: tileSet,
    tileMap: {
        "?": [1276, 1277],      // question mark
        "empty": [418, 54],         // empty ground
        "iron": [366, 54],                // iron ground
        "coal": [522, 54],                 // coal ground
        "copper": [132, 184],   // copper ground
        "g": [652, 990],        // generator
        "e": [1276, 470],       // extractor
        "Ln": [626, 964],       // Loader, north input
        "Ls": [626, 938],       // Loader, south input
        "Lw": [600, 938],       // Loader, west input
        "Le": [574, 938],       // Loader, east input
        "cv": [652, 886],       // Conveyor, vertical
        "ch": [678, 886],       // Conveyor, horizontal
        "b": [964, 1068],        // Box, small
        "@": [80, 1224]          // Player cursor
    },
    width: config.map.width,
    height: config.map.height
}

var gameWrapper = document.getElementById("gameCanvas");

// innerText ex: [1,1]
const currentTilePositionElement = document.getElementById("currentTilePosition");
// innerText ex: "Empty", "Extractor", etc
const currentTileBuildingElement = document.getElementById("currentTileBuilding");
// innerText ex: "None", "Iron: 200"
const currentTileResourcesElement = document.getElementById("currentTileResources");

const doSum = (accumulator, currentValue) => accumulator + currentValue;

class Clock {
    constructor() {
        this.frame = 0;
    }

    act() {
        this.frame += 1;
    }
} 

const Game = {
    display: null,
    engine: null,
    player: null,
    map: {},
    init: function() {
        this.engine = new RealTimeEngine(config.game.frameDelay);
        this.map = {};
        this.display = new ROT.Display(options);
        gameWrapper.appendChild(this.display.getContainer());

        // Draw the map & fill with resources
        this._generateMap();

        //this._fillMapWithTestData();

        // Frame counter
        const clock = new Clock();
        this.engine.add(clock);

        // Create a player
        this.player = new Player(1, 1);

        // Start the game!
        this.engine.start();

        // Do an inital draw so we don't flash the player
        this._drawWholeMap();

        console.info("Game init() finished!")
    },

    _drawWholeMap: function() {
        this.display.clear();
        for (let key in this.map) {
            var parts = key.split(",");
            var x = parseInt(parts[0]);
            var y = parseInt(parts[1]);
            let toDisplay = this.map[key].display();
            this.display.draw(x, y, toDisplay);
        }
        this.drawPlayer();
    },

    drawPlayer: function() {
        let playerPos = this.map[this.player.getPositionKey()];
        let drawArray = [playerPos.display(), this.player.represent()].flat();
        this.display.draw(this.player._x, this.player._y, drawArray);
    },

    /**
     * Update the HTML UI with the stats for the tile under the player.
     */
    updateCurrentTileUi() {
        let theTile = this.map[this.player.getPositionKey()];
        currentTilePositionElement.innerText = `[${theTile.getPositionKey()}]`;
        if (theTile.hasBuilding()) {
            let buildingText = theTile.actor.getName() + " " + theTile.actor?.inventory?.getSummary();
            currentTileBuildingElement.innerText = buildingText;
        } else {
            currentTileBuildingElement.innerText = "None";
        }
        if (theTile.tileType != "empty") {
            currentTileResourcesElement.innerText = `${theTile.getType()}: ${theTile.countResources()}`;
        } else {
            currentTileResourcesElement.innerText = "No Resources";
        }
    },

    /**
     * Draw a map, then fill it with resources.
     * Iron, coal, and copper.
     */
    _generateMap() {
        // Generate all the empty tiles
        var width = this.display.getOptions().width;
        var height = this.display.getOptions().height;
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let tile = new Tile("empty", x, y);
                let key = tile.getPositionKey();
                this.map[key] = tile;
            }
        }

        // Next, use celluar automata to lay down the first layer of resources
        // but make sure they meet the minimum bar
        var sumIronTiles = 0;
        while (sumIronTiles <= config.map.resources.iron.minTiles) {
            var ironMap = new ROT.Map.Cellular(width, height, { connected: true});
            // % chance to be iron
            ironMap.randomize(config.map.resources.iron.baseChance);
            // iterations smooth out and connect live tiles
            for (let i = 0; i < config.map.resources.iron.generations; i++) {
                ironMap.create();
            }
            // Check to ensure that we have a minimum number of iron tiles
            sumIronTiles = ironMap._map.flat().reduce(doSum, 0);
        }

        // Go through the map and change the tiles we touch to type "iron"
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (ironMap._map[x][y] == 1) {
                    let key = `${x},${y}`
                    let tile = this.map[key];
                    let resourceAmount = this._calculateResourceAmount(x, y, ironMap._map, "iron");
                    tile.addResources("iron", resourceAmount);
                }
            }
        }

        // Same for coal
        var sumCoalTiles = 0;
        while (sumCoalTiles <= config.map.resources.coal.minTiles) {
            var coalMap = new ROT.Map.Cellular(width, height, { connected: true });
            coalMap.randomize(config.map.resources.coal.baseChance);
            for (let i = 0; i< config.map.resources.coal.generations; i++) {
                coalMap.create();
            }
            sumCoalTiles = coalMap._map.flat().reduce(doSum, 0);
        }

        // Change tiles to "coal", but only if they're empty!
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (coalMap._map[x][y] == 1) {
                    let key = `${x},${y}`
                    let tile = this.map[key];
                    if (tile.tileType == "empty") {
                        let resourceAmount = this._calculateResourceAmount(x, y, coalMap._map, "coal");
                        tile.addResources("coal", resourceAmount);
                    }
                }
            }
        }

        // Same for copper
        var sumCopperTiles = 0;
        while (sumCopperTiles <= config.map.resources.copper.minTiles) {
            var copperMap = new ROT.Map.Cellular(width, height, { connected: true });
            copperMap.randomize(config.map.resources.copper.baseChance);
            for (let i = 0; i< config.map.resources.copper.generations; i++) {
                copperMap.create();
            }
            sumCopperTiles = copperMap._map.flat().reduce(doSum, 0);
        }

        // Change tiles to "copper", but only if they're empty!
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (copperMap._map[x][y] == 1) {
                    let key = `${x},${y}`
                    let tile = this.map[key];
                    if (tile.tileType == "empty") {
                        let resourceAmount = this._calculateResourceAmount(x, y, copperMap._map, "copper");
                        tile.addResources("copper", resourceAmount);
                    }
                }
            }
        }
    },

    /**
     * Calculates the amount of resources based on the number of
     * similarly resourced neighbors the tile has.
     * The map should have a 2d array of 0 and 1, where is a resource-bearing tile
     * and 0 isn't.
     * @param {number} x x coordinate
     * @param {number} y y coordinate
     * @param {aray} map a 2d array with values of 0 or 1
     * @param {string} tileType for looking up config values
     */
    _calculateResourceAmount(x, y, map, tileType) {
        var toCalc = map[x][y];
        if (toCalc == 0) {
            // in case we somehow pass an empty tile in here
            return 0;
        }
        // Values from config
        var baseValue = config.map.resources[tileType].baseAmountPerTile;
        var multiplier = config.map.resources[tileType].amountPerAdditionalTile;
        var adjascentTiles = 0;
        // Get all the tiles
        try { var north = map[x][y-1]; } catch (error) {}
        try { var northEast = map[x+1][y-1]; } catch (error) {}
        try { var northWest = map[x-1][y-1]; } catch (error) {}
        try { var east = map[x+1][y]; } catch (error) {}
        try { var west = map[x-1][y]; } catch (error) {}
        try { var southEast = map[x+1][y+1]; } catch (error) {}
        try { var south = map[x][y+1]; } catch (error) {}
        try { var southWest = map[x-1][y+1]; } catch (error) {}

        if (north) { adjascentTiles += 1};
        if (northEast) { adjascentTiles += 1};
        if (east) { adjascentTiles += 1};
        if (southEast) { adjascentTiles += 1};
        if (south) { adjascentTiles += 1};
        if (southWest) { adjascentTiles += 1};
        if (west) { adjascentTiles += 1};
        if (northWest) { adjascentTiles += 1};

        return baseValue + (multiplier * adjascentTiles);
    },

    _fillMapWithTestData() {
        // just to test, let's put a test line in there
        // extractor pulls up coal
        // loader moves it from 5,5 to 7,5
        // conveyor pushes it's own inventory east
        let extractor = new Extractor(5, 5, 10);
        let loadW = new Loader(6,5,"west"); // input direction
        let conveyor1 = new Conveyor(7, 5, "east"); // output direction
        let conveyor2 = new Conveyor(8, 5, "east");
        let conveyor3 = new Conveyor(9, 5, "east");
        let conveyor4 = new Conveyor(10, 5, "east");
        let conveyor5 = new Conveyor(11, 5, "east");
        let conveyor6 = new Conveyor(12, 5, "east");
        let conveyor7 = new Conveyor(13, 5, "east");
        let conveyor8 = new Conveyor(14, 5, "east");
        let boxLoader = new Loader(15, 5, "west");
        let box1 = new Box(16, 5);
        let boxUnloader = new Loader(16, 6, "north");
        let vConvey1 = new Conveyor(16, 7, "south");
        let vConvey2 = new Conveyor(16, 8, "south");
        let vConvey3 = new Conveyor(16, 9, "south");

        extractor.start();
        loadW.start();
        boxLoader.start();
        boxUnloader.start();
    }
}

window.loadGame = function() {
    Game.init();
}

window.depositItemFromUi = function(itemType) {
    var amount = document.getElementById(`player-${itemType}`).value;
    if (!amount) {
        return;
    }
    Game.player.depositItem(itemType, amount);
}

export { Game, doSum };