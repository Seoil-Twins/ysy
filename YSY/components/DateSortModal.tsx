import React from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  ScrollView,
  Pressable,
} from 'react-native';

import CustomText from './CustomText';

import CheckBlueSVG from '../assets/icons/check_blue.svg';

type SortItem = {
  title: string;
  value: string;
};

type DateSortModalProps = {
  title: string;
  items: SortItem[];
  active: SortItem;
  onPress: (item: SortItem) => void;
};

const { height } = Dimensions.get('window');

const DateSortModal: React.FC<DateSortModalProps> = ({
  title,
  items,
  active,
  onPress,
}) => {
  const emitPress = (item: SortItem) => {
    onPress(item);
  };

  return (
    <View style={styles.container}>
      <CustomText size={20} weight="medium" style={styles.title}>
        {title}
      </CustomText>
      <ScrollView
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        {items.map((item, idx) =>
          active.value === item.value ? (
            <Pressable key={idx} style={[styles.item, styles.active]}>
              <CustomText size={18} weight="medium" color="#5A8FFF">
                {item.title}
              </CustomText>
              <CheckBlueSVG />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => emitPress(item)}
              key={idx}
              style={styles.item}>
              <CustomText size={18} weight="regular">
                {item.title}
              </CustomText>
            </Pressable>
          ),
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: height / 2 - 100,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  title: {
    marginBottom: 20,
  },
  item: {
    justifyContent: 'center',
    paddingVertical: 10,
  },
  active: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default DateSortModal;
