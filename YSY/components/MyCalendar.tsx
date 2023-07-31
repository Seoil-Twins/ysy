import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';

import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const screenWidth = wp('100%');
const screenHeight = hp('100%');

interface MyCalendarProps {
  onDayPress: (day: string) => void;
  markedDates?: Record<string, { selected: boolean; selectedColor: string }>;
}

const MyCalendar: React.FC<MyCalendarProps> = ({ onDayPress, markedDates }) => {
  return (
    <View style={styles.container}>
      <Calendar
        // 초기 선택 날짜 (optional)
        // 'YYYY-MM-DD' 형식으로 지정 (예: '2023-07-03')
        // 아무 날짜도 선택하지 않은 상태면 빈 문자열로 설정
        // 초기 선택 날짜를 지정하지 않으면 오늘 날짜가 선택됨
        markedDates={markedDates}
        // 날짜를 선택했을 때 호출되는 콜백 함수
        onDayPress={(day) => {
          onDayPress(day.dateString); // dateString 속성을 사용하여 날짜를 문자열로 전달
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: screenWidth * 0.9,
    height: screenHeight * 0.9,
  },
});

export default MyCalendar;