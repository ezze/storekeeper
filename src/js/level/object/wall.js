'use strict';

import SceneObject from './scene-object';

var Wall = function(options) {
    SceneObject.apply(this, arguments);
    this._name = 'Wall';
    this._sprite.gotoAndStop('wall');
};

Wall.prototype = Object.create(SceneObject.prototype);

export default Wall;