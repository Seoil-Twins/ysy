import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import BackHeader from '../components/BackHeader';
import InquiryAccord from '../components/InquiryAccord';

import { globalStyles } from '../style/global';
import { Inquiry } from '../types/inquiry';

const fetchInquiry = async () => {
  const response: Inquiry[] = [
    {
      inquireId: 1,
      userId: 1,
      title: '문의 제목 1',
      contents: `
        <div>아니 왜 안 돼요?</div>
        <div>장난합니까?</div>
        <div>사진 첨부합니다.</div>
        <br />
        <img src="https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg" />
      `,
      solution: {
        solutionId: 1,
        title: 'ㅇㅇ 인정합니다.',
        contents: `
          <div>안녕하세요 YSY입니다.</div>
          <div>떼 쓰지 마세요.</div>
          <div>저도 사진 첨부할게요.</div>
          <br />
          <img src="https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg" />
        `,
        createdTime: '2023-02-08 05:03:24',
      },
      createdTime: '2023-02-08 05:03:24',
    },
    {
      inquireId: 2,
      userId: 1,
      title: '문의 제목 2',
      contents: `
        <div>아니 왜 안 돼요?</div>
        <div>장난합니까?</div>
        <div>사진 첨부합니다.</div>
        <br />
        <img src="https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg" />
      `,
      solution: {
        solutionId: 2,
        title: 'ㅇㅇ 인정합니다.',
        contents: `
          <div>안녕하세요 YSY입니다.</div>
          <div>떼 쓰지 마세요.</div>
        `,
        createdTime: '2023-02-08 05:03:24',
      },
      createdTime: '2023-02-08 05:03:24',
    },
    {
      inquireId: 3,
      userId: 1,
      title: '문의 제목 3',
      contents: `
        <div>아니 왜 안 돼요?</div>
        <div>장난합니까?</div>
        <div>사진 첨부합니다.</div>
        <br />
        <img src="https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg" />
      `,
      createdTime: '2023-02-08 05:03:24',
    },
    {
      inquireId: 4,
      userId: 1,
      title: '문의 제목 4',
      contents: `
        <div>아니 왜 안 돼요?</div>
      `,
      createdTime: '2023-02-08 05:03:24',
    },
    {
      inquireId: 5,
      userId: 1,
      title: '문의 제목 5',
      contents: `
        <div>ㅎㅇ?</div>
      `,
      createdTime: '2023-02-08 05:03:24',
    },
  ];

  return response;
};

const InquiryHistory = () => {
  const [inquiries, setInquiries] = useState<Inquiry[] | null>(null);

  const getInquiry = async () => {
    const response: Inquiry[] = await fetchInquiry();
    setInquiries(response);
  };

  useEffect(() => {
    getInquiry();
  }, []);

  return (
    <View style={styles.container}>
      <BackHeader style={globalStyles.plpr20} />
      <ScrollView
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        {inquiries &&
          inquiries.map((inquiry: Inquiry) => (
            <InquiryAccord
              key={inquiry.inquireId}
              title={inquiry.title}
              content={inquiry.contents}
              solution={inquiry.solution}
              createdTime={inquiry.createdTime}
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

export default InquiryHistory;
