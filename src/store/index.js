import eventBus from '../eventBus';

import GameStore from './GameStore';

export const stores = {};

export async function createStores() {
  const gameStore = new GameStore({ eventBus });
  await gameStore.ready();

  Object.assign(stores, {
    gameStore
  });

  return stores;
}
