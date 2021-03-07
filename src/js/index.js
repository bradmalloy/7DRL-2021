import { Extractor } from "./extractor.js";
import { Loader } from "./loader.js";
import { Conveyor } from "./conveyor.js";
import { Box } from "./storage.js";
import { RealTimeEngine } from "./realTimeEngine.js";
import { Tile } from "./tile.js";

const frameDelay = 1000; // in millisecond delay
const defaultRefreshRate = 10; // in FPS

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
        "coal": [522, 54],   // temp question mark
        ".": [418, 54],         // ground
        "e": [1276, 470],       // extractor
        "Ln": [626, 964],       // Loader, north input
        "Ls": [626, 938],       // Loader, south input
        "Lw": [600, 938],       // Loader, west input
        "Le": [574, 938],       // Loader, east input
        "cv": [652, 886],       // Conveyor, vertical
        "ch": [678, 886],       // Conveyor, horizontal
        "b": [964, 1068]        // Box, small
    },
    width: 20,
    height: 20
}

var gameWrapper = document.getElementById("gameCanvas");
var frameTimer = document.getElementById("frameTimer");
var frame = 0;

class Clock {
    act() {
        frameTimer.innerText = "" + frame;
        frame += 1;
    }
} 

const Game = {
    display: null,
    engine: null,
    map: {},
    init: function() {
        this.engine = new RealTimeEngine(frameDelay, defaultRefreshRate);
        this.map = {};
        this.display = new ROT.Display(options);
        gameWrapper.appendChild(this.display.getContainer());

        for (let x = 0; x < this.display.getOptions().width; x++) {
            for (let y = 0; y < this.display.getOptions().height; y++) {
                let tile = new Tile("empty", x, y);
                let key = tile.getPositionKey();
                this.map[key] = tile;
            }
        }

        // just to test, let's put a test line in there
        // extractor pulls up coal
        // loader moves it from 5,5 to 7,5
        // conveyor pushes it's own inventory east
        let extractor = new Extractor(5,5);
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

        extractor.start();
        loadW.start();
        boxLoader.start();

        const clock = new Clock();
        
        this.engine.add(clock);
        this.engine.start();

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
    }
}

window.loadGame = function() {
    Game.init();
}

export { Game };