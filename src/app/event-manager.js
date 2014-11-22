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
     * Event manager is purposed for registering handling functions for custom events and their
     * sequential execution when these events are raised.
     *
     * @author Dmitriy Pushkov <ezze@ezze.org>
     * @since 0.1.0
     * @alias module:EventManager
     * @class
     */
    var EventManager = function() {
        this._handlers = {};
    };

    /**
     * Adds handling functions to given events.
     *
     * @param {String|Array} name
     * Name of a single event or names of few events handling functions should be registered for.
     *
     * @param {Function|Array} handler
     * Single function or few functions that should be registered as handling function for given events.
     *
     * @returns {EventManager}
     *
     * @see module:EventManager#removeEventHandler
     * @see module:EventManager#on
     * @see module:EventManager#off
     * @see module:EventManager#raiseEvent
     */
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

        return this;
    };

    /**
     * Removes handling functions from given events.
     *
     * @param {String|Array} name
     * Name of a single event or names of few events handling functions should be unregistered for.
     *
     * @param {Function|Array} exactHandler
     * Single function or few functions that should be unregistered for given events.
     *
     * @returns {EventManager}
     *
     * @see module:EventManager#addEventHandler
     * @see module:EventManager#on
     * @see module:EventManager#off
     */
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

        return this;
    };

    /**
     * Does the same as {@link module:EventManager#addEventHandler}.
     *
     * @param {String|Array} name
     * @param {Function|Array} handler
     *
     * @returns {EventManager}
     *
     * @see module:EventManager#off
     * @see module:EventManager#addEventHandler
     * @see module:EventManager#removeEventHandler
     * @see module:EventManager#raiseEvent
     */
    EventManager.prototype.on = function(name, handler) {
        return this.addEventHandler(name, handler);
    };

    /**
     * Does the same as {@link module:EventManager#removeEventHandler}.
     *
     * @param {String|Array} name
     * @param {Function|Array} exactHandler
     *
     * @returns {EventManager}
     *
     * @see module:EventManager#on
     * @see module:EventManager#addEventHandler
     * @see module:EventManager#removeEventHandler
     */
    EventManager.prototype.off = function(name, exactHandler) {
        return this.removeEventHandler(name, exactHandler);
    };

    /**
     * Raises an event with a given name and parameters.
     *
     * <p>Raising the event will cause sequential execution of all handling functions
     * registered for the event by {@link module:EventManager#addEventHandler} method.
     *
     * <p>Each handling function will receive <code>name</code> and <code>params</code>
     * as arguments. If handling function returns <code>false</code> then all
     * remaining handling functions will be prevented from being executed.</p>
     *
     * @param {String} name
     * Name of the event.
     *
     * @param {Object} params
     * Object of parameters that will be passed to each handling function registered for the event.
     *
     * @returns {Boolean}
     * <code>false</code> if sequential handling functions' calls were interrupted by returning
     * <code>false</code> from one of these functions, otherwise <code>true</code>.
     */
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