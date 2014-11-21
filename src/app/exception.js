/**
 * @module Exception
 */
define([], function() {
    'use strict';

    /**
     * Exception for application's inner purposes.
     *
     * @param {String} message
     * Error message.
     *
     * @author Dmitriy Pushkov <ezze@ezze.org>
     * @since 0.1.0
     * @alias module:Exception
     * @class
     */
    var Exception = function(message) {
        Error.apply(this, arguments);
        this.name = 'StorekeeperException';
        this.message = message;
    };

    Exception.prototype = Object.create(Error.prototype);

    return Exception;
});