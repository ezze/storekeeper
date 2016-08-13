import _ from 'underscore';
import $ from 'jquery';

import Direction from './level/direction';
import GameDirection from './game-direction';

import LevelSet from './level/level-set';
import Renderer from './level/render/renderer';

class Game {
    constructor(options) {
        if (!(options.renderer instanceof Renderer)) {
            throw new Error('Renderer is not provided or invalid.');
        }

        this.renderer = options.renderer;
        this.levelSet = options.levelSet instanceof LevelSet ? options.levelSet : new LevelSet();

        this.bindMethods();
        this.enableControls();

        this._animationFrameId = requestAnimationFrame(this.animationFrame);
    }

    bindMethods() {
        _.bindAll(
            this,
            'onKeyDown',
            'onKeyUp',
            'onTouchStart',
            'onTouchEnd',
            'animationFrame'
        );
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

        let level = this.levelSet.level;
        if (level !== null) {
            level.direction = Direction.NONE;
        }
    }

    disableControls() {
        let level = this.levelSet.level;
        if (level !== null) {
            level.direction = Direction.NONE;
        }

        $(window).off('keydown', this.onKeyDown);
        $(window).off('keyup', this.onKeyUp);
        $(window).off('touchstart', this.onTouchStart);
        $(window).off('touchend', this.onTouchEnd);
    }

    animationFrame() {
        let level = this.levelSet.level;
        if (level !== null) {
            level.move();
        }
        this.render();
        this._animationFrameId = requestAnimationFrame(this.animationFrame);
    }

    onKeyDown(event) {
        /*
        if (event.ctrlKey && event.which === 79) {
            // Ctrl + O
            event.preventDefault();     // preventing a browser from showing open file dialog
            this.browseLevelSet();
            return;
        }
        */

        /*
        if (event.ctrlKey && event.altKey && event.which === 82) {
            // Ctrl + Alt + R
            this.restartLevel();
            return;
        }
        */

        if (event.altKey && event.which === 90) {       // Alt + Z
            this.levelSet.goToPrevious();
            return;
        }

        if (event.altKey && event.which === 88) {       // Alt + X
            this.levelSet.goToNext();
            return;
        }

        let level = this.levelSet.level,
            direction = GameDirection.byKeyCode(event.which);

        if (level === null || direction === Direction.NONE) {
            return;
        }

        level.direction = direction;
    }

    onKeyUp(event) {
        let level = this.levelSet.level,
            direction = GameDirection.byKeyCode(event.which);

        if (level !== null && direction === level.direction) {
            level.direction = Direction.NONE;
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

        this._direction = GameDirection.byTouchPoint(canvas, touchCanvasX, touchCanvasY);
        */
    }

    onTouchEnd(event) {
        //this._direction = Direction.NONE;
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

    destroy() {
        cancelAnimationFrame(this._animationFrameId);
        this._renderer.destroy();
    }
}

export default Game;