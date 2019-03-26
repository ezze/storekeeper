import JsonLoader from './JsonLoader';
import SokLoader from './SokLoader';

const jsonLoader = new JsonLoader(),
  sokLoader = new SokLoader();

export default {
  getLoaderByFileName(name) {
    if (/\.json$/.test(name)) {
      return jsonLoader;
    }
    if (/\.sok$/.test(name)) {
      return sokLoader;
    }
    return null;
  }
};
