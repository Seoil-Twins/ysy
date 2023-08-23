import React from 'react';
import {
  StyleSheet,
  ViewStyle,
  StyleProp,
  Pressable,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import SettingsSVG from '../assets/icons/settings.svg';

import { SettingsNavType } from '../navigation/NavTypes';

const ICON_SIZE = 25;

type SettingsProps = {
  style?: StyleProp<ViewStyle>;
};

const SettingsHeader: React.FC<SettingsProps> = ({ style }) => {
  const navigation = useNavigation<StackNavigationProp<SettingsNavType>>();

  const moveSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <View style={[styles.container, style]}>
      <Pressable onPress={moveSettings}>
        <SettingsSVG width={ICON_SIZE} height={ICON_SIZE} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 48,
    backgroundColor: '#FFFFFF',
  },
});

export default SettingsHeader;
