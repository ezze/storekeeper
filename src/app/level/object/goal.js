/**
 * @module Goal
 */
define([
    './scene-object'
], function(
    SceneObject
) {
    'use strict';

    /**
     * @param {Object} options
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

    return Goal;
});