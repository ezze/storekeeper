define([
    'easel',
    'jquery',
    'lodash',
    './object/box',
    './object/goal',
    './object/wall',
    './object/worker',
    '../exception'
], function(
    Easel,
    $,
    _,
    Box,
    Goal,
    Wall,
    Worker,
    Exception
) {
    'use strict';

    var Level = function(data) {
        // TODO: think of creating canvas here
        this._stage = new Easel.Stage($('canvas').get(0));

        this._name = '';
        this._description = '';
        this._items = [];
        this.__isValidated = false;
        this._rows = 0;
        this._columns = 0;

        this._worker = undefined;
        this._walls = [];
        this._goals = [];
        this._boxes = [];

        if (_.isString(data.name) && !_.isEmpty(data.name)) {
            this.name = data.name;
        }

        if (_.isString(data.description) && !_.isEmpty(data.description)) {
            this.description = data.description;
        }

        if ($.isArray(data.items)) {
            this._items = data.items;
            this.reset();
        }
    };

    Level.prototype = {
        reset: function () {
            this._worker = undefined;
            this._walls = [];
            this._goals = [];
            this._boxes = [];
            for (var row = 0; row < this._items.length; row++) {
                for (var column = 0; column < this._items[row].length; column++) {
                    this.addObjectFromCharacter(this._items[row][column], row, column);
                }
            }
            if (this._boxes.length !== this._goals.length || !this._worker) {
                throw new Exception('Incorrect ' + this._name + ' level');
            }
            this._isValidated = true;
            this.start();
        },

        clone: function () {
            var data = {
                name: this.name,
                description: this.description,
                items: this._items
            };
            return new Level(data);
        },

        addObjectFromCharacter: function (character, row, column) {
            switch (character) {
                case '@':
                    this.addObject(new Worker(this, row, column));
                    break;
                case '+':
                    this.addObject(new Goal(this, row, column));
                    this.addObject(new Worker(this, row, column));
                    break;
                case '#':
                    this.addObject(new Wall(this, row, column));
                    break;
                case '.':
                    this.addObject(new Goal(this, row, column));
                    break;
                case '$':
                    this.addObject(new Box(this, row, column));
                    break;
                case '*':
                    this.addObject(new Goal(this, row, column));
                    this.addObject(new Box(this, row, column));
                    break;
            }
        },

        addObject: function (object) {
            var row = object.getRow();
            if (row + 1 > this._rows) {
                this._rows = row + 1;
            }

            var column = object.getColumn();
            if (column + 1 > this._columns) {
                this._columns = column + 1;
            }

            // TODO: check whether we can insert object on this position

            if (object instanceof Worker) {
                this._worker = object;
            }
            else if (object instanceof Wall) {
                this._walls.push(object);
            }
            else if (object instanceof Goal) {
                this._goals.push(object);
            }
            else if (object instanceof Box) {
                this._boxes.push(object);
            }
        },

        start: function () {
            if (this._isValidated) {
                this.addObjectsToStage();
            }
            this.update();
        },

        stop: function () {
            this.removeObjectsFromStage();
            this.update();
        },

        update: function () {
            if (!this._stage) {
                // TODO: throw an exception
                return;
            }
            this._stage.update();
        },

        addObjectsToStage: function () {
            var i;
            for (i = 0; i < this._walls.length; i++) {
                this.addObjectToStage(this._walls[i]);
            }
            for (i = 0; i < this._goals.length; i++) {
                this.addObjectToStage(this._goals[i]);
            }
            for (i = 0; i < this._boxes.length; i++) {
                this.addObjectToStage(this._boxes[i]);
            }
            this.addObjectToStage(this._worker);
        },

        addObjectToStage: function (object) {
            var sprite = object.getSprite();
            if (this._stage.contains(sprite)) {
                // TODO: throw an exception
                return;
            }
            this._stage.addChild(sprite);
        },

        removeObjectsFromStage: function () {
            this._stage.removeAllChildren();
        }
    };

    Object.defineProperties(Level.prototype, {
        name: {
            get: function () {
                return this._name;
            },
            set: function(name) {
                this._name = name;
            }
        },
        description: {
            get: function() {
                return this._description;
            },
            set: function(description) {
                this._description = description;
            }
        },
        size: {
            get: function() {
                return {
                    rows: this.rows,
                    columns: this.columns
                };
            }
        },
        rows: {
            get: function() {
                return this._rows;
            }
        },
        columns: {
            get: function() {
                return this._columns;
            }
        },
        stage: {
            get: function() {
                return this._stage;
            }
        },
        worker: {
            get: function() {
                return this._worker;
            }
        },
        boxes: {
            get: function() {
                return this._boxes;
            }
        },
        walls: {
            get: function() {
                return this._walls;
            }
        },
        goals: {
            get: function() {
                return this._goals;
            }
        }
    });

    return Level;
});