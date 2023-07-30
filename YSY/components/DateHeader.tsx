import React from 'react';

import DateHeaderItem from './DateHeaderItem';
import { StyleSheet, View, ScrollView } from 'react-native';

type DateItem = {
  title: string;
  pressEvent: () => void;
};

type DateHeaderProps = {
  items: Array<DateItem>;
  onPressGPS: () => void;
};

const DateHeader: React.FC<DateHeaderProps> = ({ items, onPressGPS }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        {items.map((item, idx) => (
          <DateHeaderItem
            key={idx}
            title={item.title}
            onPress={item.pressEvent}
          />
        ))}
        <DateHeaderItem
          title="내 위치 기반"
          onPress={onPressGPS}
          isArrow={false}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 45,
    alignItems: 'center',
  },
});

export default DateHeader;
