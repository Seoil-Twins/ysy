import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import BackSVG from '../assets/icons/back.svg';

type BackHeaderProps = {
  style?: StyleProp<ViewStyle>;
};

const BackHeader: React.FC<BackHeaderProps> = ({ style }) => {
  const navigation = useNavigation();

  const backBtn = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, style]}>
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
