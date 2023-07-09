import React, {useEffect} from 'react';
import {SafeAreaView, StatusBar, StyleSheet, View} from 'react-native';
import {Provider} from 'react-redux';

import store from './redux/store';
import {useAppSelector, useAppDispatch} from './redux/hooks';
import {login, logout} from './features/loginStatusSlice';

import Nav from './navigation/Nav';
import Tutorial from './screens/Tutorial';

const AppWrapper = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

const App = () => {
  const isLogin = useAppSelector((state: any) => state.loginStatus.isLogin);
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
        {isLogin ? <Nav /> : <Tutorial />}
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
