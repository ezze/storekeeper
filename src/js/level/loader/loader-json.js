'use strict';

import _ from 'lodash';
import Loader from './loader';

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

LoaderJson.prototype.parse = function(data) {
    if (_.isString(data)) {
        data = JSON.parse(data);
    }

    this.name = data.name;
    this.description = data.description;
    this.levels = data.levels;
};

export default LoaderJson;