/**
 * @module SceneObject
 */
define([
    'require',
    'easel',
    'lodash',
    '../sprite-sheet'
], function(
    require,
    Easel,
    _,
    spriteSheet
) {
    'use strict';

    /**
     * Represents a scene object of a [level]{@link module:Level}.
     *
     * <p>Any scene object that can be added to the level by {@link module:Level#addObject} method
     * must be derived from this class.</p>
     *
     * @param {Object} options
     * Object with the following properties:
     *
     * @param {module:Level} options.level
     * Level this object will be added to.
     *
     * @param {Number} options.row
     * Zero-based row of the level this object will be placed in.
     *
     * @param {Number} options.column
     * Zero-based column of the level this object will be placed in.
     *
     * @author Dmitriy Pushkov <ezze@ezze.org>
     * @since 0.1.0
     * @alias module:SceneObject
     * @class
     */
    var SceneObject = function(options) {
        if (!options.level instanceof require('../level')) {
            throw new Error('Level is invalid or not specified.');
        }

        if (!_.isNumber(options.row) || options.row % 1 !== 0) {
            throw new Error('Scene object\'s row must be an integer.');
        }

        if (!_.isNumber(options.column) || options.column % 1 !== 0) {
            throw new Error('Scene object\'s column must be an integer.');
        }

        this._name = '';

        this._level = options.level;
        this._row = options.row;
        this._column = options.column;

        this._width = spriteSheet.data.frames.width;
        this._height = spriteSheet.data.frames.height;

        this._sprite = new Easel.Sprite(spriteSheet.instance, 'space');

        this.updatePixels();
    };

    /**
     * Calculates left offset of the object in pixels by its column index.
     *
     * @param {Number} column
     * Column's zero-based index.
     *
     * @returns {Number}
     *
     * @see module:SceneObject#rowToPixels
     * @see module:SceneObject#updatePixels
     */
    SceneObject.prototype.columnToPixels = function(column) {
        return column * this._width;
    };

    /**
     * Calculates top offset of the object in pixels by its row index.
     *
     * @param {Number} row
     * Row's zero-based index.
     *
     * @returns {Number}
     *
     * @see module:SceneObject#columnToPixels
     * @see module:SceneObject#updatePixels
     */
    SceneObject.prototype.rowToPixels = function(row) {
        return row * this._height;
    };

    /**
     * Updates coordinates of scene object's sprite according to its
     * current {@link module:SceneObject#row} and {@link module:SceneObject#column}.
     */
    SceneObject.prototype.updatePixels = function() {
        this._sprite.x = this.columnToPixels(this.column);
        this._sprite.y = this.rowToPixels(this.row);
    };

    Object.defineProperties(SceneObject.prototype, {
        /**
         * Gets scene object's name.
         *
         * @type {String}
         * @memberof module:SceneObject.prototype
         */
        name: {
            get: function() {
                return this._name;
            }
        },
        /**
         * Gets a level this scene object added to.
         *
         * @type {module:Level}
         * @memberof module:SceneObject.prototype
         */
        level: {
            get: function() {
                return this._level;
            }
        },
        /**
         * Gets scene object's sprite.
         *
         * @type {Object}
         * @memberof module:SceneObject.prototype
         * @see http://www.createjs.com/Docs/EaselJS/classes/Sprite.html
         */
        sprite: {
            get: function() {
                return this._sprite;
            }
        },
        /**
         * Gets or sets zero-based (and not necessarily integer)
         * index of [level]{@link module:SceneObject#level}'s row this scene object is located at.
         *
         * @type {Number}
         * @memberof module:SceneObject.prototype
         * @see module:SceneObject#column
         */
        row: {
            get: function() {
                return this._row;
            },
            set: function(row) {
                if (!_.isNumber(row)) {
                    throw new Error('Row must be a number.');
                }
                this._row = row;
            }
        },
        /**
         * Gets or sets zero-based (and not necessarily integer)
         * index of [level]{@link module:SceneObject#level}'s column this scene object is located at.
         *
         * @type {Number}
         * @memberof module:SceneObject.prototype
         * @see module:SceneObject#row
         */
        column: {
            get: function() {
                return this._column;
            },
            set: function(column) {
                if (!_.isNumber(column)) {
                    throw new Error('Column must be a number.');
                }
                this._column = column;
            }
        }
    });

    /**
     * Holds a sprite sheet object this scene object is based on.
     *
     * @type {Object}
     */
    SceneObject.spriteSheet = spriteSheet;

    return SceneObject;
});