import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import DateSortItem from './DateSortItem';
import DateSortActiveItem from './DateSortActiveItem';
import { globalStyles } from '../style/global';

type DateItem = {
  title: string;
  pressEvent: () => void;
};

type DateSortActiveItem = {
  title: string;
  isActive: boolean;
  pressEvent: () => void;
};

type DateSortHeaderProps = {
  items: Array<DateItem>;
  activeItems: Array<DateSortActiveItem>;
};

const DateSortHeader: React.FC<DateSortHeaderProps> = ({
  items,
  activeItems,
}) => {
  return (
    <View style={[globalStyles.plpr20, styles.container]}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        {items.map((item, idx) => (
          <DateSortItem
            key={`item${idx}`}
            title={item.title}
            onPress={item.pressEvent}
          />
        ))}
        {activeItems.map((item, idx) => (
          <DateSortActiveItem
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

export default DateSortHeader;
