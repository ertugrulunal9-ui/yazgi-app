let secureStorage: Record<string, string> = {};

export const getItemAsync = jest.fn(async (key: string) => secureStorage[key] ?? null);
export const setItemAsync = jest.fn(async (key: string, value: string) => {
  secureStorage[key] = value;
});
export const deleteItemAsync = jest.fn(async (key: string) => {
  delete secureStorage[key];
});

const SecureStoreMock = {
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
  __CLEAR__: () => {
    secureStorage = {};
  },
};

export default SecureStoreMock;
