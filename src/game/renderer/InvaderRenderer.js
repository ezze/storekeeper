import { DIRECTION_LEFT } from '../../constants/direction';

import Renderer from './Renderer';

import spritesUrl from './invader.png';

class InvaderRenderer extends Renderer {
  _box;
  _boxOverGoal;
  _wall;
  _goal;
  _worker = [];

  async init() {
    return new Promise((resolve, reject) => {
      const sprites = new Image();
      sprites.src = spritesUrl;
      sprites.onload = () => {
        try {
          const { itemWidth: width, itemHeight: height } = this;
          this._box = cropSprite(sprites, width, height, 0);
          this._boxOverGoal = cropSprite(sprites, width, height, 1);
          this._wall = cropSprite(sprites, width, height, 2);
          this._goal = cropSprite(sprites, width, height, 3);
          for (let i = 0; i < 18; i++) {
            this._worker.push(cropSprite(sprites, width, height, 4 + i));
          }
          this._ready = true;
          resolve();
        }
        catch (e) {
          reject(e);
        }
      };
      sprites.onerror = e => reject(e);
    });
  }

  get itemWidth() {
    return 32;
  }

  get itemHeight() {
    return 32;
  }

  renderWorker(context, x, y, worker) {
    let index = worker.lastHorizontalDirection === DIRECTION_LEFT ? 0 : 9;
    if (worker.consecutiveStepsCount > 0) {
      const visualStepsCount = Math.ceil(worker.consecutiveStepsCount / 2);
      index += ((visualStepsCount - 1) % 8) + 1;
    }
    context.drawImage(this._worker[index], x, y);
  }

  renderWorkerOverGoal(context, x, y, worker) {
    this.renderWorker(context, x, y, worker);
  }

  renderWall(context, x, y) {
    context.drawImage(this._wall, x, y);
  }

  renderGoal(context, x, y) {
    context.drawImage(this._goal, x, y);
  }

  renderGoalBehindWorker(context, x, y) {
    context.drawImage(this._goal, x, y);
  }

  renderGoalBehindBox(context, x, y) {
    context.drawImage(this._goal, x, y);
  }

  renderBox(context, x, y, box) {
    if (box.goalSource && box.goalTarget) {
      context.drawImage(this._boxOverGoal, x, y);
    }
    else {
      context.drawImage(this._box, x, y);
    }
  }

  renderBoxOverGoal(context, x, y) {
    context.drawImage(this._boxOverGoal, x, y);
  }
}

function cropSprite(sprites, width, height, index) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const columns = Math.floor(sprites.width / width);
  const row = Math.floor(index / columns);
  const column = index - row * columns;
  const x = column * width;
  const y = row * height;

  const context = canvas.getContext('2d');
  context.drawImage(sprites, x, y, width, height, 0, 0, width, height);
  return canvas;
}

export default InvaderRenderer;
