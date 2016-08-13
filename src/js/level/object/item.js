export default class Item {
    constructor(row, column) {
        if (this.constructor === Item) {
            throw new Error('Item can\'t be initialized directly.');
        }

        this.row = row;
        this.column = column;
    }

    get row() {
        return this._row;
    }

    set row(row) {
        this._row = row;
    }

    get column() {
        return this._column;
    }

    set column(column) {
        this._column = column;
    }
}