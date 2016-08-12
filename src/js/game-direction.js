import $ from 'jquery';
import Direction from './level/direction';

export default {
    byKeyCode(code) {
        switch (code) {
            case 37:
            case 65:
                return Direction.LEFT;        // arrow left or A
            case 38:
            case 87:
                return Direction.UP;          // arrow up or W
            case 39:
            case 68:
                return Direction.RIGHT;       // arrow right or D
            case 40:
            case 83:
                return Direction.DOWN;        // arrow down or S
            default:
                return Direction.NONE;
        }
    },
    byTouchPoint(target, x, y) {
        var $target = $(target);
        var targetWidth = $target.width();
        var targetHeight = $target.height();

        var targetRatio = targetHeight / targetWidth;

        if (y < targetRatio * x && y < targetHeight - targetRatio * x) {
            return Direction.UP;
        }

        if (y > targetRatio * x && y > targetHeight - targetRatio * x) {
            return Direction.DOWN;
        }

        if (y > targetRatio * x && y < targetHeight - targetRatio * x) {
            return Direction.LEFT;
        }

        if (y < targetRatio * x && y > targetHeight - targetRatio * x) {
            return Direction.RIGHT;
        }

        return Direction.NONE;
    }
};