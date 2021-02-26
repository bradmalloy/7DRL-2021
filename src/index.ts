import ROT = require('rot-js');
import { DisplayOptions } from 'rot-js/lib/display/types';

console.info(ROT.RNG.getPercentage());
console.info("ROT is loaded correctly!");

var tileSet = document.createElement("img");
tileSet.src = "mainlevbuild.png";

var options: Partial<DisplayOptions> = {
    layout: "tile",
    bg: "transparent",
    tileWidth: 32,
    tileHeight: 32,
    tileSet: tileSet,
    tileMap: {
        "@": [0, 0],
        "#": [0, 64],
        "a": [64, 0],
        "!": [64, 64],
        ".": [192, 672]
    },
    width: 3,
    height: 3
}

var gameWrapper = document.getElementById("gameCanvas");

var display = new ROT.Display(options);
gameWrapper.appendChild(display.getContainer());

tileSet.onload = function() {
    for (let x = 0; x < display.getOptions().width; x++) {
        for (let y = 0; y < display.getOptions().height; y++) {
            display.draw(x, y, ".", null, null);
            console.debug("Drawing '.'");
        }
    }
}