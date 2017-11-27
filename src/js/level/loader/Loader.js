import _ from 'underscore';
import $ from 'jquery';

export default class Loader {
    constructor() {
        if (this.constructor === Loader) {
            throw new Error('Loader must be implemented.');
        }
    }

    load(source, options) {
        if (source instanceof File) {
            return this.loadFromFile(source, options);
        }
        else {
            return this.loadFromUrl(source, options);
        }
    }

    loadFromFile(file) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();

            reader.onload = (event) => {
                resolve({
                    source: file,
                    data: event.target.result
                });
            };

            reader.onerror = (event) => {
                reject({
                    source: file
                });
            };

            let blob = file.slice(0, file.size);
            reader.readAsBinaryString(blob);
        });
    }

    loadFromUrl(url, options) {
        options = options || {};
        return new Promise((resolve, reject) => {
            options = _.extend({}, {
                url: url
            }, options);

            let deferred = $.ajax(options);
            deferred.done((data) => {
                resolve({
                    source: url,
                    data: data
                });
            });
            deferred.fail(() => {
                reject({
                    source: url
                });
            });
        });
    }

    parse(data) {
        throw new Error('Method "parse" is not implemented.');
    }
}