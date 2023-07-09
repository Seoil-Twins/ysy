import React, { useCallback, useEffect } from "react";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import { Provider } from "react-redux";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import store from "./redux/store";
import { useAppSelector, useAppDispatch } from "./redux/hooks";
import { login, logout } from "./features/loginStatusSlice";

import Nav from "./navigation/Nav";
import Tutorial from "./screens/Tutorial";

SplashScreen.preventAutoHideAsync();

const AppWrapper = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

const App = () => {
  const isLogin = useAppSelector((state) => state.loginStatus.isLogin);
  const dispatch = useAppDispatch();

  const onLogin = () => {
    dispatch(login());
  };

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

  const [fontsLoaded] = useFonts({
    "notosans-medium": require("./assets/fonts/NotoSansKR-Medium.otf"),
    "notosans-regular": require("./assets/fonts/NotoSansKR-Regular.otf")
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#dddddd" />
      <SafeAreaView style={styles.safeContainer} onLayout={onLayoutRootView}>
        {isLogin ? <Nav /> : <Tutorial />}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  safeContainer: {
    flex: 1
  }
});

export default AppWrapper;
