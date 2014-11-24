/**
 * @module LoaderSok
 */
define([
    'lodash',
    './loader',
    '../../exception'
], function(
    _,
    Loader,
    Exception
) {
    'use strict';

    var commentRegExp = /^::/;
    var rowRegExp = /^[@+#.$* ]+$/;

    /**
     * @param {Object} options
     *
     * @author Dmitriy Pushkov <ezze@ezze.org>
     * @since 0.1.1
     * @alias module:LoaderSok
     * @class
     * @augments module:Loader
     */
    var LoaderSok = function(options) {
        _.merge(options, {
            dataType: 'text'
        });
        Loader.apply(this, arguments);
    };

    LoaderSok.prototype = Object.create(Loader.prototype);

    LoaderSok.prototype.parse = function(data) {
        var lines = data.split('\n');

        var levels = [];
        var level = null;

        // TODO: implement reading metadata (titles, descriptions, etc.)

        _.forEach(lines, function(line, i) {
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

    return LoaderSok;
});