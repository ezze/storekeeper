import {
  observable,
  isObservable,
  isObservableProp,
  autorun,
  reaction,
  toJS
} from 'mobx';

const regExpIso8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

class BasicStore {
  @observable storeInitialized = false;
  @observable storeReady = false;

  constructor(options = {}) {
    const {
      key = '',
      include,
      exclude,
      storable = true,
      saveDelayMs
    } = options;

    if (!!storable && !key) {
      throw new TypeError('Key is not specified.');
    }

    this.key = key;
    this.includeStoringNames = Array.isArray(include) && include.length > 0 ? include : null;
    this.excludeStoringNames = Array.isArray(exclude) && exclude.length > 0 ? exclude : null;
    this.storable = !!storable;
    this.saveDelayMs = typeof saveDelayMs === 'number' && saveDelayMs > 0 ? saveDelayMs : null;
    this.saveTimeout = null;
    this.lastSaveTime = null;

    this.declare(options);

    (async() => {
      try {
        if (this.storable) {
          await this.load();
        }

        autorun(async() => {
          const data = this.filterObservables(toJS(this));
          if (this.storeInitialized) {
            if (this.storable) {
              await this.save(data);
            }
          }
          else {
            await this.beforeInit(options);
            console.log(`Store${this.key ? ` "${this.key}"` : ''} is initialized.`);
            console.log(data);
            this.storeInitialized = true;
            await this.init(options);
            this.storeReady = true;
          }
        });
      }
      catch (e) {
        console.error(e);
        console.error(`Unable to initialize store${this.key ? ` "${this.key}"` : ''}.`);
      }
    })();
  }

  declare(options) { // eslint-disable-line no-unused-vars
    // Do nothing here by default
  }

  async beforeInit(options) { // eslint-disable-line no-unused-vars
    // Do nothing here by default
  }

  async init(options) { // eslint-disable-line no-unused-vars
    // Do nothing here by default
  }

  async destroy() {
    // Do nothing here by default
  }

  async ready() {
    if (this.storeReady) {
      return;
    }

    return new Promise(resolve => {
      reaction(() => this.storeReady, (storeReady, reaction) => {
        if (storeReady) {
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

    const assignData = (context, data) => {
      const names = Object.keys(data);
      names.forEach((name) => {
        let value = data[name];
        if (typeof value === 'string' && regExpIso8601.test(value)) {
          value = new Date(value);
        }

        if (!isObservable(context[name]) && !isObservableProp(context, name)) {
          context[name] = value;
          return;
        }

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if (!context[name]) {
            context[name] = observable({});
          }
          assignData(context[name], value);
        }
        else if (isObservable(context[name]) && Array.isArray(value)) {
          context[name].replace(value);
        }
        else {
          context[name] = value;
        }
      });
    };

    try {
      const data = this.filterObservables(JSON.parse(dataItem));
      assignData(this, data);
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
      if (
        !['storeInitialized', 'storeReady'].includes(name) &&
        (!Array.isArray(this.includeStoringNames) || this.includeStoringNames.includes(name)) &&
        (!Array.isArray(this.excludeStoringNames) || !this.excludeStoringNames.includes(name)) &&
        (isObservable(this[name]) || isObservableProp(this, name))
      ) {
        filtered[name] = data[name];
      }
    });
    return filtered;
  }
}

export default BasicStore;
