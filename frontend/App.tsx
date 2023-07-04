import React, { useCallback } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";

SplashScreen.preventAutoHideAsync();

import Nav from "./navigation/Nav";

const App = () => {
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
    <>
      <StatusBar backgroundColor="#dddddd" />
      <SafeAreaView style={styles.safeContainer} onLayout={onLayoutRootView}>
        <Nav />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1
    // marginTop: StatusBar.currentHeight
  }
});

export default App;
