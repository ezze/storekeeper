import _ from 'underscore';
import Backbone from 'backbone';

import Direction from './level/direction';
import LevelSet from './level/level-set';
import Renderer from './level/render/renderer';

class Game {
    constructor(options) {
        if (!(options.renderer instanceof Renderer)) {
            throw new Error('Renderer is not provided or invalid.');
        }

        _.bindAll(this, 'animationFrame');

        this.renderer = options.renderer;
        this.levelSet = options.levelSet instanceof LevelSet ? options.levelSet : new LevelSet();

        this._animationFrameId = requestAnimationFrame(this.animationFrame);
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

    animationFrame() {
        let level = this.levelSet.level;
        if (level !== null) {
            level.move();
        }
        this.render();
        this._animationFrameId = requestAnimationFrame(this.animationFrame);
    }

    goToPreviousLevel() {
        this.levelSet.goToPrevious();
    }

    goToNextLevel() {
        this.levelSet.goToNext();
    }

    restartLevel() {
        this.levelSet.restart();
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
        if (this.levelSet) {
            this.stopListening(this.levelSet);
        }

        this._levelSet = levelSet;

        this.listenTo(levelSet, 'level:number', levelNumber => {
            this.trigger('level:number', levelNumber);
        });

        this.listenTo(levelSet, 'level:move:start', stats => {
            this.trigger('level:move:start', stats);
        });

        this.listenTo(levelSet, 'level:move:end', stats => {
            this.trigger('level:move:end', stats);
        });

        this.listenTo(levelSet, 'level:completed', () => {
            this.trigger('level:completed');
            this.levelSet.level.reset();
            this.goToNextLevel();
        });
    }

    get level() {
        return this.levelSet.level;
    }

    get direction() {
        return this.level === null ? Direction.NONE : this.level.direction;
    }

    set direction(direction) {
        if (this.level !== null) {
            this.level.direction = direction;
        }
    }

    destroy() {
        cancelAnimationFrame(this._animationFrameId);

        if (this.levelSet) {
            this.stopListeining(this.levelSet);
        }

        this._renderer.destroy();
    }
}

_.extend(Game.prototype, Backbone.Events);

export default Game;