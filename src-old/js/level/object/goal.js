'use strict';

import SceneObject from './scene-object';

var Goal = function(options) {
    SceneObject.apply(this, arguments);
    this._name = 'Goal';
    this._sprite.gotoAndStop('goal');
};

Goal.prototype = Object.create(SceneObject.prototype);

export default Goal;