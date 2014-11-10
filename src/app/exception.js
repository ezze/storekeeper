/**
 * @module Exception
 */
define([], function() {
    'use strict';

    var Exception = function() {
        Error.apply(this);
        this.name = 'StorekeeperException';
    };

    Exception.prototype = Object.create(Error.prototype);

    return Exception;
});