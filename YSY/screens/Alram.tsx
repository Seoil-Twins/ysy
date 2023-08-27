import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import { globalStyles } from '../style/global';

import BackHeader from '../components/BackHeader';
import ToggleButton from '../components/ToggleButton';

type AlramItem = {
  key: string;
  title: string;
  explain: string;
};

type AlramResponse = {
  [key: string]: boolean;
};

const fetchGetAlram = async () => {
  const response: AlramResponse = {
    noticeNofi: true,
    eventNofi: false,
    dateNofi: false,
    coupleNofi: true,
    albumNofi: false,
    calendarNofi: false,
  };

  return response;
};

const fetchUpdateAlram = async (key: string, value: boolean) => {
  console.log(key, value);
};

const alramItems: AlramItem[] = [
  {
    key: 'noticeNofi',
    title: '공지',
    explain: '새로운 공지 알림',
  },
  {
    key: 'eventNofi',
    title: '이벤트',
    explain: '새로운 또는 진행중인 이벤트 알림',
  },
  {
    key: 'dateNofi',
    title: '데이트 장소',
    explain: '인기 데이트 및 추천 데이트 알림',
  },
  {
    key: 'coupleNofi',
    title: '연인 정보',
    explain: '연인 정보를 업데이트하면 발생하는 알림',
  },
  {
    key: 'albumNofi',
    title: '앨범',
    explain: '새로운 또는 삭제한 앨범 등을 알려주는 알림',
  },
  {
    key: 'calendarNofi',
    title: '일정',
    explain: '새로운 또는 삭제한 일정 등을 알려주는 알림',
  },
];

const Alram = () => {
  const [alramData, setAlramData] = useState<AlramResponse>();

  const getAlram = useCallback(async () => {
    const response = await fetchGetAlram();
    setAlramData(response);
  }, []);

  const handleToggleChange = (key: string, isToggle: boolean) => {
    setAlramData(prevData => ({
      ...prevData,
      [key]: isToggle,
    }));

    fetchUpdateAlram(key, isToggle);
  };

  useEffect(() => {
    getAlram();
  }, [getAlram]);

  return (
    <View style={[styles.container]}>
      <BackHeader style={globalStyles.plpr20} />
      <ScrollView
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        {alramData
          ? alramItems.map((item: AlramItem) => (
              <View key={item.key} style={[globalStyles.plpr20, styles.btnBox]}>
                <ToggleButton
                  title={item.title}
                  explain={item.explain}
                  isActive={alramData[item.key]}
                  onChangeToggle={(isToggle: boolean) =>
                    handleToggleChange(item.key, isToggle)
                  }
                />
              </View>
            ))
          : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  btnBox: {
    backgroundColor: '#FFFFFF',
  },
});

export default Alram;
