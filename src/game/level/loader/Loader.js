import LevelPack from '../LevelPack';

export default class Loader {
  constructor(options = {}) {
    if (new.target === Loader) {
      throw new Error('Loader must be implemented.');
    }
    const { eventBus = null } = options;
    this.eventBus = eventBus;
  }

  async load(source, options) {
    let parsedSource;
    if (source instanceof File) {
      parsedSource = await this.loadFromFile(source, options);
    }
    else {
      parsedSource = await this.loadFromUrl(source, options);
    }
    return this.createLevelPack(parsedSource);
  }

  async loadFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = event => resolve(event.target.result);
      reader.onerror = () => {
        reader.abort();
        reject('Unexpected loading error has occurred.');
      };
      const blob = file.slice(0, file.size);
      reader.readAsBinaryString(blob);
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
      eventBus: this.eventBus
    });
  }
}
