import React, { useState, useEffect } from 'react';
import { Dimensions, StyleSheet, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { globalStyles } from '../style/global';
import { SettingsNavType } from '../navigation/NavTypes';

import { FAQ } from '../types/faq';

import InquirySVG from '../assets/icons/inquiry.svg';
import InquiryHistorySVG from '../assets/icons/inquiry_history.svg';
import QuestionMarkSVG from '../assets/icons/question.svg';
import ArrowRightSVG from '../assets/icons/arrow_right_gray.svg';

import BackHeader from '../components/BackHeader';
import CustomText from '../components/CustomText';

const { width } = Dimensions.get('window');

const fetchFAQ = async () => {
  const response: FAQ[] = [
    {
      faqId: 1,
      title: '어떻게 사용하는 건가요?',
      contents: `
        <div style='marginBottom: 5'>YSY는 어쩌구 저쩌구 기능들을 사용할 수 있는 어쩌구 저쩌구 어플리케이션입니다.</div>
        <div>어쩌구 저쩌구에 대해서 알아볼게요.</div>
        <ul>
          <li>어쩌구 저쩌구의 시스템</li>
          <li>저쩌구 어쩌구의 시스템</li>
          <ul>
            <li>이러한 시스템 1</li>
            <li>이러한 시스템 2</li>
          </ul>
        </ul>
      `,
      createdTime: '2023-02-08 05:08:37',
    },
    {
      faqId: 2,
      title: '어떻게 사용하는 건가요?',
      contents: `
        <div style='marginBottom: 5'>YSY는 어쩌구 저쩌구 기능들을 사용할 수 있는 어쩌구 저쩌구 어플리케이션입니다.</div>
        <div>어쩌구 저쩌구에 대해서 알아볼게요.</div>
        <ul>
          <li>어쩌구 저쩌구의 시스템</li>
          <li>저쩌구 어쩌구의 시스템</li>
          <ul>
            <li>이러한 시스템 1</li>
            <li>이러한 시스템 2</li>
          </ul>
        </ul>
      `,
      createdTime: '2023-02-08 05:08:37',
    },
    {
      faqId: 3,
      title: '어떻게 사용하는 건가요?',
      contents: `
        <div style='marginBottom: 5'>YSY는 어쩌구 저쩌구 기능들을 사용할 수 있는 어쩌구 저쩌구 어플리케이션입니다.</div>
        <div>어쩌구 저쩌구에 대해서 알아볼게요.</div>
        <ul>
          <li>어쩌구 저쩌구의 시스템</li>
          <li>저쩌구 어쩌구의 시스템</li>
          <ul>
            <li>이러한 시스템 1</li>
            <li>이러한 시스템 2</li>
          </ul>
        </ul>
      `,
      createdTime: '2023-02-08 05:08:37',
    },
    {
      faqId: 4,
      title: '어떻게 사용하는 건가요?',
      contents: `
        <div style='marginBottom: 5'>YSY는 어쩌구 저쩌구 기능들을 사용할 수 있는 어쩌구 저쩌구 어플리케이션입니다.</div>
        <div>어쩌구 저쩌구에 대해서 알아볼게요.</div>
        <ul>
          <li>어쩌구 저쩌구의 시스템</li>
          <li>저쩌구 어쩌구의 시스템</li>
          <ul>
            <li>이러한 시스템 1</li>
            <li>이러한 시스템 2</li>
          </ul>
        </ul>
      `,
      createdTime: '2023-02-08 05:08:37',
    },
    {
      faqId: 5,
      title: '어떻게 사용하는 건가요?',
      contents: `
        <div style='marginBottom: 5'>YSY는 어쩌구 저쩌구 기능들을 사용할 수 있는 어쩌구 저쩌구 어플리케이션입니다.</div>
        <div>어쩌구 저쩌구에 대해서 알아볼게요.</div>
        <ul>
          <li>어쩌구 저쩌구의 시스템</li>
          <li>저쩌구 어쩌구의 시스템</li>
          <ul>
            <li>이러한 시스템 1</li>
            <li>이러한 시스템 2</li>
          </ul>
        </ul>
      `,
      createdTime: '2023-02-08 05:08:37',
    },
  ];

  return response;
};

const ServiceCenter = () => {
  const navigation = useNavigation<StackNavigationProp<SettingsNavType>>();

  const [faq, setFaq] = useState<FAQ[] | null>(null);

  const getFAQ = async () => {
    const response: FAQ[] = await fetchFAQ();

    setFaq(response);
  };

  const moveInquiry = () => {
    navigation.navigate('Inquiry');
  };

  const moveInquiryHistory = () => {
    navigation.navigate('InquiryHistory');
  };

  const moveFAQ = (info: FAQ) => {
    navigation.navigate('FAQ', {
      info,
    });
  };

  useEffect(() => {
    getFAQ();
  }, []);

  return (
    <View>
      <BackHeader style={globalStyles.plpr20} />
      <View style={[globalStyles.plpr20, styles.btnBox]}>
        <Pressable style={[styles.btn, styles.mr30]} onPress={moveInquiry}>
          <InquirySVG />
          <CustomText size={16} weight="regular">
            문의하기
          </CustomText>
        </Pressable>
        <Pressable style={styles.btn} onPress={moveInquiryHistory}>
          <InquiryHistorySVG />
          <CustomText size={16} weight="regular">
            문의내역
          </CustomText>
        </Pressable>
      </View>
      <View style={[globalStyles.plpr20, styles.faqBox]}>
        <CustomText size={22} weight="medium" style={styles.title}>
          자주 묻는 질문
        </CustomText>
        {faq &&
          faq.map((item: FAQ, index: number) => (
            <Pressable
              style={[
                styles.faq,
                index !== faq.length - 1 ? styles.mb10 : null,
              ]}
              onPress={() => {
                moveFAQ(item);
              }}
              key={index}>
              <QuestionMarkSVG
                style={styles.questionMark}
                width={15}
                height={15}
              />
              <CustomText size={16} weight="regular" style={styles.faqTitle}>
                {item.title}
              </CustomText>
              <ArrowRightSVG />
            </Pressable>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  btnBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    paddingVertical: 30,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
  },
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    // 100 = 양 옆 padding 40 + 간격 30
    width: (width - 70) / 2,
    paddingVertical: 20,
    borderRadius: 5,
    backgroundColor: '#F9F9F9',
  },
  faqBox: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
  },
  title: {
    marginBottom: 10,
  },
  faq: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  questionMark: {
    marginRight: 10,
  },
  faqTitle: {
    flex: 1,
    top: -1,
  },
  mb10: {
    marginBottom: 10,
  },
  mr30: {
    marginRight: 30,
  },
});

export default ServiceCenter;
