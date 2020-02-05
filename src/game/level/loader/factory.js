import eventBus from '../../eventBus';

import JsonLoader from './JsonLoader';
import SokLoader from './SokLoader';

const jsonLoader = new JsonLoader({
  eventBus
});

const sokLoader = new SokLoader({
  eventBus
});

export function getLoaderByFileName(name) {
  if (/\.json$/.test(name)) {
    return jsonLoader;
  }
  if (/\.sok$/.test(name)) {
    return sokLoader;
  }
  return null;
}
