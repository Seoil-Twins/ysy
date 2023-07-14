import Keychain from 'react-native-keychain';
import { SECURE_KEY } from '@env';

type KeyType = 'accessToken' | 'refreshToken';
type SetSecureValue = (key: KeyType, value: string) => Promise<void>;
type GetSecureValue = (key: KeyType) => Promise<string | false>;
type RemoveSecureValue = (key: KeyType) => Promise<void>;

export const setSecureValue: SetSecureValue = async (key, value) => {
  await Keychain.setGenericPassword(key, value, {
    service: `${key}_${SECURE_KEY}`,
  });
};

export const getSecureValue: GetSecureValue = async key => {
  const result = await Keychain.getGenericPassword({
    service: `${key}_${SECURE_KEY}`,
  });

  if (result) {
    return result.password;
  }
  return false;
};

export const removeSecureValue: RemoveSecureValue = async key => {
  await Keychain.resetGenericPassword({ service: `${key}_${SECURE_KEY}` });
};
