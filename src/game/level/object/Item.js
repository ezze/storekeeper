export default class Item {
  #row;
  #column;

  constructor(row, column) {
    if (new.target === Item) {
      throw new Error('Item can\'t be initialized directly.');
    }
    this.#row = row;
    this.#column = column;
  }

  get row() {
    return this.#row;
  }

  set row(row) {
    this.#row = row;
  }

  get column() {
    return this.#column;
  }

  set column(column) {
    this.#column = column;
  }
}
