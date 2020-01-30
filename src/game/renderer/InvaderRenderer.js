import { DIRECTION_LEFT } from '../../constants';

import Renderer from './Renderer';

import spritesUrl from './invader.png';

class InvaderRenderer extends Renderer {
  #spritesLoaded = false;
  #sprites = null;

  constructor(options) {
    super(options);
    this.loadSprites().catch(e => console.error(e));
  }

  async loadSprites() {
    this.#spritesLoaded = false;
    return new Promise((resolve, reject) => {
      const sprites = this.#sprites = new Image();
      sprites.src = spritesUrl;
      sprites.onload = () => {
        this.#spritesLoaded = true;
        resolve();
      };
      sprites.onerror = e => reject(e);
    });
  }

  renderSprite(context, x, y, index) {
    if (!this.#spritesLoaded) {
      return;
    }
    const { pointX, pointY } = this.clipSprite(index);
    const { itemWidth, itemHeight } = this;
    context.drawImage(this.#sprites, pointX, pointY, itemWidth, itemHeight, x, y, itemWidth, itemHeight);
  }

  clipSprite(index) {
    const columns = Math.floor(this.#sprites.width / this.itemWidth);
    const row = Math.floor(index / columns);
    const column = index - row * columns;
    return { pointX: column * this.itemWidth, pointY: row * this.itemHeight };
  }

  get itemWidth() {
    return 32;
  }

  get itemHeight() {
    return 32;
  }

  renderWorker(context, x, y, item) {
    let spriteIndex = 4 + (item.lastHorizontalDirection === DIRECTION_LEFT ? 0 : 9);

    if (item.consecutiveStepsCount > 0) {
      const visualStepsCount = Math.ceil(item.consecutiveStepsCount / 2);
      spriteIndex += ((visualStepsCount - 1) % 8) + 1;
    }

    this.renderSprite(context, x, y, spriteIndex);
  }

  renderWorkerOverGoal(context, x, y, item) {
    this.renderWorker(context, x, y, item);
  }

  renderWall(context, x, y, item) { // eslint-disable-line no-unused-vars
    this.renderSprite(context, x, y, 2);
  }

  renderGoal(context, x, y, item) { // eslint-disable-line no-unused-vars
    this.renderSprite(context, x, y, 3);
  }

  renderGoalBehindWorker(context, x, y, item) { // eslint-disable-line no-unused-vars
    this.renderGoal(context, x, y, item);
  }

  renderGoalBehindBox(context, x, y, item) { // eslint-disable-line no-unused-vars
    this.renderGoal(context, x, y, item);
  }

  renderBox(context, x, y, item) {
    if (item.goalSource && item.goalTarget) {
      this.renderBoxOverGoal(context, x, y, item);
    }
    else {
      this.renderSprite(context, x, y, 0);
    }
  }

  renderBoxOverGoal(context, x, y, item) { // eslint-disable-line no-unused-vars
    this.renderSprite(context, x, y, 1);
  }
}

export default InvaderRenderer;
