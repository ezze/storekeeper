import { observable } from 'mobx';

import BasicStore from './BasicStore';

class GeneralStore extends BasicStore {
  @observable language = null;

  constructor(options) {
    super({ ...options, key: 'general' });
  }
}

export default GeneralStore;
