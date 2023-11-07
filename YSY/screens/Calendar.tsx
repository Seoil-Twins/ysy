import React from 'react';
import { View, StyleSheet } from 'react-native';
import MyCalendar from '../components/MyCalendar';

const Calendar = () => {
  const handleDayPress = (day: any) => {};

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
