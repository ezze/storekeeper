import Renderer from './Renderer';

const font = '24px "Lucida Console", Monaco, monospace';

class BasicRenderer extends Renderer {
  get itemWidth() {
    return 24;
  }

  get itemHeight() {
    return 24;
  }

  renderWorker(context, x, y) {
    context.font = font;
    context.fillStyle = '#fff';
    context.fillText('@', x, y + this.itemHeight);
  }

  renderWorkerOverGoal(context, x, y) {
    context.font = font;
    context.fillStyle = '#ffd';
    context.fillText('+', x, y + this.itemHeight);
  }

  renderWall(context, x, y) {
    context.font = font;
    context.fillStyle = '#c00';
    context.fillText('#', x, y + this.itemHeight);
  }

  renderGoal(context, x, y) {
    context.font = font;
    context.fillStyle = '#ddd';
    context.fillText('.', x, y + this.itemHeight);
  }

  renderGoalBehindWorker() {
    // Do nothing
  }

  renderGoalBehindBox() {
    // Do nothing
  }

  renderBox(context, x, y) {
    context.font = font;
    context.fillStyle = '#dd0';
    context.fillText('$', x, y + this.itemHeight);
  }

  renderBoxOverGoal(context, x, y) {
    context.font = font;
    context.fillStyle = '#0d0';
    context.fillText('*', x, y + this.itemHeight);
  }
}

export default BasicRenderer;
