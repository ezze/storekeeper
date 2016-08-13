import JsonLoader from './json-loader';
import SokLoader from './sok-loader';

let jsonLoader = new JsonLoader(),
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