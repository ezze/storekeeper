import { DIRECTION_NONE } from '../constants/direction';
import { EVENT_LEVEL_COMPLETED } from '../constants/event';

import LevelPack from './level/LevelPack';
import Renderer from './renderer/Renderer';
import { getLoaderByFileName } from './level/loader/factory';
import { getDirectionByKeyCode } from './direction';

class Game {
  _eventBus;
  _renderer;
  _levelPack;

  _animationFrameId;
  _fps = 0;

  constructor(options = {}) {
    const { eventBus, renderer, levelPack } = options;

    if (!eventBus) {
      throw new TypeError('Event bus is not specified.');
    }
    this._eventBus = eventBus;

    if (!(renderer instanceof Renderer)) {
      throw new Error('Renderer is not specified or invalid.');
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
    this._animationFrameId = requestAnimationFrame(this.animationFrame);

    this.onLevelCompleted = this.onLevelCompleted.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    eventBus.on(EVENT_LEVEL_COMPLETED, this.onLevelCompleted);

    this.enableControls();
  }

  destroy() {
    this.disableControls();
    cancelAnimationFrame(this._animationFrameId);
    this._renderer.destroy();
  }

  enableControls() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('touchstart', this.onTouchStart);
    window.addEventListener('touchend', this.onTouchEnd);
  }

  disableControls() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchend', this.onTouchEnd);
  }

  onLevelCompleted() {
    // TODO: show some congratulations
    this._levelPack.level.reset();
    this._levelPack.next();
  }

  onKeyDown(event) {
    if (!this._levelPack || !this._levelPack.level) {
      return;
    }

    if (event.ctrlKey && event.which === 79) { // Ctrl + O
      event.preventDefault();
      // this.browseLevelSet();
      return;
    }

    if (event.altKey && event.which === 90) { // Alt + Z
      this._levelPack.previous();
      return;
    }

    if (event.altKey && event.which === 88) { // Alt + X
      this._levelPack.next();
      return;
    }

    if (event.altKey && event.which === 82) { // Alt + R
      this._levelPack.restart();
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
    if (direction === this._levelPack.level.direction) {
      this._levelPack.level.direction = DIRECTION_NONE;
    }
  }

  onTouchStart(event) {
  }

  onTouchEnd(event) {

  }

  async loadLevelPack(source) {
    const name = source instanceof File ? source.name : source;
    const loader = getLoaderByFileName(name);
    if (loader === null) {
      return Promise.reject(`Unable to find loader for level pack "${name}".`);
    }

    try {
      this._levelPack = await loader.load(source);
    }
    catch (e) {
      console.error(e);
      alert('Unable to load level pack.');
    }
  }

  render(time) {
    const { level } = this._levelPack;
    if (!level) {
      return;
    }
    if (this._renderer.level !== level) {
      this._renderer.level = level;
    }
    this._renderer.render(time);
  }

  animationFrame(time) {
    if (this._previousAnimationTime) {
      const diff = (time - this._previousAnimationTime) / 1000;
      this._fps = Math.floor(1 / diff);
    }
    else {
      this._fps = 0;
    }
    this._previousAnimationTime = time;

    if (this._fps <= 40) {
      console.log(this._fps);
    }

    if (!this._levelPack) {
      this._animationFrameId = requestAnimationFrame(this.animationFrame);
      return;
    }

    const { level } = this._levelPack;
    if (level) {
      level.move();
    }

    this.render(time);
    this._animationFrameId = requestAnimationFrame(this.animationFrame);
  }
}

export default Game;
