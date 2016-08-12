import _ from 'underscore';
import $ from 'jquery';

import Direction from './level/direction';
import GameDirection from './game-direction';

import LevelSet from './level/level-set';
import Ticker from './level/render/ticker';
import Renderer from './level/render/renderer';

class Game {
    constructor(options) {
        if (!(options.renderer instanceof Renderer)) {
            throw new Error('Renderer is not provided or invalid.');
        }

        this.renderer = options.renderer;
        this.levelSet = options.levelSet instanceof LevelSet ? options.levelSet : new LevelSet();

        this.initializeTicker();
    }

    initializeTicker() {
        _.bindAll(this, ['onTick']);

        let ticker = this._ticker = new Ticker({
            fps: 30
        });
        ticker.on('tick', this.onTick);
        ticker.start();
    }

    destroyTicker() {
        let ticker = this._ticker;
        ticker.stop();
        ticker.off('tick', this.onTick);
    }

    render() {
        let level = this.levelSet.level;
        if (level === null) {
            return;
        }

        if (this._renderer.level !== level) {
            this._renderer.level = level;
        }

        this._renderer.render();
    }

    enableControls() {
        $(window).on('keydown', this.onKeyDown);
        $(window).on('keyup', this.onKeyUp);
        $(window).on('touchstart', this.onTouchStart);
        $(window).on('touchend', this.onTouchEnd);
        //this._moveDirection = Direction.NONE;
    }

    disableControls() {
        //this._moveDirection = Direction.NONE;
        $(window).off('keydown', this.onKeyDown);
        $(window).off('keyup', this.onKeyUp);
        $(window).off('touchstart', this.onTouchStart);
        $(window).off('touchend', this.onTouchEnd);
    }

    onTick() {
        this.render();
    }

    onKeyDown(event) {
        /*
        if (event.ctrlKey && event.which === 79) {
            // Ctrl + O
            event.preventDefault();     // preventing a browser from showing open file dialog
            this.browseLevelSet();
            return;
        }

        if (event.ctrlKey && event.altKey && event.which === 82) {
            // Ctrl + Alt + R
            this.restartLevel();
            return;
        }

        if (event.altKey && event.which === 90) {
            // Alt + Z
            this.previousLevel();
            return;
        }

        if (event.altKey && event.which === 88) {
            // Alt + X
            this.nextLevel();
            return;
        }
        */

        var direction = GameDirection.byKeyCode(event.which);
        if (direction === Direction.NONE) {
            return;
        }

        event.preventDefault();
        //this._moveDirection = direction;
    }

    onKeyUp(event) {
        var direction = GameDirection.byKeyCode(event.which);
        if (direction === this._moveDirection) {
            //this._moveDirection = Direction.NONE;
        }
    }

    onTouchStart(event) {
        /*
        if (!(event.target instanceof HTMLCanvasElement)) {
            return;
        }

        var canvas = event.target;
        var $canvas = $(canvas);

        var originalEvent = event.originalEvent;
        var touch = originalEvent.touches.item(0);

        var touchCanvasX = touch.clientX - $canvas.offset().left;
        var touchCanvasY = touch.clientY - $canvas.offset().top;

        this._moveDirection = GameDirection.byTouchPoint(canvas, touchCanvasX, touchCanvasY);
        */
    }

    onTouchEnd(event) {
        //this._moveDirection = Direction.NONE;
    }

    get renderer() {
        return this._renderer;
    }

    set renderer(renderer) {
        this._renderer = renderer;
    }

    get levelSet() {
        return this._levelSet;
    }

    set levelSet(levelSet) {
        this._levelSet = levelSet;
    }
}

export default Game;