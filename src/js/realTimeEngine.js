import { Game } from "./index.js";

class RealTimeEngine {
	_loop = [];
    _lock = 0;
    _gameTickDelay = 100; // game updates/second
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
        this.doGameTick = this.update.bind(this);
        this.doDisplayTick = this.render.bind(this);
        this.add = this.add.bind(this);
        this.remove = this.remove.bind(this);
        this.start = this.start.bind(this);
        this.lock = this.lock.bind(this);
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
     */
    update() {
        for (let i = 0; i < this._loop.length; i++) {
            let thisItem = this._loop[i];
            if (thisItem && thisItem.act != null) {
                thisItem.act();
            } else {
                console.warn("Item didn't have an act() method.");
            }
        }  
    }

    /**
     * Draw everything on the amp.
     */
    render() {
        Game._drawWholeMap();
    }

	/**
	 * Resume execution (paused by a previous lock)
	 */
	unlock() {
        console.debug("Running the engine!");
		if (!this._lock) { throw new Error("Cannot unlock unlocked engine"); }
		this._lock--;

        this._displayTimer = window.setInterval(this.render, this._refreshDelay);
        this._gameTickTimer = window.setInterval(this.update, this._gameTickDelay);

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