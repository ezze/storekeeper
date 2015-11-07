/**
 * @module LoaderSok
 */
define([
    'lodash',
    './loader'
], function(
    _,
    Loader
) {
    'use strict';

    var commentRegExp = /^::/;
    var rowRegExp = /^[@+#.$* ]+$/;

    /**
     * Loads level set from SOK-file.
     *
     * <p>See SOK-file's format description [here]{@link http://www.sokobano.de/wiki/index.php?title=Sok_format}.</p>
     *
     * @author Dmitriy Pushkov <ezze@ezze.org>
     * @since 0.1.1
     * @alias module:LoaderSok
     * @class
     * @augments module:Loader
     */
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

    /**
     * Parses level set's data from SOK string.
     *
     * @param {String} data
     * Level set's data in SOK format.
     */
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