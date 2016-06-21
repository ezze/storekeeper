'use strict';

import _ from 'lodash';
import Loader from './loader';

var commentRegExp = /^::/;
var rowRegExp = /^[@+#.$* ]+$/;

var LoaderSok = function() {
    Loader.apply(this, arguments);
};

LoaderSok.prototype = Object.create(Loader.prototype);

LoaderSok.prototype.load = function(options) {
    _.merge(options, {
        dataType: 'text'
    });
    Loader.prototype.load.apply(this, arguments);
};

LoaderSok.prototype.parse = function(data) {
    var lines = data.split('\n');

    var levels = [];
    var level = null;

    // TODO: implement reading metadata (titles, descriptions, etc.)

    _.each(lines, function(line, i) {
        line = line.replace(/\r$/, '');

        if (commentRegExp.test(line)) {
            return;
        }

        if (rowRegExp.test(line)) {
            if (level === null) {
                level = {
                    name: '',
                    description: '',
                    items: []
                };
            }
            level.items.push(line);
        }
        else {
            if (level !== null) {
                levels.push(level);
            }
            level = null;
        }
    });

    this.levels = levels;
};

export default LoaderSok;