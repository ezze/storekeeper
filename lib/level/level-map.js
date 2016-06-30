'use strict';

const validCharacters = [
    '@',    // worker
    '+',    // worker on goal
    '#',    // wall
    '.',    // goal
    '$',    // box
    '*',    // box on goal
    ' '     // space
];

export default class LevelMap {
    constructor(items) {
        this.items = items;
    }

    get rows() {
        return this._rows;
    }

    set rows(rows) {
        if (rows < this._rows) {
            this._items.splice(this.linearIndex(rows, 0), (this._rows - rows) * this._columns);
        }
        else if (rows > this._rows) {
            for (let row = rows; row < this._rows; row++) {
                for (let column = 0; column < this.columns; column++) {
                    this._items.push(' ');
                }
            }
        }
        this._rows = rows;
    }

    get columns() {
        return this._columns;
    }

    set columns(columns) {
        this._columns = columns;
    }

    get items() {
        var items = [];

        for (let row = 0; row < this.rows; row++) {
            let begin = this.linearIndex(row, 0);
            items.push(this._items.slice(begin, begin + this.columns).join('').replace(/ +$/, ''));
        }

        return items;
    }

    set items(items) {
        this._items = [];

        let size = LevelMap.detectSize(items);
        this._rows = size.rows;
        this._columns = size.columns;

        for (let row = 0; row < this.rows; row++) {
            for (let column = 0; column < this.columns; column++) {
                this._items.push(column < items[row].length ? items[row][column] : ' ');
            }
        }
    }

    linearIndex(row, column) {
        return row * this.columns + column;
    }

    insert(row, column, item) {
        if (!LevelMap.isItemValid(item)) {
            item = ' ';
        }
        this._items[this.linearIndex(row, column)] = item;
    }

    at(row, column) {
        return this._items[this.linearIndex(row, column)];
    }

    remove(row, column) {
        this._items[this.linearIndex(row, column)] = ' ';
    }

    toString() {
        return this.items.join('\n');
    }

    static detectSize(items) {
        let rows = items.length,
            columns = 0;

        items.forEach(function(row) {
            if (row.length > columns) {
                columns = row.length;
            }
        });

        return {
            rows: rows,
            columns: columns
        };
    }

    static isItemValid(character) {
        return validCharacters.indexOf(character) >= 0;
    }
}