const { Game } = require(".");

const distanceToCheck = 5;

/**
 * Manages power for buildings that require, generate, or conduct it.
 * Generators add capacity into the system, and extractors add load.
 * Pylons connect the grid to anything within their radius.
 * If load ever exceeds capacity or generators run out of fuel, the system stops.
 */
class PowerSystem {
    /**
     * Contains a reference to the parent building so we can shut it down.
     * @param {Building} parent the Building that owns this.
     */
    constructor(parent, powerGenerated, powerConsumed) {
        this.powerGenerated = powerGenerated;
        this.powerConsumed = powerConsumed;
        this.providers = {};
        this.load = {};
        this.parent = parent;
        this.id = this._createUUID();
    }

    /**
     * Sums the power provided by all the generators.
     */
    getTotalCapacity() {
        let totalCap = Object.values(this.providers).reduce(doSum, 0);
        console.debug(`getTotalCapacity(): ${totalCap}`);
        return totalCap;
    }

    setCapacity(id, powerGenerated) {
        this.providers[id] = powerGenerated;
    }
    

    /**
     * Adds our power generated to the capacity of the network.
     */
    generate() {
        this._getNetwork().forEach((node) => {
            node.setCapacity(this.id, this.powerGenerated);
        })
    }

    addLoad() {
        
    }

    _createUUID(){
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (dt + Math.random()*16)%16 | 0;
            dt = Math.floor(dt/16);
            return (c=='x' ? r :(r&0x3|0x8)).toString(16);
        });
        return uuid;
    }

    _getNetwork() {
        var output = [];
        let x = this.parent._x;
        let y = this.parent._y;
        let topLeftX = this._clampX(x - distanceToCheck);
        let topLeftY = this._clampY(y - distanceToCheck);
        let botRightX = this._clampX(x + distanceToCheck);
        let botRightY = this._clampY(y + distanceToCheck);
        // Iterate over all the x values in the bounding box
        for (let xCheck = topLeftX; xCheck <= botRightX; xCheck++) {
            // And all the cells in that column
            for (let yCheck = topLeftY; yCheck <= botRightY; yCheck++) {
                // Get the tile there
                let key = `${xCheck},${yCheck}`;
                var tile = Game.map[key];
                // Check if it has a power system, if so, add it
                if (tile?.actor?.powerSystem instanceof PowerSystem) {
                    output.push(tile.actor.powerSystem);
                }
            }
        }
        console.debug(`getNetwork found ${output.length} nodes.`);
        return output;
    }

    _clampX(x) {
        if (coordinate < 0) {
            return 0;
        }
        if (coordinate > config.map.width) {
            return config.map.width;
        }
        return x;
    }

    _clampY(y) {
        if (coordinate < 0) {
            return 0;
        }
        if (coordinate > config.map.height) {
            return config.map.height;
        }
        return y;
    }
}