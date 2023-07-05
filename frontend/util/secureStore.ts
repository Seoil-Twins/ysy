import * as ExpoSecureStore from "expo-secure-store";

const secureStore = {
  save: async (key: string, value: string): Promise<void> => {
    await ExpoSecureStore.setItemAsync(key, value);
  },
  get: async (key: string): Promise<string | null> => {
    let result: string | null = await ExpoSecureStore.getItemAsync(key);
    return result;
  },
  delete: async (key: string): Promise<void> => {
    await ExpoSecureStore.deleteItemAsync(key);
  }
};

export default secureStore;
