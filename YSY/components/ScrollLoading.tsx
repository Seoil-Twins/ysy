import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

type ScrollLoadingProps = {
  height: number;
};

const ScrollLoading: React.FC<ScrollLoadingProps> = ({ height }) => {
  return (
    <View style={[styles.container, { height: height }]}>
      <ActivityIndicator size={30} color="#3675FB" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

export default ScrollLoading;
