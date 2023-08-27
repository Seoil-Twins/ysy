import React from 'react';
import { View, StyleSheet } from 'react-native';
import MyCalendar from '../components/MyCalendar';
import CalendarHeader from '../components/CalendarHeader';

const Calendar = () => {
  const handleDayPress = (day: any) => {
    console.log('Selected day:', day);
  };

  // const markedDates = {
  //   '2023-07-01': { selected: true, selectedColor: 'blue' },
  //   '2023-07-05': { selected: true, selectedColor: 'green' },
  // };

  return (
    <View style={styles.container}>
      <MyCalendar onDateSelect={handleDayPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default Calendar;
