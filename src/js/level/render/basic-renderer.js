import Renderer from './renderer';

let font = '24px "Lucida Console", Monaco, monospace';

class BasicRenderer extends Renderer {
    constructor(options) {
        super(options);
    }

    get itemWidth() {
        return 24;
    }

    get itemHeight() {
        return 24;
    }

    renderWorker(context, x, y, item) {
        context.font = font;
        context.fillStyle = '#fff';
        context.fillText('@', x, y);
    }

    renderWall(context, x, y, item) {
        context.font = font;
        context.fillStyle = '#c00';
        context.fillText('#', x, y);
    }

    renderGoal(context, x, y, item) {
        context.font = font;
        context.fillStyle = '#ddd';
        context.fillText('.', x, y);
    }

    renderBox(context, x, y, item) {
        context.font = font;
        context.fillStyle = '#dd0';
        context.fillText('$', x, y);
    }
}

export default BasicRenderer;