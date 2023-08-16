import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import BackHeader from '../components/BackHeader';
import NoticeAccord from '../components/NoticeAccord';

import { globalStyles } from '../style/global';

import { Notice as NoticeType } from '../types/noitce';

const fetchNotice = async () => {
  const response: NoticeType[] = [
    {
      noticeId: 1,
      title: '공지 제목 1',
      contents: `
        <div style='fontSize: 20px'>안녕하십니까 공지 제목 1입니다.</div>
        <img src="https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg" />
        <div>안녕하십니까 공지 제목 1입니다.</div>
        <div>안녕하십니까 공지 제목 1입니다.</div>
        <br>
        <div>관리자 드림</div>
      `,
      createdTime: '2023-02-08 05:03:24',
    },
    {
      noticeId: 2,
      title: '공지 제목 2',
      contents: `
        <div>안녕하십니까 공지 제목 2입니다.</div>
        <img src="https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg" />
        <div>안녕하십니까 공지 제목 2입니다.</div>
        <div>안녕하십니까 공지 제목 2입니다.</div>
        <br>
        <div>관리자 드림</div>
      `,
      createdTime: '2023-02-08 05:03:24',
    },
    {
      noticeId: 3,
      title: '공지 제목 3',
      contents: `
        <div>안녕하십니까 공지 제목 3입니다.</div>
        <img src="https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg" />
        <div>안녕하십니까 공지 제목 3입니다.</div>
        <div>안녕하십니까 공지 제목 3입니다.</div>
        <br>
        <div>관리자 드림</div>
      `,
      createdTime: '2023-02-08 05:03:24',
    },
    {
      noticeId: 4,
      title: '공지 제목 4',
      contents: `
        <div>안녕하십니까 공지 제목 4입니다.</div>
        <img src="https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg" />
        <div>안녕하십니까 공지 제목 4입니다.</div>
        <div>안녕하십니까 공지 제목 4입니다.</div>
        <br>
        <div>관리자 드림</div>
      `,
      createdTime: '2023-02-08 05:03:24',
    },
    {
      noticeId: 5,
      title: '공지 제목 5',
      contents: `
        <div>안녕하십니까 공지 제목 5입니다.</div>
        <img src="https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg" />
        <div>안녕하십니까 공지 제목 5입니다.</div>
        <div>안녕하십니까 공지 제목 5입니다.</div>
        <br>
        <div>관리자 드림</div>
      `,
      createdTime: '2023-02-08 05:03:24',
    },
  ];

  return response;
};

const Notice = () => {
  const [notices, setNotices] = useState<NoticeType[] | null>(null);

  const getNotices = async () => {
    const response: NoticeType[] = await fetchNotice();
    setNotices(response);
  };

  useEffect(() => {
    getNotices();
  }, []);

  return (
    <View style={styles.container}>
      <BackHeader style={globalStyles.plpr20} />
      <ScrollView
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        {notices &&
          notices.map((notice: any) => (
            <NoticeAccord
              key={notice.noticeId}
              title={notice.title}
              content={notice.contents}
              createdTime={notice.createdTime}
            />
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default Notice;
