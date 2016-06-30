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
        this.items = items || [];
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
        if (columns < this._columns) {
            for (let row = 0; row < this._rows; row++) {
                this._items.splice((row + 1) * columns, this._columns - columns);
            }
        }
        else if (columns > this._columns) {
            for (let row = 0; row < this._rows; row++) {
                for (let column = this._columns; column < columns; column++) {
                    this._items.splice(row * columns + column, 0, ' ');
                }
            }
        }
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

    normalize() {
        let items = this.items,
            row = 0, line;

        while (row < items.length) {
            line = items[row].trim();
            if (line === '') {
                items.splice(row, 1);
            }
            else {
                items[row] = line;
                row++;
            }
        }

        this.items = items;
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
        return {
            rows: items.length,
            columns: items.length === 0 ? 0 : Math.max.apply(null, items.map((row) => {
                return row.length;
            }))
        };
    }

    static isItemValid(character) {
        return validCharacters.indexOf(character) >= 0;
    }
}