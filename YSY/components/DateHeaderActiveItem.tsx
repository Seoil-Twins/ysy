import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import CustomText from './CustomText';

type DateHeaderActiveItemProps = {
  title: string;
  isActive?: boolean;
  onPress: () => void;
};

const DateHeaderItem: React.FC<DateHeaderActiveItemProps> = ({
  title,
  isActive,
  onPress,
}) => {
  return (
    <Pressable
      style={[
        styles.container,
        isActive ? styles.activeContainer : styles.noneContainer,
      ]}
      onPress={onPress}>
      <CustomText
        size={12}
        weight="regular"
        style={isActive ? styles.activeFont : null}>
        {title}
      </CustomText>
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
    backgroundColor: '#',
    marginRight: 10,
  },
  activeContainer: {
    backgroundColor: '#5A8FFF',
    borderBlockColor: 'transparent',
  },
  noneContainer: {
    backgroundColor: '#F2F6FF',
    borderColor: '#E4EAF6',
  },
  activeFont: {
    color: '#FFFFFF',
  },
});

export default DateHeaderItem;
