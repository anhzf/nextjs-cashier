const store = new Map<string, any>();

export const createCache = <T>(key: string, setter: () => T) => ({
  get: (): T => {
    if (!store.has(key)) {
      store.set(key, setter());
    }

    return store.get(key);
  },
  set: (value: T) => store.set(key, value),
  clear: () => store.delete(key),
});