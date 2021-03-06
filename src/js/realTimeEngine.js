class RealTimeEngine {
	_loop = [];
    _lock = 0;
    _delay = 100;
    _interval = null;

	constructor(delayInMillis) {
        this._lock = 1;
        this._loop = [];
        this._interval = null;
        if (delayInMillis && typeof(delayInMillis) == "number") {
            this._delay = delayInMillis;
        }
        this.unlock = this.unlock.bind(this);
        this.doTick = this.doTick.bind(this);
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
        clearInterval(this._interval);
		return this;
    }
    
    /**
     * Run through all the items in the _loop once.
     */
    doTick() {
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
	 * Resume execution (paused by a previous lock)
	 */
	unlock() {
        console.debug("Running the engine!");
		if (!this._lock) { throw new Error("Cannot unlock unlocked engine"); }
		this._lock--;

        this._interval = window.setInterval(this.doTick, this._delay);

		return this;
	}
}

export { RealTimeEngine };