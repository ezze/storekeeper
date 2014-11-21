/**
 * @module Wall
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
     * @alias module:Wall
     * @class
     * @augments module:SceneObject
     */
    var Wall = function(options) {
        SceneObject.apply(this, arguments);
        this._name = 'Wall';
        this._sprite.gotoAndStop('wall');
    };

    Wall.prototype = Object.create(SceneObject.prototype);

    return Wall;
});