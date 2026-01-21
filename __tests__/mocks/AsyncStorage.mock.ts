let storage: { [key: string]: string } = {};

const AsyncStorageMock = {
  setItem: jest.fn(async (key: string, value: string) => {
    storage[key] = value;
    return Promise.resolve();
  }),

  getItem: jest.fn(async (key: string) => {
    return Promise.resolve(storage[key] || null);
  }),

  removeItem: jest.fn(async (key: string) => {
    delete storage[key];
    return Promise.resolve();
  }),

  clear: jest.fn(async () => {
    storage = {};
    return Promise.resolve();
  }),

  getAllKeys: jest.fn(async () => {
    return Promise.resolve(Object.keys(storage));
  }),

  multiGet: jest.fn(async (keys: string[]) => {
    return Promise.resolve(
      keys.map((key) => [key, storage[key] || null])
    );
  }),

  multiSet: jest.fn(async (keyValuePairs: [string, string][]) => {
    keyValuePairs.forEach(([key, value]) => {
      storage[key] = value;
    });
    return Promise.resolve();
  }),

  multiRemove: jest.fn(async (keys: string[]) => {
    keys.forEach((key) => delete storage[key]);
    return Promise.resolve();
  }),

  // Test helper to manually clear storage
  __CLEAR__: () => {
    storage = {};
  },

  // Test helper to get current storage state
  __GET_STORAGE__: () => storage,
};

export default AsyncStorageMock;
