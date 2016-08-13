'use strict';

import $ from 'jquery';
import _ from 'lodash';

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
        throw new Error('Level set\'s data source is invalid or not specified.');
    }
    this.loadByUrl(options);
};

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

Loader.prototype.onSucceed = function(params) {
    params.loader.parse(params.data);
};

Loader.prototype.onFailed = function(params) {};

Loader.prototype.parse = function(data) {
    throw new Error('Method "parse" is not implemented.');
};

Object.defineProperties(Loader.prototype, {
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

export default Loader;