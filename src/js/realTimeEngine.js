import { Game } from "./index.js";

class RealTimeEngine {
	_loop = [];
    _lock = 0;
    _gameTickDelay = 100; // delay in ms between updates
    _gameTickTimer = null;
    _refreshDelay = 100; // 10 FPS
    _refreshTimer = null;

    /**
     * Create a new RealTimeEngine with a given simulation rate and
     * framerate.
     * @param {number} gameTickDelay delay between game ticks, in milliseconds
     * @param {number} refreshRate number of times to draw display, per second
     */
	constructor(gameTickDelay, refreshRate) {
        this._lock = 1;
        this._loop = [];

        this._gameTickTimer = null; // setInterval on start()
        if (gameTickDelay) {
            this._gameTickDelay = gameTickDelay;
        }

        this._displayTimer = null; // setInterval on start()
        if (refreshRate) {
            this._refreshDelay = calculateDelay(refreshRate);
        }

        this.unlock = this.unlock.bind(this);
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.add = this.add.bind(this);
        this.remove = this.remove.bind(this);
        this.start = this.start.bind(this);
        this.lock = this.lock.bind(this);
        this.updateAndRender = this.updateAndRender.bind(this);
        this.getSortedLoop = this.getSortedLoop.bind(this);
    }
    
    add(item) {
        this._loop.push(item);
    }

    remove(item) {
        let index = this._loop.indexOf(item);
        if (index != -1) {
            this._loop.splice(index, 1);
        }
    }

	/**
	 * Start the main loop. When this call returns, the loop is locked.
	 */
	start() { return this.unlock(); }

	/**
	 * Interrupt the engine by an asynchronous action
	 */
	lock() {
        console.debug("Locking engine.");
        this._lock++;
        clearInterval(this._gameTickTimer);
        clearInterval(this._displayTimer);
		return this;
    }
    
    /**
     * Run through all the items in the _loop once.
     * We need to call each item according to an order of operations:
     * 1. Extractors [prio 1]
     * 2. Resource consumers (Forge, Assemblers, etc) [prio 2]
     * 3. Loaders [prio 3]
     * 4. Conveyor belts, *in reverse order* [prio 100-999]
     * 
     * This means each actor needs to have a priority value, and we need to 
     * execute the loop in that order. It's okay for buildings to share values,
     * it just means that within that priority, order doesn't matter. For example,
     * if we have 5 extractors, it doesn't matter which one goes first.
     * 
     * For conveyor belts (a group within which order matters), we'll use values 100 to
     * 999. The last segment of a given conveyor belt will have value 100, and each 
     * segment after that until the first will have increasing numbers. As long as different
     * belts aren't connected, it's also ok if they share priority values.
     */
    update() {
        var prioritySortedLoop = this.getSortedLoop();
        for (let i = 0; i < prioritySortedLoop.length; i++) {
            let thisItem = prioritySortedLoop[i];
            if (thisItem && thisItem.act != null) {
                thisItem.act();
            } else {
                console.warn("Item didn't have an act() method.");
            }
        }  
    }

    /**
     * Takes this._loop and returns a copy, sorted by each actor's this._priority
     * value.
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
     */
    getSortedLoop() {
        return this._loop.sort((a, b) => a._priority - b._priority);
    }

    /**
     * Draw everything on the amp.
     */
    render() {
        Game._drawWholeMap();
    }

    updateAndRender() {
        this.update();
        this.render();
    }

	/**
	 * Resume execution (paused by a previous lock)
	 */
	unlock() {
        console.debug("Running the engine!");
		if (!this._lock) { throw new Error("Cannot unlock unlocked engine"); }
        this._lock--;
        
        this._mainInterval = window.setInterval(this.updateAndRender, this._gameTickDelay);

        //this._displayTimer = window.setInterval(this.render, this._refreshDelay);
        //this._gameTickTimer = window.setInterval(this.update, this._gameTickDelay);

		return this;
	}
}

/**
 * Calculates how long, in millliseconds, to wait in order
 * to accomplish the desired number of ticks/second.
 * ex: 1 FPS = 1000 ms, 10 FPS = 100 ms, 30 FPS = 33.333
 * @param {number} refreshRate desired FPS
 */
function calculateDelay(refreshRate) {
    return Math.floor(1000 / refreshRate);
}

export { RealTimeEngine };