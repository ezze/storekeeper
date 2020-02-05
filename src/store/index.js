import eventBus from '../game/eventBus';

import GeneralStore from './GeneralStore';

export const stores = {};

export async function createStores() {
  const generalStore = new GeneralStore({ eventBus });
  await generalStore.ready();

  Object.assign(stores, {
    generalStore
  });

  return stores;
}
