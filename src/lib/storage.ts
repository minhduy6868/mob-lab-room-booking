import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const webStore = () => {
  if (typeof localStorage === 'undefined') {
    return {
      getItem: () => null as string | null,
      setItem: () => undefined,
      removeItem: () => undefined,
    };
  }
  return localStorage;
};

export const appStorage = {
  getItem: async (name: string) => {
    if (Platform.OS === 'web') {
      return webStore().getItem(name);
    }
    return SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string) => {
    if (Platform.OS === 'web') {
      webStore().setItem(name, value);
      return;
    }
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string) => {
    if (Platform.OS === 'web') {
      webStore().removeItem(name);
      return;
    }
    await SecureStore.deleteItemAsync(name);
  },
};
