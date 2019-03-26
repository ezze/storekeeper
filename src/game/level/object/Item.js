export default class Item {
  constructor(row, column) {
    if (this.constructor === Item) {
      throw new Error('Item can\'t be initialized directly.');
    }
    this.row = row;
    this.column = column;
  }
}
