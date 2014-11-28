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
     * @author Dmitriy Pushkov <ezze@ezze.org>
     * @since 0.1.1
     * @alias module:LoaderJson
     * @class
     */
    var LoaderJson = function(options) {
        Loader.apply(this, arguments);
    };

    LoaderJson.prototype = Object.create(Loader.prototype);

    LoaderJson.prototype.load = function(options) {
        _.merge(options, {
            dataType: 'json'
        });
        Loader.prototype.load.apply(this, arguments);
    };

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