/**
 * @module EventManager
 */
define([
    'lodash',
    './exception'
], function(
    _,
    Exception
    ) {
    'use strict';

    /**
     * @alias module:EventManager
     * @class
     */
    var EventManager = function() {
        this._handlers = {};
    };

    EventManager.prototype.addEventHandler = function(name, handler) {
        if (_.isString(name)) {
            name = [name];
        }
        if (!_.isArray(name)) {
            throw new Exception('Event\'s name is invalid.');
        }
        _.forEach(name, function(eventName) {
            if (!_.isString(eventName)) {
                throw new Exception('Event\'s name is invalid.');
            }
        });

        if (_.isFunction(handler)) {
            handler = [handler];
        }
        if (!_.isArray(handler)) {
            throw new Exception('Event\'s handler is invalid.');
        }
        _.forEach(handler, function(func) {
            if (!_.isFunction(func)) {
                throw new Exception('Event\'s handler is invalid.');
            }
        });

        var handlers = this._handlers;

        _.forEach(name, function(eventName) {
            if (!_.isArray(handlers[eventName])) {
                handlers[eventName] = [];
            }

            _.forEach(handler, function(eventHandler) {
                handlers[eventName].push(eventHandler);
            });
        });
    };

    EventManager.prototype.removeEventHandler = function(name, exactHandler) {
        if (_.isString(name)) {
            name = [name];
        }
        if (!_.isArray(name)) {
            throw new Exception('Event\'s name is invalid.');
        }
        _.forEach(name, function(eventName) {
            if (!_.isString(eventName)) {
                throw new Exception('Event\'s name is invalid.');
            }
        });

        if (_.isFunction(exactHandler)) {
            exactHandler = [exactHandler];
        }
        if (_.isArray(exactHandler)) {
            _.forEach(exactHandler, function(func) {
                if (!_.isFunction(func)) {
                    throw new Exception('Event\'s handler is invalid.');
                }
            });
        }
        else {
            exactHandler = null;
        }

        var handlers = this._handlers;

        _.forEach(name, function(eventName) {
            _.forEach(exactHandler, function(exactEventHandler) {
                handlers = _.filter(handlers, function(eventHandlers, handlersEventName) {
                    if (eventName !== handlersEventName) {
                        return true;
                    }

                    if (exactEventHandler === null) {
                        return false;
                    }

                    _.remove(handlers[handlersEventName], function(eventHandler) {
                        return eventHandler  === exactEventHandler;
                    });

                    return true;
                });
            });
        });
    };

    EventManager.prototype.on = function(name, handler) {
        this.addEventHandler(name, handler);
    };

    EventManager.prototype.off = function(name, handler) {
        this.removeEventHandler(name, handler);
    };

    EventManager.prototype.raiseEvent = function(name, params) {
        if (!_.isString(name)) {
            throw new Exception('Event\'s name is invalid.');
        }

        params = params || {};
        if (!_.isObject(params)) {
            throw new Exception('Event\'s parameters are invalid.');
        }

        if (!_.isArray(this._handlers[name])) {
            return true;
        }

        var result = true;

        _.forEach(this._handlers[name], function(eventHandler) {
            var result = eventHandler(name, params);
            if (!_.isBoolean(result)) {
                result = true;
            }
            return result;
        });

        return result;
    };

    return EventManager;
});