/**
 * @module Loader
 */
define([
    'jquery',
    'lodash',
    '../../event-manager',
    '../../exception'
], function(
    $,
    _,
    EventManager,
    Exception
) {
    'use strict';

    var Loader = function(options) {
        if (!_.isString(options.source) || _.isEmpty(options.source)) {
            throw new Exception('Level set\'s data source is invalid or not specified.');
        }
        this._source = options.source;

        this._dataType = _.isString(options.dataType) ? options.dataType : null;

        this._onSucceed = _.isFunction(options.onSucceed) ? options.onSucceed : null;
        this._onFailed = _.isFunction(options.onFailed) ? options.onFailed : null;
        this._onCompleted = _.isFunction(options.onCompleted) ? options.onCompleted : null;

        this._name = '';
        this._description = '';
        this._levels = [];
    };

    Loader.prototype.load = function() {
        var eventParams = {
            loader: this
        };

        var loadOptions = {
            url: this._source,
            success: function(data, textStatus, jqXHT) {
                _.merge(eventParams, {
                    data: data
                });
                this.onSucceed(eventParams);
                if (this._onSucceed !== null) {
                    this._onSucceed(eventParams);
                }
            }.bind(this),
            error: function(jqXHR, textStatus, errorThrown) {
                this.onFailed(eventParams);
                if (this._onFailed !== null) {
                    this._onFailed(eventParams);
                }
            }.bind(this),
            complete: function(jqXHR, textStatus) {
                this.onCompleted(eventParams);
                if (this._onCompleted !== null) {
                    this._onCompleted(eventParams);
                }
            }.bind(this)
        };

        if (_.isString(this._dataType)) {
            loadOptions.dataType = this._dataType;
        }

        $.ajax(loadOptions);
    };

    Loader.prototype.onSucceed = function(params) {
        params.loader.parse(params.data);
    };

    Loader.prototype.onFailed = function(params) {
};

    Loader.prototype.onCompleted = function(params) {
    };

    Loader.prototype.parse = function(data) {
        throw new Exception('Method "parse" is not implemented.');
    };

    Object.defineProperties(Loader.prototype, {
        name: {
            get: function() {
                return this._name;
            },
            set: function(name) {
                if (!_.isString(name)) {
                    throw new Exception('Level set\'s name must be a string.');
                }
                this._name = name;
            }
        },
        description: {
            get: function() {
                return this._description;
            },
            set: function(description) {
                if (!_.isString(name)) {
                    throw new Exception('Level set\'s description must be a string.');
                }
                this._description = description;
            }
        },
        levels: {
            get: function() {
                return this._levels;
            },
            set: function(levels) {
                if (!_.isArray(levels)) {
                    throw new Exception('Levels\' data must be an array.');
                }
                this._levels = levels;
            }
        }
    });

    return Loader;
});