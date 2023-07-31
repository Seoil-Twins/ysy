import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MyCalendar from '../components/MyCalendar';

const Calendar = () => {
  const handleDayPress = (day: any) => {
    console.log('Selected day:', day);
  };

  const markedDates = {
    '2023-07-01': { selected: true, selectedColor: 'blue' },
    '2023-07-05': { selected: true, selectedColor: 'green' },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Calendar</Text>
      <MyCalendar onDayPress={handleDayPress} markedDates={markedDates} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default Calendar;