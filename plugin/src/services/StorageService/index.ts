import {
  ERROR_HAS_ITEM,
  ERROR_GET_ITEM,
  ERROR_SET_ITEM,
  ERROR_REMOVE_ITEM,
  ERROR_CLEAR,
} from "./Errors";

class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }

    return StorageService.instance;
  }

  hasItem(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], (items: { [key: string]: string }) => {
        if (chrome.runtime.lastError !== undefined) {
          console.error(chrome.runtime.lastError);
          reject(ERROR_HAS_ITEM(chrome.runtime.lastError, key));
        }

        resolve(items[key] !== undefined);
      });
    });
  }

  getItem(key: string, ifNull?: string): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], (items: { [key: string]: string }) => {
        if (chrome.runtime.lastError !== undefined) {
          console.error(chrome.runtime.lastError);
          reject(ERROR_GET_ITEM(chrome.runtime.lastError, key));
        }

        resolve(items[key] || ifNull);
      });
    });
  }

  setItem(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError !== undefined) {
          console.error(chrome.runtime.lastError);
          reject(ERROR_SET_ITEM(chrome.runtime.lastError, key, value));
        }

        resolve();
      });
    });
  }

  removeItem(key: string): Promise<String> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove([key], () => {
        if (chrome.runtime.lastError !== undefined) {
          console.error(chrome.runtime.lastError);
          reject(ERROR_REMOVE_ITEM(chrome.runtime.lastError, key));
        }

        resolve(key);
      });
    });
  }

  clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError !== undefined) {
          console.error(chrome.runtime.lastError);
          reject(ERROR_CLEAR(chrome.runtime.lastError));
        }

        resolve();
      });
    });
  }
}

const storage: StorageService = StorageService.getInstance();

export default storage;
