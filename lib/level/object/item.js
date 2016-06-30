'use strict';

export default class Item {
    constructor() {
        if (new.target === Item) {
            throw new Error('Item can\'t be initialized directly.');
        }
    }
}