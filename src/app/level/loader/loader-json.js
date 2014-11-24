define([
    './loader'
], function(
    Loader
) {
    'use strict';

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