import React, { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';

import CustomText from './CustomText';
import RenderHtml from './RenderHtml';

import ArrowUpSVG from '../assets/icons/expand_less.svg';
import ArrowDownSVG from '../assets/icons/expand_more.svg';

import { globalStyles } from '../style/global';
import { Solution } from '../types/solution';

type InquiryAccordProps = {
  title: string;
  content: string;
  solution?: Solution;
  createdTime: string;
};

const InquiryAccord: React.FC<InquiryAccordProps> = ({
  title,
  content,
  solution,
  createdTime,
}) => {
  const [isActive, setIsActive] = useState<boolean>(false);

  const onPressMore = () => {
    setIsActive(!isActive);
  };

  return (
    <View>
      <Pressable
        style={[styles.titleBox, globalStyles.plpr20]}
        onPress={onPressMore}>
        <View>
          <CustomText size={18} weight="regular">
            {title}
          </CustomText>
          <View style={styles.bottom}>
            <CustomText
              size={14}
              weight="regular"
              color="#CCCCCC"
              style={styles.createdTime}>
              {createdTime.toString()}
            </CustomText>
            <CustomText
              size={14}
              weight="regular"
              color={solution ? '#3675FB' : '#CCCCCC'}>
              {solution ? '답변완료' : '접수중'}
            </CustomText>
          </View>
        </View>
        {isActive ? (
          <ArrowUpSVG width={20} height={20} />
        ) : (
          <ArrowDownSVG width={20} height={20} />
        )}
      </Pressable>
      {isActive && (
        <View style={[styles.content, globalStyles.plpr20]}>
          <CustomText size={16} weight="medium" style={styles.mark}>
            Q.
          </CustomText>
          <RenderHtml html={content} />
        </View>
      )}
      {isActive && solution ? (
        <View style={[styles.solution, globalStyles.plpr20]}>
          <CustomText size={16} weight="medium">
            A.
          </CustomText>
          <RenderHtml html={solution.contents} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  titleBox: {
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    paddingVertical: 20,
    backgroundColor: '#F2F6FF',
  },
  solution: {
    paddingVertical: 20,
    backgroundColor: '#E4EAF6',
  },
  bottom: {
    flexDirection: 'row',
  },
  createdTime: {
    marginRight: 10,
  },
  mark: {
    marginBottom: 5,
  },
});

export default InquiryAccord;
