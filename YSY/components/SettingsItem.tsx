import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { SettingsNavType } from '../navigation/NavTypes';

import CustomText from './CustomText';

import ArrowSVG from '../assets/icons/arrow_right_gray.svg';

type SettingsItemProps = {
  title: string;
  navName: keyof SettingsNavType;
  isMargin?: boolean;
};

const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  navName,
  isMargin,
}) => {
  const navigation = useNavigation<StackNavigationProp<SettingsNavType>>();

  const moveScreen = () => {
    navigation.navigate(navName);
  };

  return (
    <Pressable
      style={[isMargin && styles.mb10, styles.cotainer]}
      onPress={moveScreen}>
      <CustomText size={16} weight="regular">
        {title}
      </CustomText>
      <ArrowSVG width={15} height={15} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cotainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  mb10: {
    marginBottom: 10,
  },
});

export default SettingsItem;
