import { EventMixin } from 'dissemination';

import { DIRECTION_NONE } from '../constants';

import LevelPack from './level/LevelPack';
import Renderer from './renderer/Renderer';
import LoaderFactory from './level/loader/LoaderFactory';
import { getDirectionByKeyCode } from './direction';

class Game {
  #renderer;
  #levelPack;
  #animationFrameId;

  constructor(options = {}) {
    const { renderer, levelPack } = options;

    if (!(renderer instanceof Renderer)) {
      throw new Error('Renderer is not provided or invalid.');
    }
    this.#renderer = renderer;

    if (levelPack instanceof LevelPack) {
      this.#levelPack = levelPack;
    }
    else if (typeof levelPack === 'string' || levelPack instanceof File) {
      this.loadLevelPack(levelPack).catch(e => console.error(e));
    }
    else {
      this.#levelPack = null;
    }

    this.animationFrame = this.animationFrame.bind(this);
    this.#animationFrameId = requestAnimationFrame(this.animationFrame);

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.enableControls();
  }

  destroy() {
    this.disableControls();

    cancelAnimationFrame(this.#animationFrameId);

    if (this.#levelPack) {
      this.removeLevelPackListeners(this.#levelPack);
    }

    this.#renderer.destroy();
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

  onKeyDown(event) {
    if (!this.#levelPack || !this.#levelPack.level) {
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

    this.#levelPack.level.direction = direction;
  }

  onKeyUp(event) {
    if (!this.#levelPack || !this.#levelPack.level) {
      return;
    }
    const direction = getDirectionByKeyCode(event.which);
    if (direction === this.#levelPack.level.direction) {
      this.#levelPack.level.direction = DIRECTION_NONE;
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
      const levelPack = this.#levelPack = loader.parse(response.data);
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
    const { level } = this.#levelPack;
    if (level === null) {
      return;
    }
    if (this.#renderer.level !== level) {
      this.#renderer.level = level;
    }
    this.#renderer.render(time);
  }

  animationFrame(time) {
    if (!this.#levelPack) {
      this.#animationFrameId = requestAnimationFrame(this.animationFrame);
      return;
    }

    const { level } = this.#levelPack;
    if (level) {
      level.move();
    }

    this.render(time);
    this.#animationFrameId = requestAnimationFrame(this.animationFrame);
  }

  goToPreviousLevel() {
    if (this.#levelPack) {
      this.#levelPack.goToPrevious();
    }
  }

  goToNextLevel() {
    if (this.#levelPack) {
      this.#levelPack.goToNext();
    }
  }

  restartLevel() {
    if (this.#levelPack) {
      this.#levelPack.restart();
    }
  }

  setLevelPack(levelSet) {
    if (this.#levelPack) {
      this.removeLevelPackListeners(this.#levelPack);
    }

    this.#levelPack = levelSet;
    this.addLevelPackListeners(levelSet);
  }
}

Object.assign(Game.prototype, EventMixin);

export default Game;
