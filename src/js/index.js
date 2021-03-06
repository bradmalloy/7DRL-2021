import { Extractor } from "./extractor.js";
import { Loader } from "./loader.js";
import { RealTimeEngine } from "./realTimeEngine.js";
import { Tile } from "./tile.js";

var tileSet = document.createElement("img");
tileSet.src = "urizen-700.png";

var options = {
    layout: "tile",
    bg: "transparent",
    tileWidth: 24,
    tileHeight: 24,
    tileSet: tileSet,
    tileMap: {
        "?": [1276, 1277],  // question mark
        ".": [288, 678],    // ground
        "e": [1276, 470],   // extractor
        "Ln": [626, 964],   // Loader, north input
        "Ls": [626, 938],   // Loader, south input
        "Lw": [600, 938],   // Loader, west input
        "Le": [574, 938],   // Loader, east input
        "cv": [678, 886],   // Conveyer, vertical
        "ch": [652, 886]    // Conveyer, horizontal
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
        this.engine = new RealTimeEngine(100);
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

        // just to test, let's put an extractor in there
        let extractor = new Extractor(5,5);
        let loadN = new Loader(5, 6, "north");
        let loadE = new Loader(4,5,"east");
        let loadS = new Loader(5, 4, "south");
        let loadW = new Loader(6,5,"west");

        extractor.start();

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
            let charToDisplay = this.map[key].display();
            this.display.draw(x, y, charToDisplay);
        }
    }
}

window.loadGame = function() {
    Game.init();
}

export { Game };