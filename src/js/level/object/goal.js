'use strict';

import SceneObject from './scene-object';

/**
 * Represents goal's scene object.
 *
 * @param {Object} options
 * Object with the following properties:
 *
 * @param {module:Level} options.level
 * Level the goal will be added to.
 *
 * @param {Number} options.row
 * Zero-based row of the level the goal will be placed in.
 *
 * @param {Number} options.column
 * Zero-based column of the level the goal will be placed in.
 *
 * @author Dmitriy Pushkov <ezze@ezze.org>
 * @since 0.1.0
 * @alias module:Goal
 * @class
 * @augments module:SceneObject
 */
var Goal = function(options) {
    SceneObject.apply(this, arguments);
    this._name = 'Goal';
    this._sprite.gotoAndStop('goal');
};

Goal.prototype = Object.create(SceneObject.prototype);

module.exports = Goal;