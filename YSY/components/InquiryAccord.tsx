import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, Image } from 'react-native';
import Modal from 'react-native-modal';
import ImageViewer from 'react-native-image-zoom-viewer';

import CustomText from './CustomText';
import RenderHtml from './RenderHtml';

import ArrowUpSVG from '../assets/icons/expand_less.svg';
import ArrowDownSVG from '../assets/icons/expand_more.svg';

import { globalStyles } from '../style/global';
import { Solution } from '../types/solution';
import { InquiryImage } from '../types/inquiryImage';

type InquiryAccordProps = {
  title: string;
  content: string;
  inquireImages?: InquiryImage[];
  solution?: Solution;
  createdTime: string;
};

const InquiryAccord: React.FC<InquiryAccordProps> = ({
  title,
  content,
  inquireImages,
  solution,
  createdTime,
}) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [activeIdx, setActiveIdx] = useState<number | undefined>(undefined);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const onPressMore = () => {
    setIsActive(!isActive);
  };

  const onPressImg = (index: number) => {
    setActiveIdx(index);
  };

  const openModal = () => {
    setIsVisible(true);
  };

  const closeModal = () => {
    setIsVisible(false);
    setActiveIdx(undefined);
  };

  useEffect(() => {
    if (activeIdx !== undefined) {
      openModal();
    }
  }, [activeIdx]);

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
        <View style={[styles.questionBox, globalStyles.plpr20]}>
          <CustomText size={16} weight="medium" style={styles.mark}>
            Q.
          </CustomText>
          <CustomText size={16} weight="medium">
            {title}
          </CustomText>
          <CustomText size={14} weight="regular" style={styles.content}>
            {content}
          </CustomText>
          {inquireImages && (
            <View style={styles.imageBox}>
              {inquireImages.map((image: InquiryImage, index: number) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    onPressImg(index);
                  }}>
                  <Image
                    source={{ uri: image.image }}
                    width={60}
                    height={60}
                    resizeMode="cover"
                    style={[index !== inquireImages.length ? styles.mr5 : null]}
                  />
                </Pressable>
              ))}
            </View>
          )}
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
      {inquireImages && (
        <Modal
          isVisible={isVisible}
          onBackButtonPress={closeModal}
          onBackdropPress={closeModal}
          backdropTransitionOutTiming={0}
          style={{ margin: 0 }}>
          <ImageViewer
            imageUrls={inquireImages.map((img: InquiryImage) => {
              return { url: img.image };
            })}
            index={activeIdx}
          />
        </Modal>
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
  questionBox: {
    paddingVertical: 20,
    backgroundColor: '#F2F6FF',
  },
  content: {
    marginBottom: 10,
  },
  imageBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mr5: {
    marginRight: 5,
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
  closeHeader: {
    height: 48,
    backgroundColor: 'transparent',
  },
  fullscreen: {
    flex: 1,
  },
});

export default InquiryAccord;
