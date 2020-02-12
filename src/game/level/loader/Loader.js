import LevelPack from '../LevelPack';

export default class Loader {
  constructor(options = {}) {
    if (new.target === Loader) {
      throw new Error('Loader must be implemented.');
    }
    const { eventBus = null } = options;
    this._eventBus = eventBus;
  }

  async load(source, options) {
    let fileName;
    let parsedSource;
    if (source instanceof File) {
      fileName = source.name;
      parsedSource = await this.loadFromFile(source, options);
    }
    else {
      fileName = source;
      parsedSource = await this.loadFromUrl(source, options);
    }
    fileName = fileName.split('/').pop();
    return this.createLevelPack({ fileName, ...parsedSource });
  }

  async loadFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = event => resolve(event.target.result);
      reader.onerror = () => {
        reader.abort();
        reject('Unexpected loading error has occurred.');
      };
      reader.readAsBinaryString(file.slice(0, file.size));
    });
  }

  async loadFromUrl(url, options) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        return Promise.reject(`Unable to load levels from "${url}".`);
      }
      return response;
    }
    catch (e) {
      return Promise.reject('Unexpected loading error has occurred.');
    }
  }

  createLevelPack(source) { // eslint-disable-line no-unused-vars
    return new LevelPack(source, {
      eventBus: this._eventBus
    });
  }
}
