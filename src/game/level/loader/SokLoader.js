import _ from 'underscore';

import LevelPack from '../LevelPack';
import Loader from './Loader';

const commentRegExp = /^::/,
  rowRegExp = /^[@+#.$* ]+$/;

export default class LoaderSok extends Loader {
  constructor() {
    super();
  }

  loadFromUrl(url, options) {
    options = options || {};
    options.dataType = 'text';
    return super.loadFromUrl(url, options);
  }

  parse(data) {
    const lines = data.split('\n');

    data = {
      levels: []
    };

    // TODO: implement reading metadata (titles, descriptions, etc.)

    let level = null;
    _.each(lines, (line, i) => {
      line = line.replace(/\r$/, '');

      if (commentRegExp.test(line)) {
        return;
      }

      if (rowRegExp.test(line)) {
        if (level === null) {
          level = {
            name: '',
            description: '',
            items: []
          };
        }
        level.items.push(line);
      }
      else {
        if (level !== null) {
          data.levels.push(level);
        }
        level = null;
      }
    });

    return new LevelPack(data);
  }
}
