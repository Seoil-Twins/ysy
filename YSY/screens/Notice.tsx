import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import BackHeader from '../components/BackHeader';
import NoticeAccord from '../components/NoticeAccord';

import { globalStyles } from '../style/global';

import { Notice as NoticeType } from '../types/noitce';
import { noticeAPI } from '../apis/noticeAPI';

import NoItem from '../components/NoItem';
import SearchSVG from '../assets/icons/search.svg';

const fetchNotice = async () => {
  const data = { count: 10, page: 1 };
  const res = await noticeAPI.getNotice(data);
  const newNoticeList: NoticeType[] = [];

  for (const notice of res.notices) {
    const newNotice: NoticeType = {
      noticeId: notice.noticeId,
      title: notice.title,
      contents: notice.contents,
      createdTime: notice.createdTime,
    };
    newNoticeList.push(newNotice);
  }

  return newNoticeList;

  /*
      contents: `
        <div style='fontSize: 20px'>안녕하십니까 공지 제목 1입니다.</div>
        <img src="https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg" />
        <div>안녕하십니까 공지 제목 1입니다.</div>
        <div>안녕하십니까 공지 제목 1입니다.</div>
        <br>
        <div>관리자 드림</div>
      `,
  */
};

const Notice = () => {
  const [notices, setNotices] = useState<NoticeType[] | null>([]);

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
      {notices.length > 0 ? (
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
      ) : (
        <NoItem
          icon={SearchSVG}
          descriptions={[
            '이런, 아직 공지가 없어요.',
            '금방 새로운 소식으로 찾아올게요!',
          ]}
        />
      )}
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
