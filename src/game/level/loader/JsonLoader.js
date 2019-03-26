import _ from 'underscore';

import LevelPack from '../LevelPack';
import Loader from './Loader';

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
    return new LevelPack(data);
  }
}
