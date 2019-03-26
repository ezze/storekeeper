import { EventMixin } from 'dissemination';

import { DIRECTION_NONE } from '../constants';

import LevelPack from './level/LevelPack';
import Renderer from './renderer/Renderer';
import LoaderFactory from './level/loader/LoaderFactory';
import { getDirectionByKeyCode } from './direction';

class Game {
  _renderer;
  _levelPack;

  constructor(options = {}) {
    const { renderer, levelPack } = options;

    if (!(renderer instanceof Renderer)) {
      throw new Error('Renderer is not provided or invalid.');
    }
    this._renderer = renderer;

    if (levelPack instanceof LevelPack) {
      this._levelPack = levelPack;
    }
    else if (typeof levelPack === 'string' || levelPack instanceof File) {
      this.loadLevelPack(levelPack).catch(e => console.error(e));
    }
    else {
      this._levelPack = null;
    }

    this.animationFrame = this.animationFrame.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animationFrame);

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.enableControls();
  }

  destroy() {
    this.disableControls();

    cancelAnimationFrame(this.animationFrameId);

    if (this._levelPack) {
      this.removeLevelPackListeners(this._levelPack);
    }

    this._renderer.destroy();
  }

  enableControls() {
    this.direction = DIRECTION_NONE;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('touchstart', this.onTouchStart);
    window.addEventListener('touchend', this.onTouchEnd);
  }

  disableControls() {
    this.direction = DIRECTION_NONE;
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchend', this.onTouchEnd);
  }

  onKeyDown(event) {
    if (!this._levelPack || !this._levelPack.level) {
      return;
    }

    if (event.ctrlKey && event.which === 79) { // Ctrl + O
      event.preventDefault(); // preventing a browser from showing open file dialog
      // this.browseLevelSet();
      return;
    }

    if (event.altKey && event.which === 90) { // Alt + Z
      this.executeCommand('previousLevel');
      return;
    }

    if (event.altKey && event.which === 88) { // Alt + X
      this.executeCommand('nextLevel');
      return;
    }

    if (event.ctrlKey && event.altKey && event.which === 82) { // Ctrl + Alt + R
      this.executeCommand('restartLevel');
      return;
    }

    const direction = getDirectionByKeyCode(event.which);
    if (direction === DIRECTION_NONE) {
      return;
    }

    this._levelPack.level.direction = direction;
  }

  onKeyUp(event) {
    if (!this._levelPack || !this._levelPack.level) {
      return;
    }
    const direction = getDirectionByKeyCode(event.which);
    if (direction === this._levelPack.level._direction) {
      this._levelPack.level.direction = DIRECTION_NONE;
    }
  }

  onTouchStart(event) {
  }

  onTouchEnd(event) {

  }

  async loadLevelPack(source) {
    const name = source instanceof File ? source.name : source;

    const loader = LoaderFactory.getLoaderByFileName(name);
    if (loader === null) {
      return;
    }

    try {
      const response = await loader.load(source);
      const levelPack = this._levelPack = loader.parse(response.data);
      this.fire('level:pack:load', levelPack, response.source);
    }
    catch (e) {
      console.error(e);
      alert('Unable to load level pack.');
    }
  }

  addLevelPackListeners(levelPack) {
    /*
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
      this.levelPack.level.reset();
      this.goToNextLevel();
    });
     */
  }

  removeLevelPackListeners(levelPack) {
    // this.stopListening(levelPack);
  }

  render(time) {
    const { level } = this._levelPack;
    if (level === null) {
      return;
    }
    if (this._renderer.level !== level) {
      this._renderer.level = level;
    }
    this._renderer.render(time);
  }

  animationFrame(time) {
    if (!this._levelPack) {
      this.animationFrameId = requestAnimationFrame(this.animationFrame);
      return;
    }

    const level = this._levelPack.level;
    if (level) {
      level.move();
    }

    this.render(time);
    this.animationFrameId = requestAnimationFrame(this.animationFrame);
  }

  goToPreviousLevel() {
    if (this._levelPack) {
      this._levelPack.goToPrevious();
    }
  }

  goToNextLevel() {
    if (this._levelPack) {
      this._levelPack.goToNext();
    }
  }

  restartLevel() {
    if (this._levelPack) {
      this._levelPack.restart();
    }
  }

  setLevelPack(levelSet) {
    if (this._levelPack) {
      this.removeLevelPackListeners(this._levelPack);
    }

    this._levelPack = levelSet;
    this.addLevelPackListeners(levelSet);
  }
}

Object.assign(Game.prototype, EventMixin);

export default Game;
