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
     * Represents wall's scene object.
     *
     * @param {Object} options
     * Object with the following properties:
     *
     * @param {module:Level} options.level
     * Level the wall will be added to.
     *
     * @param {Number} options.row
     * Zero-based row of the level the wall will be placed in.
     *
     * @param {Number} options.column
     * Zero-based column of the level the wall will be placed in.
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