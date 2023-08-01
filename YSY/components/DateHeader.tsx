import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import DateHeaderItem from './DateHeaderItem';
import DateHeaderActiveItem from './DateHeaderActiveItem';
import { globalStyles } from '../style/global';

type DateItem = {
  title: string;
  pressEvent: () => void;
};

type DateActiveItem = {
  title: string;
  isActive: boolean;
  pressEvent: () => void;
};

type DateHeaderProps = {
  items: Array<DateItem>;
  activeItems: Array<DateActiveItem>;
};

const DateHeader: React.FC<DateHeaderProps> = ({ items, activeItems }) => {
  return (
    <View style={[globalStyles.plpr20, styles.container]}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        {items.map((item, idx) => (
          <DateHeaderItem
            key={`item${idx}`}
            title={item.title}
            onPress={item.pressEvent}
          />
        ))}
        {activeItems.map((item, idx) => (
          <DateHeaderActiveItem
            key={`activeItem${idx}`}
            title={item.title}
            onPress={item.pressEvent}
            isActive={item.isActive}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    backgroundColor: '#FFFFFF',
  },
});

export default DateHeader;
