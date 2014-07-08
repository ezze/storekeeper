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
            // TODO: create a separate stage for level rendering right here
            this._storekeeper = storekeeper;

            this._name = '';
            this._description = '';
            this._items = [];

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

            // TODO: validate level
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
            var stage = this._storekeeper.getStage();
            var sprite = object.getSprite();
            if (stage.contains(sprite))
                return;
            stage.addChild(sprite);
        },

        removeObjectsFromStage: function() {
            var stage = this._storekeeper.getStage();
            stage.removeAllChildren();
        }
    });
    return Level;
});