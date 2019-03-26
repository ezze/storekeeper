import {
  observable,
  isObservableProp,
  autorun,
  reaction,
  set,
  toJS
} from 'mobx';

const regExpIso8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

class BasicStore {
  @observable initialized = false;

  constructor(options = {}) {
    const {
      key = '',
      exclude = [],
      storable = true,
      saveDelayMs
    } = options;

    if (!!storable && !key) {
      throw new TypeError('Key is not specified.');
    }

    if (!Array.isArray(exclude)) {
      throw new TypeError('Exclusion list should be an array.');
    }

    this.key = key;
    this.exclude = exclude;
    this.storable = !!storable;
    this.saveDelayMs = typeof saveDelayMs === 'number' && saveDelayMs > 0 ? saveDelayMs : null;
    this.saveTimeout = null;
    this.lastSaveTime = null;

    (async() => {
      try {
        if (this.storable) {
          await this.load();
        }

        autorun(async() => {
          const data = this.filterObservables(toJS(this));
          if (this.initialized) {
            if (this.storable) {
              await this.save(data);
            }
          }
          else {
            await this.init(options);
            console.log(`Store${this.key ? ` "${this.key}"` : ''} is initialized.`);
            console.log(data);
            this.initialized = true;
          }
        });
      }
      catch (e) {
        console.error(e);
        console.error(`Unable to initialize store${this.kery ? ` "${this.key}"` : ''}.`);
      }
    })();
  }

  async init(options) { // eslint-disable-line no-unused-vars
    // Do nothing here by default
  }

  async destroy() {
    // Do nothing here by default
  }

  async ready() {
    if (this.initialized) {
      return;
    }

    return new Promise(resolve => {
      reaction(() => this.initialized, (initialized, reaction) => {
        if (initialized) {
          reaction.dispose();
          resolve();
        }
      });
    });
  }

  async load() {
    const dataItem = localStorage.getItem(this.key);
    if (dataItem === null) {
      return;
    }

    try {
      const data = this.filterObservables(JSON.parse(dataItem));
      const names = Object.keys(data);
      names.forEach((name) => {
        let value = data[name];
        if (typeof value === 'string' && regExpIso8601.test(value)) {
          value = new Date(value);
        }
        set(this, name, value);
      });
    }
    catch (e) {
      console.error(e);
    }
  }

  async save(data) {
    if (this.saveTimeout !== null) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }

    if (this.saveDelayMs !== null && this.lastSaveTime !== null) {
      if (new Date().getTime() - this.lastSaveTime.getTime() < this.saveDelayMs) {
        // Postpone saving
        this.saveTimeout = setTimeout(() => this.save(data), this.saveDelayMs);
        return;
      }
    }

    try {
      localStorage.setItem(this.key, JSON.stringify(data));
      this.lastSaveTime = new Date();
    }
    catch (e) {
      console.error(e);
    }
  }

  filterObservables(data) {
    const filtered = {};
    const names = Object.keys(data);
    names.forEach((name) => {
      if (name !== 'initialized' && !this.exclude.includes(name) && isObservableProp(this, name)) {
        filtered[name] = data[name];
      }
    });
    return filtered;
  }
}

export default BasicStore;
