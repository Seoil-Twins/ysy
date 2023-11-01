import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import { globalStyles } from '../style/global';
import { Inquiry } from '../types/inquiry';

import InfoSVG from '../assets/icons/info.svg';

import BackHeader from '../components/BackHeader';
import InquiryAccord from '../components/InquiryAccord';
import NoItem from '../components/NoItem';
import { inquiryAPI } from '../apis/inquiryAPI';

const errorDesc = [
  '문의 내역이 없습니다.',
  '문의사항이 있다면 문의를 남겨주세요.',
];

const fetchInquiry = async () => {
  const data = { count: 10, page: 1 };
  const res = await inquiryAPI.getInquiry(data);
  console.log(res.inquires[0].solution);

  const newInquiryList: Inquiry[] = [];

  for (const inquiry of res.inquires!) {
    console.log('===========================================================');
    const newInquiry: Inquiry = {
      inquireId: inquiry.inquiryId,
      userId: inquiry.userId,
      title: inquiry.title,
      contents: inquiry.contents,
      inquireImages: inquiry.inquiryImages ? inquiry.inquiryImages : undefined,
      solution: inquiry.solution
        ? {
            solutionId: inquiry.solution.solutionId,
            title: inquiry.solution.title,
            contents: inquiry.solution.contents,
            createdTime: inquiry.solution.createdTime,
          }
        : undefined,
      createdTime: inquiry.createdTime,
    };
    console.log('===========================================================');
    console.log(newInquiry);
    newInquiryList.push(newInquiry);
  }

  // const response: Inquiry[] = [
  //   {
  //     inquireId: 1,
  //     userId: 1,
  //     title: '문의 제목 1',
  //     contents: '아니 왜 안 돼요?\n장난합니까?\n사진 첨부합니다.',
  //     inquireImages: [
  //       {
  //         imageId: 1,
  //         image:
  //           'https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg',
  //         createdTime: '2023-02-08 05:03:24',
  //       },
  //       {
  //         imageId: 2,
  //         image:
  //           'https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg',
  //         createdTime: '2023-02-08 05:03:24',
  //       },
  //       {
  //         imageId: 3,
  //         image:
  //           'https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg',
  //         createdTime: '2023-02-08 05:03:24',
  //       },
  //     ],
  //     solution: {
  //       solutionId: 1,
  //       title: 'ㅇㅇ 인정합니다.',
  //       contents: `
  //         <div>안녕하세요 YSY입니다.</div>
  //         <div>떼 쓰지 마세요.</div>
  //         <div>저도 사진 첨부할게요.</div>
  //         <br />
  //         <img src="https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg">
  //       `,
  //       createdTime: '2023-02-08 05:03:24',
  //     },
  //     createdTime: '2023-02-08 05:03:24',
  //   },
  //   {
  //     inquireId: 2,
  //     userId: 1,
  //     title: '문의 제목 2',
  //     contents: '아니 왜 안 돼요?\n장난합니까?\n사진 첨부합니다.',
  //     inquireImages: [
  //       {
  //         imageId: 1,
  //         image:
  //           'https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg',
  //         createdTime: '2023-02-08 05:03:24',
  //       },
  //     ],
  //     solution: {
  //       solutionId: 2,
  //       title: 'ㅇㅇ 인정합니다.',
  //       contents: `
  //         <div>안녕하세요 YSY입니다.</div>
  //         <div>떼 쓰지 마세요.</div>
  //       `,
  //       createdTime: '2023-02-08 05:03:24',
  //     },
  //     createdTime: '2023-02-08 05:03:24',
  //   },
  //   {
  //     inquireId: 3,
  //     userId: 1,
  //     title: '문의 제목 3',
  //     contents: '아니 왜 안 돼요?\n장난합니까?\n사진 첨부합니다.',
  //     createdTime: '2023-02-08 05:03:24',
  //   },
  //   {
  //     inquireId: 4,
  //     userId: 1,
  //     title: '문의 제목 4',
  //     contents: '아니 왜 안 돼요?',
  //     createdTime: '2023-02-08 05:03:24',
  //   },
  //   {
  //     inquireId: 5,
  //     userId: 1,
  //     title: '문의 제목 5',
  //     contents: 'ㅎㅇㅋㅋ\nㅂㅇㅋㅋ\n누구세요?',
  //     createdTime: '2023-02-08 05:03:24',
  //   },
  // ];

  return newInquiryList;
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
      {inquiries?.length ? (
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
                inquireImages={inquiry.inquireImages}
                solution={inquiry.solution}
                createdTime={inquiry.createdTime}
              />
            ))}
        </ScrollView>
      ) : (
        <NoItem icon={InfoSVG} descriptions={errorDesc} />
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

export default InquiryHistory;
