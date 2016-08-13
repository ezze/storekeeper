import _ from 'underscore';

import LevelSet from '../level-set';
import Loader from './loader';

export default class LoaderJson extends Loader {
    constructor() {
        super();
    }

    loadFromUrl(url, options) {
        options = options || {};
        options.dataType = 'json';
        return super.loadFromUrl(url, options);
    }

    parse(data) {
        if (_.isString(data)) {
            data = JSON.parse(data);
        }
        return new LevelSet(data);
    }
}