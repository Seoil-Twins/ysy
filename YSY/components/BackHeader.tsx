import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import BackSVG from '../assets/icons/back.svg';

const BackHeader = () => {
  const navigation = useNavigation();

  const backBtn = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={backBtn}>
        <BackSVG />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
});

export default BackHeader;
