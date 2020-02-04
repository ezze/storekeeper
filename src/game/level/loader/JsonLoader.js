import Loader from './Loader';

export default class LoaderJson extends Loader {
  async loadFromUrl(url, options = {}) {
    const response = await super.loadFromUrl(url, options);
    if (response.headers.get('Content-Type').indexOf('application/json') !== 0) {
      return Promise.reject(`Response from "${url}" is not of JSON content type.`);
    }
    return response.json();
  }
}
