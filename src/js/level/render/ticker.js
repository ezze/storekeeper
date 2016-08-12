import _ from 'underscore';
import Backbone from 'backbone';

class Ticker {
    constructor(options) {
        this._timeoutId = null;

        this.fps = options.fps || 25;
    }

    start() {
        this.tick();
    }

    stop() {
        if (this._timeoutId !== null) {
            clearTimeout(this._timeoutId);
            this._timeoutId = null;
        }
    }

    tick() {
        let startTime = performance.now();

        if (this._timeoutId !== null) {
            clearTimeout(this._timeoutId);
        }
        this.trigger('tick');

        let executionTime = performance.now() - startTime,
            timeout = this.timeout - executionTime;

        if (timeout < 0) {
            timeout = 0;
        }

        this._timeoutId = setTimeout(() => {
            this.tick();
        }, timeout);
    }

    get fps() {
        return this._fps;
    }

    set fps(fps) {
        this._fps = fps;
    }

    get timeout() {
        return 1000 / this._fps;
    }
}

_.extend(Ticker.prototype, Backbone.Events);

export default Ticker;