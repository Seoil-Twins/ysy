import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import store, { RootState } from './redux/store';
import { useAppSelector, useAppDispatch } from './redux/hooks';
import { login, logout } from './features/loginStatusSlice';

import Nav from './navigation/Nav';
import Tutorial from './screens/Tutorial';
import ConnectCouple from './screens/ConnectCouple';
import Loading from './components/Loading';

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

  // 컴포넌트 렌더링마다 로그인 상태 확인
  useEffect(() => {}, []);

  // 로그인 상태가 변할 때 마다
  useEffect(() => {
    // onLogin();
    console.log(isLogin);
  }, [isLogin]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#dddddd" />
      <SafeAreaView style={styles.safeContainer}>
        <NavigationContainer>
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
            </Stack.Navigator>
          )}
          {isLoadding ? <Loading /> : null}
        </NavigationContainer>
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
