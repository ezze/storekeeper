define([
    'easel',
    'jquery',
    'lodash',
    './object/box',
    './object/goal',
    './object/wall',
    './object/worker',
    '../event-manager',
    '../exception'
], function(
    Easel,
    $,
    _,
    Box,
    Goal,
    Wall,
    Worker,
    EventManager,
    Exception
) {
    'use strict';

    var Level = function(options) {
        // TODO: think of creating canvas here
        this._stage = new Easel.Stage($('canvas').get(0));

        this._name = '';
        this._description = '';
        this._items = [];

        this._rows = 0;
        this._columns = 0;

        this.__isValidated = false;

        this._worker = null;
        this._walls = [];
        this._goals = [];
        this._boxes = [];

        this._eventManager = options.eventManager instanceof EventManager ? options.eventManager : null;

        if (_.isString(options.name) && !_.isEmpty(options.name)) {
            this.name = options.name;
        }

        if (_.isString(options.description) && !_.isEmpty(options.description)) {
            this.description = options.description;
        }

        if ($.isArray(options.items)) {
            this._items = options.items;
            this.reset();
        }
    };

    Level.prototype.reset = function() {
        this._worker = null;
        this._walls = [];
        this._goals = [];
        this._boxes = [];

        for (var row = 0; row < this._items.length; row += 1) {
            for (var column = 0; column < this._items[row].length; column += 1) {
                this.createObject(this._items[row][column], row, column);
            }
        }
        if (this._boxes.length !== this._goals.length || !this._worker) {
            throw new Exception('Incorrect ' + this._name + ' level');
        }
        this._isValidated = true;
        this.start();
    };

    Level.prototype.clone = function() {
        return new Level({
            eventManager: this.eventManager,
            name: this.name,
            description: this.description,
            items: this._items
        });
    };

    Level.prototype.createObject = function(character, row, column) {
        var options = {
            level: this,
            row: row,
            column: column
        };

        switch (character) {
            case '@':
                this.addObject(new Worker(options));
                break;
            case '+':
                this.addObject(new Goal(options));
                this.addObject(new Worker(options));
                break;
            case '#':
                this.addObject(new Wall(options));
                break;
            case '.':
                this.addObject(new Goal(options));
                break;
            case '$':
                this.addObject(new Box(options));
                break;
            case '*':
                this.addObject(new Goal(options));
                this.addObject(new Box(options));
                break;
        }
    };

    Level.prototype.addObject = function(object) {
        var row = object.row;
        if (row + 1 > this._rows) {
            this._rows = row + 1;
        }

        var column = object.column;
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
    };

    Level.prototype.getObjects = function(row, column) {
        var objects = [];

        if (this._worker.row === row && this._worker.column === column) {
            objects.push(this._worker);
        }

        _.forEach([
            this._walls,
            this._goals,
            this._boxes
        ], function(objectsStack) {
            _.forEach(objectsStack, function(object) {
                if (object.row === row && object.column === column) {
                    objects.push(object);
                    return false;
                }
                return true;
            });
        });

        return objects;
    };

    Level.prototype.start = function() {
        if (this._isValidated) {
            this.addObjectsToStage();
        }
        this.update();
    };

    Level.prototype.stop = function() {
        this.removeObjectsFromStage();
        this.update();
    };

    Level.prototype.update = function() {
        this._stage.update();
    };

    Level.prototype.addObjectsToStage = function() {
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
    };

    Level.prototype.addObjectToStage = function(object) {
        var sprite = object.sprite;
        if (this._stage.contains(sprite)) {
            // TODO: throw an exception
            return;
        }
        this._stage.addChild(sprite);
    };

    Level.prototype.removeObjectsFromStage = function() {
        this._stage.removeAllChildren();
    };

    Object.defineProperties(Level.prototype, {
        eventManager: {
            get: function() {
                return this._eventManager;
            }
        },
        name: {
            get: function() {
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