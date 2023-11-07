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

  const newInquiryList: Inquiry[] = [];

  for (const inquiry of res.inquires!) {
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
    newInquiryList.push(newInquiry);
  }

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
