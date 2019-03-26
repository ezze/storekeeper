import GeneralStore from './GeneralStore';

export async function createStore() {
  return {
    generalStore: new GeneralStore()
  };
}
