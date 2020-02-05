export default class Item {
  constructor(row, column) {
    if (new.target === Item) {
      throw new Error('Item can\'t be initialized directly.');
    }
    this.row = row;
    this.column = column;
  }
}
