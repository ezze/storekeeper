define([
    'jquery',
    'ring',
    '../exception',
    './object/worker',
    './object/wall',
    './object/box',
    './object/goal'
], function(
    $,
    Ring,
    Exception,
    Worker,
    Wall,
    Box,
    Goal
) {
    "use strict";

    var Level = Ring.create({
        constructor: function(storekeeper, data) {
            this._storekeeper = storekeeper;
            this._stage = new Easel.Stage(jqCanvas.get(0));
            this._name = '';
            this._description = '';
            this._items = [];
            this._isValidated = false;
            this._rows = 0;
            this._columns = 0;

            this._worker = undefined;
            this._walls = [];
            this._goals = [];
            this._boxes = [];

            if (typeof data.name === 'string')
                this.setName(data.name);
            if (typeof data.description === 'string')
                this.setDescription(data.description);
            if ($.isArray(data.items)) {
                this._items = data.items;
                this.reset();
            }
        },

        reset: function() {
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
        },
        
        render: function() {
            if (this._isValidated) {
                this.addObjectsToStage();
            }

        },

        clone: function() {
            var data = {
                name: this._name,
                description: this._description,
                items: this._items
            }
            return new Level(this._storekeeper, data);
        },

        getName: function() {
            return this._name;
        },

        setName: function(name) {
            this._name = name;
        },

        getDescription: function() {
            return this._description;
        },

        setDescription: function(description) {
            this._description = description;
        },

        getRowsCount: function() {
            return this._rows;
        },

        getColumnsCount: function() {
            return this._columns;
        },

        getStage: function() {
            return this._stage;
        },

        getSize: function() {
            return {
                rows: this.getRowsCount(),
                columns: this.getColumnsCount()
            }
        },

        addObjectFromCharacter: function(character, row, column) {
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

        addObject: function(object) {
            var row = object.getRow();
            if (row + 1 > this._rows)
                this._rows = row + 1;
            var column = object.getColumn();
            if (column + 1 > this._columns)
                this._columns = column + 1;

            // TODO: check whether we can insert object on this position

            if (Ring.instance(object, Worker))
                this._worker = object;
            else if (Ring.instance(object, Wall))
                this._walls.push(object);
            else if (Ring.instance(object, Goal))
                this._goals.push(object);
            else if (Ring.instance(object, Box))
                this._boxes.push(object);
        },

        start: function() {
            this.addObjectsToStage();
        },

        stop: function() {
            this.removeObjectsFromStage();
        },

        update: function() {
            if (!this._stage) return;
            this._stage.update();
        }

        addObjectsToStage: function() {
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

        addObjectToStage: function(object) {
            var sprite = object.getSprite();
            if (this._stage.contains(sprite))
                return;
            this._stage.addChild(sprite);
        },

        removeObjectsFromStage: function() {
            this._stage.removeAllChildren();
        },
        
        getWorker: function() {
            return this._worker;
        }
    });
    return Level;
});