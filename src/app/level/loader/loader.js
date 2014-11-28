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

    /**
     * @author Dmitriy Pushkov <ezze@ezze.org>
     * @since 0.1.1
     * @alias module:Loader
     * @class
     */
    var Loader = function() {
        this._name = '';
        this._description = '';
        this._levels = [];
    };

    Loader.prototype.load = function(options) {
        if (window.File && FileReader && options.source instanceof window.File) {
            this.loadByFile(options);
            return;
        }

        if (!_.isString(options.source) || _.isEmpty(options.source)) {
            throw new Exception('Level set\'s data source is invalid or not specified.');
        }
        this.loadByUrl(options);
    };

    /**
     * Loads a level by URL
     *
     * @protected
     *
     * @param {Object} options
     */
    Loader.prototype.loadByUrl = function(options) {
        var url = options.source;

        var dataType = _.isString(options.dataType) ? options.dataType : null;

        var onSucceed = _.isFunction(options.onSucceed) ? options.onSucceed : null;
        var onFailed = _.isFunction(options.onFailed) ? options.onFailed : null;
        var onCompleted = _.isFunction(options.onCompleted) ? options.onCompleted : null;

        var eventParams = {
            loader: this,
            source: url,
            type: 'url'
        };

        var loadOptions = {
            url: url,
            success: function(data, textStatus, jqXHT) {
                _.merge(eventParams, {
                    data: data
                });
                this.onSucceed(eventParams);
                if (onSucceed !== null) {
                    onSucceed(eventParams);
                }
            }.bind(this),
            error: function(jqXHR, textStatus, errorThrown) {
                this.onFailed(eventParams);
                if (onFailed !== null) {
                    onFailed(eventParams);
                }
            }.bind(this),
            complete: function(jqXHR, textStatus) {
                this.onCompleted(eventParams);
                if (onCompleted !== null) {
                    onCompleted(eventParams);
                }
            }.bind(this)
        };

        if (_.isString(dataType)) {
            loadOptions.dataType = this._dataType;
        }

        $.ajax(loadOptions);
    };

    /**
     * Loads a level by File instance.
     *
     * @protected
     *
     * @param {Object} options
     */
    Loader.prototype.loadByFile = function(options) {
        var file = options.source;

        var onSucceed = _.isFunction(options.onSucceed) ? options.onSucceed : null;
        var onFailed = _.isFunction(options.onFailed) ? options.onFailed : null;
        var onCompleted = _.isFunction(options.onCompleted) ? options.onCompleted : null;

        var eventParams = {
            loader: this,
            source: file,
            type: 'file'
        };

        var reader = new window.FileReader();

        reader.onload = function(event) {
            _.merge(eventParams, {
                data: event.target.result
            });
            this.onSucceed(eventParams);
            if (onSucceed !== null) {
                onSucceed(eventParams);
            }

            this.onCompleted(eventParams);
            if (onCompleted !== null) {
                onCompleted(eventParams);
            }
        }.bind(this);

        reader.onerror = function(event) {
            this.onFailed(eventParams);
            if (onFailed !== null) {
                onFailed(eventParams);
            }

            this.onCompleted(eventParams);
            if (onCompleted !== null) {
                onCompleted(eventParams);
            }
        }.bind(this);

        var blob = file.slice(0, file.size);
        reader.readAsBinaryString(blob);
    };

    Loader.prototype.onSucceed = function(params) {
        params.loader.parse(params.data);
    };

    Loader.prototype.onFailed = function(params) {};

    Loader.prototype.onCompleted = function(params) {};

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