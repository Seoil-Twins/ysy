import React from 'react';
import { StyleSheet, Pressable } from 'react-native';

import SearchSVG from '../assets/icons/search.svg';
import CustomText from './CustomText';

type DateSearchItemProps = {
  text: string;
  onPress: (text: string) => void;
};

const DateSearchItem: React.FC<DateSearchItemProps> = ({ text, onPress }) => {
  const emitPress = () => {
    onPress(text);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed ? styles.pressed : null,
      ]}
      onPress={emitPress}>
      <SearchSVG width={20} height={20} style={styles.img} />
      <CustomText size={16} weight="regular">
        {text}
      </CustomText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
  },
  img: {
    marginRight: 20,
  },
  pressed: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    backgroundColor: '#EFEFEF',
  },
});

export default DateSearchItem;
