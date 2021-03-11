import { Building } from "./building.js";

/**
 * Conveys power between buildings and other pylons.
 */
class Pylon extends Building {
    static cost = { "iron": 25, "copper": 25 }
    static requiresFacing = false;
    
    constructor(x, y) {
        super(x, y);
        
    }
}