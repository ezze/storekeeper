import _ from 'underscore';
import Backbone from 'backbone';

import Direction from './level/Direction';
import LevelSet from './level/LevelSet';
import Renderer from './level/render/Renderer';
import LoaderFactory from './level/loader/LoaderFactory';

class Game {
    constructor(options) {
        if (!(options.renderer instanceof Renderer)) {
            throw new Error('Renderer is not provided or invalid.');
        }

        _.bindAll(this, 'animationFrame');

        this.renderer = options.renderer;

        if (options.levelSet instanceof LevelSet) {
            this.levelSet = options.levelSet;
        }
        else if (_.isString(options.levelSet) || options.levelSet instanceof File) {
            this.loadLevelSet(options.levelSet);
        }
        else {
            this._levelSet = null;
        }

        this._animationFrameId = requestAnimationFrame(this.animationFrame);
    }

    addLevelSetListeners(levelSet) {
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

    removeLevelSetListeners(levelSet) {
        this.stopListening(levelSet);
    }

    render(time) {
        let level = this.levelSet.level;
        if (level === null) {
            return;
        }

        if (this._renderer.level !== level) {
            this._renderer.level = level;
        }

        this._renderer.render(time);
    }

    animationFrame(time) {
        if (!this.levelSet) {
            this._animationFrameId = requestAnimationFrame(this.animationFrame);
            return;
        }

        let level = this.levelSet.level;
        if (level) {
            level.move();
        }

        this.render(time);
        this._animationFrameId = requestAnimationFrame(this.animationFrame);
    }

    loadLevelSet(source) {
        let name = source instanceof File ? source.name : source;

        let loader = LoaderFactory.getLoaderByFileName(name);
        if (loader === null) {
            return;
        }

        let promise = loader.load(source);
        promise.then(response => {
            let levelSet = loader.parse(response.data);
            if (levelSet instanceof LevelSet) {
                this.levelSet = levelSet;
            }
            this.trigger('levelSet:load', levelSet, response.source);
        }, () => {
            alert('Unable to load level set');
        });
    }

    goToPreviousLevel() {
        if (this.levelSet) {
            this.levelSet.goToPrevious();
        }
    }

    goToNextLevel() {
        if (this.levelSet) {
            this.levelSet.goToNext();
        }
    }

    restartLevel() {
        if (this.levelSet) {
            this.levelSet.restart();
        }
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
            this.removeLevelSetListeners(this.levelSet);
        }

        this._levelSet = levelSet;
        this.addLevelSetListeners(levelSet);
    }

    get level() {
        return this.levelSet ? this.levelSet.level : null;
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
            this.removeLevelSetListeners(this.levelSet);
        }

        this._renderer.destroy();
    }
}

_.extend(Game.prototype, Backbone.Events);

export default Game;
