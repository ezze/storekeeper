/**
 * @module History
 */
define([
    'lodash',
    './exception',
    './event-manager'
], function(
    _,
    Exception,
    EventManager
) {
    'use strict';

    var eventManager = EventManager.instance;

    var instance = {
        /**
         * Stores the history of moves done by user
         * This storage behaves like a [LIFO stack] {@link https://en.wikipedia.org/wiki/Stack_(abstract_data_type)}
         * @type {[]} _history
         * @private
         */
        _history: [],
        /**
         * Stores current history entry
         * @type {Object} current
         * @private
         */
        _state: {},
        /**
         * Stores the index of current entry
         * @type {Number}
         * @private
         */
        _index: 0,
        /**
         * Stores history length
         * @type {Number}
         * @private
         */
        _length: 0,

        /**
         * Shows whether history is in traverse mode
         * @type {Boolean}
         * @private
         */
        _traversed: false,

        /**
         * Name of an event raised when new entry is pushed to history
         * @type {String}
         * @static
         */
        EVENT_PUSH: 'history:pushed',
        /**
         * Name of an event raised when new entry is replaced in history
         * @type {String}
         * @static
         */
        EVENT_REPLACE: 'history:replaced',

        /**
         * Name of an event raised when entry is popped from the history
         * @type {String}
         * @static
         */
        EVENT_POP: 'history:popped',

        /**
         * Name of an event raised when navigate history
         * @type {String}
         * @static
         */
        EVENT_CHANGED: 'history:changed',

        /**
         * Name of an event raised when history has been cleared
         * @type {String}
         * @static
         */
        EVENT_CLEAR: 'history:clear',

        /**
         * Sets initial history entry
         * This method called when initializing history at the beginning of each level
         * @param eventName
         * @param params
         */
        setInitial: function(eventName, params) {
            if (!_.isString(eventName)) {
                throw new Exception('Event\'s name is invalid.');
            }
            if(!_.isObject(params) || _.isEmpty(params)) {
                throw new Exception('Event\'s data is incorrect');
            }
            // clear first
            this.clear();
            var entry = {
                timestamp: _.now(),
                eventName: eventName,
                object: _.cloneDeep(params.object),
                moves: 0,
                pushes: 0,
                boxesCount: params.object._level._boxes.length,
                goals: params.object._level._goals.length,
                boxesOnGoal: params.object._level._boxesOnGoalCount,
                levelNumber: params.index + 1
            };
            this._state = entry;
            this._index = 0;
            this._length = this._history.unshift(entry);
        },

        /**
         * Pushes new entry into history when something has been changed in level state
         * This method called when worker has moved
         * @param {String} eventName Name of event (in context of application events)
         * @param {Object} params Event parameters
         * @see {module: EventManager}
         */
        pushState: function(eventName, params) {
            if (!_.isString(eventName)) {
                throw new Exception('Event\'s name is invalid.');
            }
            if(!_.isObject(params) || _.isEmpty(params)) {
                throw new Exception('Event\'s data is incorrect');
            }
            var entry = {
                timestamp: _.now(),
                eventName: eventName,
                object: _.cloneDeep(params.object),
                moves: params.object._movesCount,
                pushes: this._state.pushes,
                goals: this._state.goals,
                boxesCount: this._state.boxesCount,
                boxesOnGoalCount: params.object._level._boxesOnGoalCount,
                levelNumber: this._state.levelNumber
            };
            this._index = 0;
            this._state = entry;
            this._length = this._history.unshift(entry);

            eventManager.raiseEvent(this.EVENT_PUSH, {entry: entry, edges: this.hasEdges()});
        },
        /**
         * Replaces current state
         * This method called when movable object has been moved by worker
         * @param {String} eventName Name of event (in context of application events)
         * @param {Object} params Event parameters
         * @see {module: EventManager}
         */
        replaceState: function(eventName, params) {
            if (!_.isString(eventName)) {
                throw new Exception('Event\'s name is invalid.');
            }
            if(!_.isObject(params) || _.isEmpty(params)) {
                throw new Exception('Event\'s data is incorrect');
            }
            if(params.object.name !== 'Box') {
                throw new Exception('Bad argument type! Must be box');
            }
            var entry = {
                timestamp: _.now(),
                eventName: eventName,
                object: _.cloneDeep(params.object),
                moves: this._state.moves,
                pushes: this._state.pushes + 1,
                goals: this._state.goals,
                boxesCount: this._state.boxesCount,
                boxesOnGoalCount: params.object._level._boxesOnGoalCount,
                levelNumber: this._state.levelNumber
            };
            this._index = 0;
            this._state = entry;
            this._history[0] = entry;
            eventManager.raiseEvent(this.EVENT_REPLACE, {entry: entry, edges: this.hasEdges()});
        },
        /**
         * Pops last entry from the history and raises event
         * @see {module: EventManager}
         */
        popState: function () {
            if(!this._state || this._length === 0) {
                throw new Exception('History is empty. Can\'t pop from empty history!');
            }
            var popped = this._history.shift();
            this._state = this._history[0];
            this._index = 0;
            this._length--;
            eventManager.raiseEvent(this.EVENT_POP, {entry: popped});
        },
        /**
         * Traversing forward in history and raises an event
         */
        forward: function() {
            if(this._index !== 0) {
                this._state = this._history[--this._index];
                eventManager.raiseEvent(this.EVENT_CHANGED, _.merge(this._state, {
                        edges: this.hasEdges()
                    }
                ));
            }
        },
        /**
         * Traversing back in history and raises an event
         */
        back: function() {
            if(this._index !== this._length - 1) {
                this._state = this._history[++this._index];
                eventManager.raiseEvent(this.EVENT_CHANGED, _.merge(this._state, {
                        edges: this.hasEdges()
                    }
                ));
            }
        },
        /**
         * Clears history and raises an event
         */
        clear: function() {
            this._history = [];
            this._state = {};
            this._length = 0;
            this._index = 0;
            eventManager.raiseEvent(this.EVENT_CLEAR, {instance: instance});
        },

        /**
         * Checks if we are on the history edges
         */
        hasEdges: function() {
           return (this._index === this._length - 1) ? 'back' : (this._index === 0 ) ? 'forward' : '';
        },
        /**
         * Rebuilds history based on the current state
         * This method called when player has performed a move right after he has travelled through the history
         * The current history state becomes the last one, all entries newer than this entry deleted
         */
        rebuild: function() {
            this._traversed = false;
            return this._history.splice(0, this._index);
        }
    };

    /**
     * History manager singleton is purposed for storing the game state
     *
     * @author Ivan Lobanov <arkhemlol@gmail.com>
     * @since 0.1.0
     * @alias module:History
     */
    var History = {};

    Object.defineProperties(History, {
        /**
         * Gets history instance.
         *
         * @type module:History
         * @memberof module:History
         */
        instance: {
            get: function() {
                return instance;
            }
        },
        /**
         * Retrieves stored history
         * @type module:History
         * @memberof module:History
         */
        history: {
            get: function() {
                return instance._history;
            }
        },
        /**
         * Retrieves current history state
         * @type module:History
         * @memberof module:History
         */
        state: {
            get: function() {
                return instance._state;
            }
        },
        /**
         * Retrieves history length
         * @type module:History
         * @memberof module:History
         */
        length: {
            get: function() {
                return instance._length;
            }
        },
        /**
         * Gets or sets history traverse mode
         * @type module:History
         * @memberof module:History
         */
        traversed: {
            get: function() {
                return instance._traversed;
            },
            set: function(traversed) {
                if(!_.isBoolean(traversed)) {
                    throw new Exception('This parameter expected to be boolean! Instead got: ' + typeof traversed);
                }
                instance._traversed = traversed;
            }
        }
    });

    return History;
});