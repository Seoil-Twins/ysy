import React, { useEffect } from 'react';
import {
  Linking,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { Provider } from 'react-redux';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { URL, URLSearchParams } from 'react-native-url-polyfill';

import store, { RootState } from './redux/store';
import { useAppSelector, useAppDispatch } from './redux/hooks';
import { login, logout } from './features/loginStatusSlice';

import Nav from './navigation/Nav';
import Tutorial from './screens/Tutorial';
import ConnectCouple from './screens/ConnectCouple';
import AdditionalInformation from './screens/AdditionalInformation';

import Loading from './components/Loading';
import { config } from './navigation/config';

const AppWrapper = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

const Stack = createStackNavigator();

const App = () => {
  const isLogin = useAppSelector(
    (state: RootState) => state.loginStatus.isLogin,
  );
  const isLoadding = useAppSelector(
    (state: RootState) => state.loadingStatus.isLoading,
  );
  const dispatch = useAppDispatch();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onLogin = () => {
    dispatch(login());
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onLogout = () => {
    dispatch(logout());
  };

  const linking = {
    prefixes: ['kakaodc4864759db19d9e214c2d732fa2c699://'],

    async getInitialURL() {
      const url = await Linking.getInitialURL();
      return url;
    },

    subscribe(listener: any) {
      const onReceiveURL = (event: { url: string }) => {
        const convertURL = new URL(event.url);
        const params = new URLSearchParams(convertURL.search);
        let result = '';

        // screen을 기준으로 host를 바꿈
        switch (params.get('screen')) {
          case 'ConnectCouple':
            result = event.url.replace('kakaolink', 'connectcouple');
            break;
          default:
            result = event.url.replace('kakaolink', 'tutorial');
            break;
        }

        setTimeout(() => {
          return listener(result);
        }, 1);
      };

      Linking.getInitialURL().then((value: string | null) => {
        if (value) {
          onReceiveURL({ url: value });
        }
      });
      Linking.addEventListener('url', onReceiveURL);

      return () => {
        Linking.removeAllListeners('url');
      };
    },

    config: config,
  };

  // 로그인 상태가 변할 때 마다
  useEffect(() => {
    // onLogin();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#dddddd" />
      <SafeAreaView style={styles.safeContainer}>
        <NavigationContainer linking={linking}>
          {isLogin ? (
            <Nav />
          ) : (
            <Stack.Navigator
              initialRouteName="Tutorial"
              screenOptions={{
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
              }}>
              <Stack.Screen name="Tutorial" component={Tutorial} />
              <Stack.Screen name="ConnectCouple" component={ConnectCouple} />
              <Stack.Screen
                name="AdditionalInformation"
                component={AdditionalInformation}
              />
            </Stack.Navigator>
          )}
        </NavigationContainer>
        {isLoadding ? <Loading /> : null}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
  },
});

export default AppWrapper;
