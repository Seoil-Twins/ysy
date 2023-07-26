import {
  check,
  checkMultiple,
  request,
  requestMultiple,
  RESULTS,
  Permission,
  openSettings,
} from 'react-native-permissions';

export interface PermissionsBlocked {
  type: Permission;
  isBlocked: boolean;
}

export const checkPermission = async (type: Permission) => {
  try {
    const result = await check(type);

    // android는 권한을 요청해야만 blocked 여부를 알려줌
    switch (result) {
      case RESULTS.DENIED:
        const requestResult = await requestPermission(type);

        if (requestResult === 'blocked') {
          openSettings();
        }

        break;
      case RESULTS.BLOCKED:
        openSettings();
        break;
    }
  } catch (error) {
    console.log('Check Permissions : ', error);
  }
};

export const checkPermissions = async (types: Permission[]) => {
  try {
    const result = await checkMultiple(types);
    const requests: Permission[] = [];

    types.forEach((type: Permission) => {
      switch (result[type]) {
        case RESULTS.DENIED:
          requests.push(type);
          break;
        case RESULTS.BLOCKED:
          openSettings();
          return;
      }
    });

    const results = await requestPermissions(requests);

    if (results) {
      types.forEach((type: Permission) => {
        if (results[type] === 'blocked') {
          openSettings();
          return;
        }
      });
    }
  } catch (error) {
    console.log('Check Permissions : ', error);
  }
};

export const requestPermission = async (types: Permission) => {
  try {
    return await request(types);
  } catch (error) {
    console.log('Request Permissions : ', error);
  }
};

export const requestPermissions = async (types: Permission[]) => {
  try {
    return await requestMultiple(types);
  } catch (error) {
    console.log('Request Permissions : ', error);
  }
};
