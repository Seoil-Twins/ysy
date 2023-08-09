import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import ArrowDownSVG from '../assets/icons/arrow_down.svg';

import CustomText from './CustomText';

type DateSortItemProps = {
  title: string;
  onPress: () => void;
};

const DateSortItem: React.FC<DateSortItemProps> = ({ title, onPress }) => {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <CustomText size={12} weight="regular" style={{ marginRight: 5 }}>
        {title}
      </CustomText>
      <ArrowDownSVG />
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

export default DateSortItem;
