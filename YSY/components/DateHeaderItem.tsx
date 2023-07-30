import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import ArrowDownSVG from '../assets/icons/arrow_down.svg';

import CustomText from './CustomText';

type DateHeaderItemProps = {
  title: string;
  isArrow?: boolean;
  onPress: () => void;
};

const DateHeaderItem: React.FC<DateHeaderItemProps> = ({
  title,
  isArrow,
  onPress,
}) => {
  isArrow = isArrow === undefined ? true : false;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <CustomText
        size={12}
        weight="regular"
        style={isArrow ? { marginRight: 5 } : null}>
        {title}
      </CustomText>
      {isArrow ? <ArrowDownSVG /> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#E4EAF6',
    backgroundColor: '#F2F6FF',
    marginRight: 10,
  },
});

export default DateHeaderItem;
