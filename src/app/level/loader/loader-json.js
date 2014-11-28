/**
 * @module LoaderJson
 */
define([
    'lodash',
    './loader'
], function(
    _,
    Loader
) {
    'use strict';

    /**
     * Loads level set from JSON file's in game internal format.
     *
     * <p>See <code>levels/classic.json</code> for file's structure example.</p>
     *
     * @author Dmitriy Pushkov <ezze@ezze.org>
     * @since 0.1.1
     * @alias module:LoaderJson
     * @class
     * @augments module:Loader
     */
    var LoaderJson = function() {
        Loader.apply(this, arguments);
    };

    LoaderJson.prototype = Object.create(Loader.prototype);

    LoaderJson.prototype.load = function(options) {
        _.merge(options, {
            dataType: 'json'
        });
        Loader.prototype.load.apply(this, arguments);
    };

    /**
     * Parses level set's data from JSON.
     *
     * @param {Object|String} data
     * Level set's data:
     *
     * @param {String} data.name
     * Level set's name.
     *
     * @param {String} data.description
     * Level set's description.
     *
     * @param {Array} data.levels
     * Array of levels' <code>options</code> parameters being passed
     * to {@link module:Level}'s constructor as arguments.
     */
    LoaderJson.prototype.parse = function(data) {
        if (_.isString(data)) {
            data = JSON.parse(data);
        }

        this.name = data.name;
        this.description = data.description;
        this.levels = data.levels;
    };

    return LoaderJson;
});