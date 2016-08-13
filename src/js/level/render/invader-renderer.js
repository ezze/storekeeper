import {Promise} from 'es6-promise';

import Direction from '../direction';
import Renderer from './renderer';

class InvaderRenderer extends Renderer {
    constructor(options) {
        super(options);
        this.loadImage();
    }

    loadImage() {
        this._isImageLoaded = false;
        return new Promise((resolve, reject) => {
            let image = this._image = new Image();
            image.src = 'assets/img/sprites.png';
            image.onload = () => {
                resolve();
                this._isImageLoaded = true;
            };
            image.onerror = () => {
                reject();
            };
        });
    }

    renderSprite(context, x, y, index) {
        if (!this._isImageLoaded) {
            return;
        }

        let clip = this.clipImage(index);
        context.drawImage(
            this._image,
            clip.sx, clip.sy, clip.swidth, clip.sheight,
            x, y, this.itemWidth, this.itemHeight
        );
    }

    clipImage(index) {
        let columns = Math.floor(this._image.width / this.itemWidth);

        let row = Math.floor(index / columns),
            column = index - row * columns;

        return {
            sx: column * this.itemWidth,
            sy: row * this.itemHeight,
            swidth: this.itemWidth,
            sheight: this.itemHeight
        };
    }

    get itemWidth() {
        return 32;
    }

    get itemHeight() {
        return 32;
    }

    renderWorker(context, x, y, item) {
        let spriteIndex = 4 + (item.lastHorizontalDirection === Direction.LEFT ? 0 : 9);

        if (item.consecutiveStepsCount > 0) {
            let visualStepsCount = Math.ceil(item.consecutiveStepsCount / 2);
            spriteIndex += ((visualStepsCount - 1) % 8) + 1;
        }

        this.renderSprite(context, x, y, spriteIndex);
    }

    renderWorkerOverGoal(context, x, y, item) {
        this.renderWorker(context, x, y, item);
    }

    renderWall(context, x, y, item) {
        this.renderSprite(context, x, y, 2);
    }

    renderGoal(context, x, y, item) {
        this.renderSprite(context, x, y, 3);
    }

    renderGoalBehindWorker(context, x, y, item) {
        this.renderGoal(context, x, y, item);
    }

    renderGoalBehindBox(context, x, y, item) {
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

    renderBoxOverGoal(context, x, y, item) {
        this.renderSprite(context, x, y, 1);
    }
}

export default InvaderRenderer;