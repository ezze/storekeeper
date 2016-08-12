'use strict';

export default class Loader {
    constructor() {
        if (new.target === Loader) {
            throw new Error('Loader must be implemented.');
        }
    }
}