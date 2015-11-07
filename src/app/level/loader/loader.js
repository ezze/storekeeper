/**
 * @module Loader
 */
define([
    'jquery',
    'lodash',
    '../../event-manager'
], function(
    $,
    _,
    EventManager
) {
    'use strict';

    /**
     * Abstract class each level set loader should be derived from.
     *
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

    /**
     * Loads level set.
     *
     * @param {Object} options
     * Object with the following properties:
     *
     * @param {String|File} options.source
     * URL of level set or its file instance.
     *
     * @param {String} [options.dataType]
     * Level set's format.
     *
     * @param {Function} [options.onSucceed]
     * Function to invoke on successful level set's load.
     *
     * @param {Function} [options.onFailed]
     * Function to invoke on failed level set's load.
     */
    Loader.prototype.load = function(options) {
        if (window.File && FileReader && options.source instanceof window.File) {
            this.loadByFile(options);
            return;
        }

        if (!_.isString(options.source) || _.isEmpty(options.source)) {
            throw new Error('Level set\'s data source is invalid or not specified.');
        }
        this.loadByUrl(options);
    };

    /**
     * Loads a level by URL.
     *
     * @protected
     *
     * @param {Object} options
     * Object with the following properties:
     *
     * @param {String} options.source
     * URL of level set.
     *
     * @param {String} [options.dataType]
     * Level set's format.
     *
     * @param {Function} [options.onSucceed]
     * Function to invoke on successful level set's load.
     *
     * @param {Function} [options.onFailed]
     * Function to invoke on failed level set's load.
     */
    Loader.prototype.loadByUrl = function(options) {
        var url = options.source;

        var dataType = _.isString(options.dataType) ? options.dataType : null;

        var onSucceed = _.isFunction(options.onSucceed) ? options.onSucceed : null;
        var onFailed = _.isFunction(options.onFailed) ? options.onFailed : null;

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
            }.bind(this)
        };

        if (_.isString(dataType)) {
            loadOptions.dataType = dataType;
        }

        $.ajax(loadOptions);
    };

    /**
     * Loads a level by File instance.
     *
     * @protected
     *
     * @param {Object} options
     * Object with the following properties:
     *
     * @param {File} options.source
     * Level set's file instance.
     *
     * @param {String} [options.dataType]
     * Level set's format.
     *
     * @param {Function} [options.onSucceed]
     * Function to invoke on successful level set's load.
     *
     * @param {Function} [options.onFailed]
     * Function to invoke on failed level set's load.
     */
    Loader.prototype.loadByFile = function(options) {
        var file = options.source;

        var onSucceed = _.isFunction(options.onSucceed) ? options.onSucceed : null;
        var onFailed = _.isFunction(options.onFailed) ? options.onFailed : null;

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
        }.bind(this);

        reader.onerror = function(event) {
            this.onFailed(eventParams);
            if (onFailed !== null) {
                onFailed(eventParams);
            }
        }.bind(this);

        var blob = file.slice(0, file.size);
        reader.readAsBinaryString(blob);
    };

    /**
     * Method being invoked on successful level set's load.
     *
     * @param {Object} params
     * Object with the following properties:
     *
     * @param {module:Loader} params.loader
     * Reference to this loader.
     *
     * @param {String|File} params.source
     * Source used to fetch level set's <code>data</code>.
     *
     * @param {String} params.type
     * Type of the used <code>source</code>: <code>url</code> or <code>file</code>.
     *
     * @param {Object} params.data
     * Data fetched from the source.
     *
     * @see module:Loader#onFailed
     */
    Loader.prototype.onSucceed = function(params) {
        params.loader.parse(params.data);
    };

    /**
     * Method being invoked on failed level set's load.
     *
     * @param {Object} params
     * Object with the following properties:
     *
     * @param {module:Loader} params.loader
     * Reference to this loader.
     *
     * @param {String|File} params.source
     * Source used to fetch level set's data.
     *
     * @param {String} params.type
     * Type of the used <code>source</code>: <code>url</code> or <code>file</code>.
     *
     * @see module:Loader#onSucceed
     */
    Loader.prototype.onFailed = function(params) {};

    /**
     * Parses data fetched on successful call of {@link module:Loader#load} method.
     *
     * <p>This method should be implemented in derived class and set
     * {@link module:Loader#name}, {@link module:Loader#description} and
     * {@link module:Loader#levels} properties.</p>
     *
     * @abstract
     *
     * @param {Object} data
     */
    Loader.prototype.parse = function(data) {
        throw new Error('Method "parse" is not implemented.');
    };

    Object.defineProperties(Loader.prototype, {
        /**
         * Gets or sets a name of loaded level set.
         *
         * @type {String}
         * @memberof module:Loader.prototype
         */
        name: {
            get: function() {
                return this._name;
            },
            set: function(name) {
                if (!_.isString(name)) {
                    throw new Error('Level set\'s name must be a string.');
                }
                this._name = name;
            }
        },
        /**
         * Gets or sets a description of loaded level set.
         *
         * @type {String}
         * @memberof module:Loader.prototype
         */
        description: {
            get: function() {
                return this._description;
            },
            set: function(description) {
                if (!_.isString(description)) {
                    throw new Error('Level set\'s description must be a string.');
                }
                this._description = description;
            }
        },
        /**
         * Gets or sets levels' data of loaded level set.
         *
         * <p>Each array item represents <code>options</code> argument
         * being passed to {@link module:Level}'s constructor.</p>
         *
         * @type {Array}
         * @memberof module:Loader.prototype
         */
        levels: {
            get: function() {
                return this._levels;
            },
            set: function(levels) {
                if (!_.isArray(levels)) {
                    throw new Error('Levels\' data must be an array.');
                }
                this._levels = levels;
            }
        }
    });

    return Loader;
});