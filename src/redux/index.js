import { createStore, combineReducers, applyMiddleware } from "redux";
import { alias, wrapStore } from "webext-redux";
import thunk from "redux-thunk";

import watcher from "@redux/middleware/watcher";

import StorageService from "@services/storage";

import aliases from "@background/aliases";

import {
  reducer as appReducer,
  restore as appRestore,
  store as appStore,
} from "@redux/app";
import {
  reducer as dataReducer,
  restore as dataRestore,
  store as dataStore,
} from "@redux/data";
import {
  reducer as kiltReducer,
  restore as kiltRestore,
  store as kiltStore,
} from "@redux/kilt";
import {
  reducer as requestsReducer,
  restore as requestsRestore,
  store as requestsStore,
} from "@redux/requests";

class Store {
  constructor() {
    this.name = "redux-state";

    this.instance = undefined;
    this.storeInternal = undefined;
  }

  get store() {
    return this.storeInternal;
  }

  static getInstance() {
    if (this.instance === undefined) {
      this.instance = new Store();
    }

    return this.instance;
  }

  async init() {
    const persistedState = await this.deserializeAndRestore();

    this.storeInternal = createStore(
      Store.getCombinedReducers(),
      persistedState,
      Store.getMiddleware(),
    );

    this.storeInternal.subscribe(() =>
      this.serializeAndStore(this.storeInternal.getState()),
    );

    wrapStore(this.storeInternal);

    return this.storeInternal;
  }

  static getCombinedReducers() {
    return combineReducers({
      app: appReducer,
      data: dataReducer,
      kilt: kiltReducer,
      requests: requestsReducer,
    });
  }

  static getMiddleware() {
    return applyMiddleware(watcher, alias(aliases), thunk);
  }

  async deserializeAndRestore() {
    const persistedState = await StorageService.getItem(this.name, "{}");

    return await Store.deserialize(persistedState);
  }

  async serializeAndStore(state) {
    const serializedState = await Store.serialize(state);

    await StorageService.setItem(this.name, serializedState);
  }

  static async deserialize(state) {
    const deserializedState = JSON.parse(state);

    return {
      app: await appRestore(deserializedState.app),
      data: await dataRestore(deserializedState.data),
      kilt: await kiltRestore(deserializedState.kilt),
      requests: await requestsRestore(deserializedState.requests),
    };
  }

  static async serialize(state) {
    return JSON.stringify({
      app: await appStore(state.app),
      data: await dataStore(state.data),
      kilt: await kiltStore(state.kilt),
      requests: await requestsStore(state.requests),
    });
  }
}

const store = Store.getInstance();

export default store;
