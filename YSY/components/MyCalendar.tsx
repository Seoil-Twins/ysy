import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text, PanResponder, Pressable, FlatList, Modal } from 'react-native';
import { isSameDay } from 'date-fns';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import SettingSvg from '../assets/icons/settings.svg';
import CalendarHeader from './CalendarHeader';

import BackSvg from '../assets/icons/back.svg';
import CalendarSvg from '../assets/icons/calendar.svg';
import { TextInput } from 'react-native-gesture-handler';

const screenWidth = wp('100%');
const screenHeight = hp('100%');

interface CalendarProps {
  onDateSelect: (date: Date) => void;
}

type Schedule = {
  date: string;
  time: string;
  hl: string;
  title: string;
  desc: string;
  color: string;
};

const MyCalendar: React.FC<CalendarProps> = ({ onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // 현재
  const [showDetailView, setShowDetailView] = useState(false);
  const [dateCellFlex, setDateCellFlex] = useState(false);
  const [scheduleList, setScheduleList] = useState<Schedule[]>([]);
  const [selectedScheduleList, setSelectedScheduleList] = useState<Schedule[]>([]);
  const [addScheVisible, setAddScheVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<number>(
    new Date().getMonth(),
  );
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [panning, setPanning] = useState(false);

  const today = new Date();

  // const panResponder = useRef(
  //   PanResponder.create({
  //     onStartShouldSetPanResponder: () => true,
  //     onPanResponderMove: (evt, gestureState) => {
  //       console.log('앙');
  //       if(panning)
  //         {
  //           return;
  //         }
  //         console.log('앙');
  //       setPanning(true); // 스와이프 동작 시작
  //       console.log('swipe');
  //       if (Math.abs(gestureState.dx) > 30) {
  //         if (gestureState.dx > 30) {
  //           console.log('swipe1');
  //           handlePrevMonth();
  //         } else {
  //           console.log('swipe2');
  //           handleNextMonth();
  //         }
  //         console.log('swipe');
  //       }
  //       setTimeout(() => {
  //           setPanning(false);
  //       }, 1000);
  //     },
  //     onPanResponderEnd: () => {
  //       console.log('cex');
  //       // if (panning) {
  //       //   setPanning(false); // 스와이프 동작 종료
  //       // }
  //     },
  //     onPanResponderStart: (e, gestureState) => {
  //       console.log('start');
  //     },
  //     onPanResponderEnd: (e, gestureState) => {
  //       console.log('end');
  //     },
  //   }),
  // ).current;

  const handlePrevMonth = () => {
    if (currentMonth <= 0) {
      setCurrentYear(currentYear - 1);
    }
    setCurrentMonth(prevMonth => (prevMonth === 0 ? 11 : prevMonth - 1));
    getSchedule(currentMonth);
    getMonthDates(currentYear, currentMonth);
  };

  const handleNextMonth = () => {
    if (currentMonth >= 11) {
      setCurrentYear(currentYear + 1);
    }
    setCurrentMonth(prevMonth => (prevMonth === 11 ? 0 : prevMonth + 1));
    getSchedule(currentMonth);
    getMonthDates(currentYear, currentMonth);
  };

  const handleDateSelect = (date: Date) => {
    if (isSameDay(selectedDate, date)) {
      console.log('more Click');
      setDateCellFlex(!dateCellFlex);
      setShowDetailView(!showDetailView);
      filterSchedule();
    } else {
      if (dateCellFlex && showDetailView) {
        setDateCellFlex(!dateCellFlex);
        setShowDetailView(!showDetailView);
      }
      if (isSameMonth(date, currentMonth) && isSameYear(date, currentYear)) {
        console.log(date.getMonth() + ' :: ' + today.getMonth());
        setSelectedDate(date);
        onDateSelect(date);
      } else {
        if (currentMonth == 11 && date.getMonth() === 0)
          setCurrentYear(currentYear + 1);
        if (currentMonth == 0 && date.getMonth() === 11)
          setCurrentYear(currentYear - 1);
        setCurrentMonth(date.getMonth());
      }
    }
  };

  const isSameMonth = (date1: Date, date2: number) => {
    return date1.getMonth() === date2;
  };
  const isSameYear = (date1: Date, date2: number) => {
    return date1.getFullYear() === date2;
  };
  const getSchedule = (currentMonth: number) => {
    // currentMonth를 통해 DB에서 현재 월의 일정을 가져옴
    console.log(selectedDate + ' :: ' + currentMonth);
    setScheduleList([
      {
        date: '2023-08-14',
        time: '7:30AM',
        hl: '20m',
        title: '중국집',
        desc: '짜장면 먹기',
        color: 'red',
      },
      {
        date: '2023-08-14',
        time: '12:30PM',
        hl: '30m',
        title: '파스타',
        desc: '알리올리오 먹기',
        color: '#CCCCCC',
      },
      {
        date: '2023-08-14',
        time: '7:30AM',
        hl: '20m',
        title: '중국집',
        desc: '짜장면 먹기',
        color: 'red',
      },
      {
        date: '2023-08-14',
        time: '12:30PM',
        hl: '30m',
        title: '파스타',
        desc: '알리올리오 먹기',
        color: '#0000FF',
      },
      {
        date: '2023-08-14',
        time: '7:30AM',
        hl: '20m',
        title: '중국집',
        desc: '짜장면 먹기',
        color: '#00FF00',
      },
      {
        date: '2023-08-14',
        time: '7:30AM',
        hl: '20m',
        title: '중국집',
        desc: '짜장면 먹기',
        color: '#00FF00',
      },
      {
        date: '2023-08-14',
        time: '7:30AM',
        hl: '20m',
        title: '중국집',
        desc: '짜장면 먹기',
        color: '#00FF00',
      },
      {
        date: '2023-08-14',
        time: '7:30AM',
        hl: '20m',
        title: '중국집',
        desc: '짜장면 먹기',
        color: '#00FF00',
      },
      {
        date: '2023-08-14',
        time: '7:30AM',
        hl: '20m',
        title: '중국집',
        desc: '짜장면 먹기',
        color: '#00FF00',
      },
      {
        date: '2023-09-14',
        time: '7:30AM',
        hl: '20m',
        title: '중국집',
        desc: '짜장면 먹기',
        color: '#00FF00',
      },
      {
        date: '2023-08-15',
        time: '12:30PM',
        hl: '30m',
        title: '파스타',
        desc: '알리올리오 먹기',
        color: 'red',
      },
    ]);
  };

  const getMonthDates = (year: number, month: number): Date[] => {
    if (scheduleList.length <= 0) getSchedule(month);

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    const startDayOfWeek = firstDay.getDay();
    const endDayOfWeek = lastDay.getDay();

    // 이전 달의 마지막 날들을 추가
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(date);
    }

    for (
      let date = new Date(firstDay);
      date <= lastDay;
      date.setDate(date.getDate() + 1)
    ) {
      days.push(new Date(date));
    }

    let nextMonthDay = 1;
    for (let i = endDayOfWeek + 1; days.length < 42; i++) {
      const date = new Date(year, month + 1, nextMonthDay);
      days.push(date);
      nextMonthDay++;
    }

    return days;
  };

  // 각 요일의 이름을 배열로 정의
  const dayOfWeekLabels = ['일', '월', '화', '수', '목', '금', '토'];

  // 현재 달의 첫 번째 날의 요일을 구하는 함수
  const getFirstDayOfWeek = (year: number, month: number): number => {
    return new Date(year, month, 2).getDay();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getEmptyCellsCount = () => {
    const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);
    return firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  };

  const divideArray = (arr: Date[], size: number) => {
    const dividedArray = [];
    for (let i = 0; i < arr.length; i += size) {
      dividedArray.push(arr.slice(i, i + size));
    }
    return dividedArray;
  };

  const currentMonthDates = getMonthDates(currentYear, currentMonth);

  // const adjustedDates = [
  //   ...Array(getEmptyCellsCount()).fill(null),
  //   ...currentMonthDates,
  // ];

  const dividedDates = divideArray(currentMonthDates, 7);

  const filterSchedule = () => {
    const newSchedule = scheduleList.filter(
      item => item.date === selectedDate.toISOString().slice(0, 10),
    );
    setSelectedScheduleList(newSchedule);
  };

  const drawCircle = (color: string) => {
    return (
      <View
        style={{
          width: '2%', // 원의 너비
          height: 8, // 원의 높이
          borderRadius: 5, // 반지름 값의 절반으로 원이 됨
          backgroundColor: color, // 특정 색상
          marginRight: '1%',
        }}
      />
    );
  };

  const drawBar = (day: Date) => {
    const filtedSchedule = scheduleList.filter(
      item => item.date === day.toISOString().slice(0, 10),
    );
    let totalBarHeight;
    if (showDetailView) totalBarHeight = screenHeight * 0.02;
    else totalBarHeight = screenHeight * 0.08;

    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            width: '100%',
            height: totalBarHeight,
            overflow: 'hidden', // 막대가 넘어가는 부분 숨김 처리
          }}>
          <FlatList
            data={filtedSchedule}
            keyExtractor={(item, index) => String(index)}
            renderItem={({ item }) => RenderBar(item)}
          />
        </View>
      </View>
    );
  };

  const RenderBar = (schedule: Schedule) => {
    return (
      <View
        style={{
          width: '90%', // 원의 너비
          height: 8, // 원의 높이
          backgroundColor: schedule.color, // 특정 색상
          marginRight: '70%',
          marginLeft: '5%',
          marginTop: '10%',
          borderRadius: 20,
        }}
      />
    );
  }

  const RenderSchecule = (schedule: Schedule) => {
    return (
      <View
        style={{
          flex: 1,
          width: screenWidth * 1,
          height: screenHeight * 0.1,
          marginBottom: 5,
          alignItems: 'center',
          justifyContent: 'flex-start',
          flexDirection: 'row',
        }}>
        <View
          style={{
            width: screenWidth * 0.2,
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{ fontSize: 18 }}>{schedule.time}</Text>
          <Text>{schedule.hl}</Text>
        </View>
        <View
          style={{
            width: '70%',
            height: '100%',
            alignItems: 'flex-start',
            justifyContent: 'center',
            marginLeft: '6%',
            borderBottomColor: '#CCCCCC',
            borderBottomWidth: 1,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {drawCircle(schedule.color)}
            <Text style={{ fontSize: 18, justifyContent: 'center' }}>
              {schedule.title}
            </Text>
          </View>
          <Text style={{ paddingLeft: '3.5%', fontSize: 12 }}>
            {schedule.desc}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <React.Fragment>
      <View
        style={{
          flexDirection: 'row',
          height: 50,
          backgroundColor: 'white',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}>
        <CalendarHeader openAddModal={() => setAddScheVisible(true)} />
      </View>
      <View style={styles.container}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleContainer}>
            {/* 이전 달로 이동하는 버튼 */}
            <Pressable onPress={handlePrevMonth}>
              <Text style={styles.button}>Prev</Text>
            </Pressable>

            {/* 선택된 달과 년도 표시 */}
            <Text style={styles.title}>
              {currentYear + ' ' + (currentMonth + 1)}
            </Text>

            {/* 다음 달로 이동하는 버튼 */}
            <Pressable onPress={handleNextMonth}>
              <Text style={styles.button}>Next</Text>
            </Pressable>
          </View>

          {/* 달력의 날짜들 */}
          <View style={styles.calendarContainer}>
            {/* 요일 표시 월화수목금토일*/}
            <View style={styles.weekLabelsContainer}>
              {dayOfWeekLabels.map((label, index) => (
                <Text
                  key={index}
                  style={[
                    styles.dayOfWeekLabel,
                    index === 0 && { color: '#FB3838' },
                    index === 6 && { color: '#0066FF' },
                  ]}>
                  {label}
                </Text>
              ))}
            </View>

            {dividedDates.map((week, index) => (
              <View key={index} style={styles.weekContainer}>
                {week.map((date, subIndex) =>
                  date ? (
                    <Pressable
                      key={date.toString()}
                      onTouchEnd={e => {
                        e.stopPropagation();
                      }}
                      onPress={() => handleDateSelect(date)}
                      style={[
                        dateCellFlex ? styles.dateCellFlex : styles.dateCell,
                        isSameDay(date, selectedDate) && styles.selectedDateCell,
                        isSameDay(date, today) && styles.todayCell,
                        !isSameMonth(date, currentMonth) &&
                          styles.prevNextMonthDateCell,
                      ]}>
                      <Text
                        style={[
                          isSameDay(date, selectedDate) &&
                            styles.selectedDateText,
                          date.getDay() === 0 && styles.sundayCell, // 일요일의 스타일
                          date.getDay() === 6 && styles.saturdayCell, // 토요일의 스타일
                        ]}>
                        {date.getDate()}
                      </Text>
                      <View>{drawBar(date)}</View>
                    </Pressable>
                  ) : (
                    <View key={subIndex} style={styles.dateCell} />
                  ),
                )}
              </View>
            ))}
          </View>
        </View>

        {showDetailView && (
          <View style={styles.flexibleSpace}>
            <View style={styles.detailView}>
              {selectedScheduleList.length <= 0 ? (
                <>
                  <SettingSvg style={styles.sadStyle} />
                  <Text style={styles.noneScheText}>
                    일정이 없어요.{'\n'}일정을 추가해주세요!
                  </Text>
                </>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <View
                    style={{
                      width: screenWidth * 0.9,
                      height: '5%',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      borderBottomWidth: 1,
                      borderColor: '#cccccc',
                    }}>
                    <Text>{selectedDate.toDateString()}</Text>
                  </View>
                  <FlatList
                    data={selectedScheduleList}
                    keyExtractor={(item, index) => String(index)}
                    renderItem={({ item }) => RenderSchecule(item)}
                  />
                </View>
              )}
            </View>
          </View>
        )}
      </View>
      <Modal // 앨범 합치기
        visible={addScheVisible}
        animationType="slide"
        transparent={true}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              height: '5%',
              backgroundColor: 'white',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <BackSvg
              onPress={() => setAddScheVisible(false)}
              style={{ marginLeft: '3%' }}
              height={100}
            />
            <Text style={{ marginRight: '3%', fontSize: 18, color: '#CCCCCC' }}>추가</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={{ height: '20%', alignItems: 'flex-start', justifyContent:'center'}}>
              <Text style = {{color:'#222222', fontWeight:'bold', fontSize: 24, margin: '3%'}}>일정 추가</Text>
              <Text
                style={{
                  color: '#CCCCCC',
                  fontWeight: 'bold',
                  fontSize: 16,
                  marginLeft: '3%',
                }}>
                새로운 일정을 추가합니다.{'\n'}연인과 함께 또는 공유하는 일정을
                추가해주세요!
              </Text>
            </View>
            <View style={{ backgroundColor:'white', alignItems: 'flex-start', justifyContent:'center', padding: '3%'}}>
              <TextInput
                style={styles.input}
                maxLength={20}
                onChangeText={() => {}}
                placeholder="제목"
              />
              {/* <Input placeholder={'제목'} /> */}
              <TextInput
                style={styles.inputDesc}
                multiline={true}
                textAlignVertical="top"
                onChangeText={() => {}}
                placeholder="설명"
              />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={[styles.input, { color: 'black' }]}
                  onChangeText={() => {}}
                  defaultValue={
                    selectedDate.toISOString().slice(0, 10) + ' 07:30 AM'
                  }
                  editable={false}
                />
                <CalendarSvg
                  style={{ marginRight: 20, position: 'absolute', right: 0 }}
                  width={50}
                  height={50}
                />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={styles.input}
                  onChangeText={() => {}}
                  placeholder='종료 날짜'
                  editable={false}
                />
                <CalendarSvg
                  style={{ marginRight: 20, position: 'absolute', right: 0 }}
                  width={50}
                  height={50}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    fontSize: 16,
    color: 'blue',
  },
  titleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarContainer: {
    flex: 2, // 활성화 여부에 따라 flex 값 변경
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white', // 배경색 변경
  },
  dateCell: {
    width: screenWidth * 0.12,
    height: screenHeight * 0.1,
    marginBottom: screenHeight * 0.02,
    alignItems: 'center',
    justifyContent: 'flex-start',
    margin: 2,
  },
  dateCellFlex: {
    width: screenWidth * 0.12,
    height: screenHeight * 0.04,
    marginBottom: screenHeight * 0.02,
    alignItems: 'center',
    justifyContent: 'flex-start',
    margin: 2,
  },
  selectedDateCell: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: 'gray',
  },
  selectedDateText: {
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: '#0066FF',
    shadowOpacity: 0.5,
  },
  todayCell: {
    backgroundColor: 'green',
    borderRadius: 10,
  },
  weekLabelsContainer: {
    flexDirection: 'row',
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#3333334D',
    height: screenHeight * 0.03,
    justifyContent: 'space-between',
    marginTop: 10,
    backgroundColor: 'white', // 배경색 변경
  },
  dayOfWeekLabel: {
    fontSize: 16,
    width: screenWidth * 0.12,
    margin: 2,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  weekContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    backgroundColor: 'white', // 배경색 변경
  },
  prevNextMonthDateCell: {
    width: screenWidth * 0.12,
    marginBottom: screenHeight * 0.02,
    margin: 2,
    opacity: 0.4, // 회색으로 처리하기 위한 투명도 설정
  },
  selectedPrevNextMonthDateCell: {
    backgroundColor: 'blue', // 선택된 날짜의 스타일
    opacity: 1, // 선택된 날짜는 투명도를 원래대로 설정
  },
  sundayCell: {
    color: '#FB3838', // 일요일 색상
  },
  saturdayCell: {
    color: '#0066FF', // 토요일 색상
  },
  flexibleSpace: {
    flex: 1,
    width: screenWidth * 1,
  },

  detailView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: screenHeight * 1,
  },
  sadStyle: {
    marginBottom: 10,
    width: 48,
  },
  noneScheText: {
    color: '#CCCCCC',
    textAlign: 'center',
    fontSize: 18,
  },
  circle: {
    width: '2%', // 원의 너비
    height: 8, // 원의 높이
    borderRadius: 5, // 반지름 값의 절반으로 원이 됨
    backgroundColor: 'blue', // 특정 색상
    marginRight: '1%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    width: screenWidth - screenWidth * 0.1,
    height: screenHeight * 0.1,
    padding: 20,
    marginBottom: 10,
    fontSize: 24,
  },
  inputDesc: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    width: screenWidth - screenWidth * 0.1,
    height: screenHeight * 0.2,
    padding: 20,
    marginBottom: 10,
    fontSize: 24,
  },
});

export default MyCalendar;
