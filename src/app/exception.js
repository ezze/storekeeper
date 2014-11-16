/**
 * @module Exception
 */
define([], function() {
    'use strict';

    var Exception = function(message) {
        Error.apply(this, arguments);
        this.name = 'StorekeeperException';
        this.message = message;
    };

    Exception.prototype = Object.create(Error.prototype);

    return Exception;
});