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
     * @param {Object} options
     *
     * @author Dmitriy Pushkov <ezze@ezze.org>
     * @since 0.1.1
     * @alias module:LoaderJson
     * @class
     */
    var LoaderJson = function(options) {
        _.merge(options, {
            dataType: 'json'
        });
        Loader.apply(this, arguments);
    };

    LoaderJson.prototype = Object.create(Loader.prototype);

    LoaderJson.prototype.parse = function(data) {
        this.name = data.name;
        this.description = data.description;
        this.levels = data.levels;
    };

    return LoaderJson;
});