import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import BackSVG from '../assets/icons/back.svg';
import CustomText from './CustomText';

type ConfirmHeaderProps = {
  onPress: () => void;
  btnText: string;
  isEnable: boolean;
};

const ConfirmHeader: React.FC<ConfirmHeaderProps> = ({
  btnText,
  isEnable,
  onPress,
}) => {
  const navigation = useNavigation();

  const backBtn = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={backBtn}>
        <BackSVG />
      </Pressable>
      <Pressable onPress={onPress}>
        <CustomText
          size={16}
          weight="regular"
          color={isEnable ? '#3675FB' : '#999999'}>
          {btnText}
        </CustomText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
});

export default ConfirmHeader;
