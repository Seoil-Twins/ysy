import React, { useState } from 'react';
import { Dimensions, StyleSheet, View, Pressable } from 'react-native';
import { RenderHTML, defaultSystemFonts } from 'react-native-render-html';

import CustomText from './CustomText';

import ArrowUpSVG from '../assets/icons/expand_less.svg';
import ArrowDownSVG from '../assets/icons/expand_more.svg';

import { globalStyles } from '../style/global';

const { width } = Dimensions.get('window');
const systemFonts = [...defaultSystemFonts, 'NotoSansKR-Regular'];

type NoticeAccordProps = {
  title: string;
  content: string;
  createdTime: string;
};

const NoticeAccord: React.FC<NoticeAccordProps> = ({
  title,
  content,
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
          <CustomText size={14} weight="regular" color="#CCCCCC">
            {createdTime.toString()}
          </CustomText>
        </View>
        {isActive ? (
          <ArrowUpSVG width={20} height={20} />
        ) : (
          <ArrowDownSVG width={20} height={20} />
        )}
      </Pressable>
      {isActive && (
        <View style={[styles.content, globalStyles.plpr20]}>
          <RenderHTML
            contentWidth={width}
            source={{ html: content }}
            baseStyle={{ fontFamily: 'NotoSansKR-Regular' }}
            systemFonts={systemFonts}
          />
        </View>
      )}
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
});

export default NoticeAccord;
