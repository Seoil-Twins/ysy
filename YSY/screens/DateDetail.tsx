import React, { useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  Pressable,
  Image,
  Animated,
  Linking,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import KakaoShareLink from 'react-native-kakao-share-link';

import { Date } from '../types/date';

import LoveNoneSVG from '../assets/icons/love_none.svg';
import LoveActiveSVG from '../assets/icons/love_active.svg';
import ShareSVG from '../assets/icons/share.svg';
import ExpandMoreSVG from '../assets/icons/expand_more.svg';
import PhoneSVG from '../assets/icons/phone.svg';
import ClockSVG from '../assets/icons/clock.svg';
import EtcSVG from '../assets/icons/info.svg';

import CustomText from '../components/CustomText';

import { globalStyles } from '../style/global';

import { DateDetailItem } from '../components/DateDetailItem';

const width = Dimensions.get('window').width;
const IconSize = 18;
const InfoIconSize = 15;

type DateDetailProps = {
  place: Date;
  onPressFavorite: (id: number, isFavorite: boolean) => void;
};

const DateDetail: React.FC<DateDetailProps> = ({ place, onPressFavorite }) => {
  const [isOpenDesc, setIsOpenDesc] = useState<boolean>(false);
  const [numberOfLine, setNumberOfLine] = useState<number>(3);
  const [rotation] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState<boolean>(false);

  const rotateAnimation = () => {
    Animated.timing(rotation, {
      toValue: isOpenDesc ? 0 : 180,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const rotateTransform = rotation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const emitFavorite = async () => {
    if (loading) {
      return;
    }
    setLoading(true);

    onPressFavorite(place.id, place.isFavorite);

    // throttle 적용
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const onPressShare = async () => {
    await KakaoShareLink.sendFeed({
      content: {
        title: place.title,
        imageUrl: place.thumbnails[0],
        link: {
          webUrl: 'https://developers.kakao.com/',
          mobileWebUrl: 'https://developers.kakao.com/',
        },
        description: place.description,
      },
      buttons: [
        {
          title: '상세보기',
          link: {
            androidExecutionParams: [
              { key: 'screen', value: 'Date' },
              {
                key: 'detailId',
                value: String(place.id),
              },
            ],
          },
        },
      ],
    });
  };

  const onPressExpandMore = () => {
    if (isOpenDesc) {
      setNumberOfLine(3);
    } else {
      setNumberOfLine(999);
    }

    rotateAnimation();
    setIsOpenDesc(!isOpenDesc);
  };

  const moveCall = () => {
    Linking.openURL(`tel:${place.phoneNumber}`);
  };

  const moveHomepage = () => {
    Linking.openURL(place.homepage);
  };

  return (
    <View style={styles.container}>
      <Carousel
        loop
        width={width}
        height={(width / 2) * 1.2}
        autoPlay={false}
        scrollAnimationDuration={1000}
        data={place.thumbnails}
        pagingEnabled={true}
        renderItem={({ item }) => (
          <View style={styles.container}>
            <Image
              source={{ uri: item }}
              style={styles.img}
              resizeMode="contain"
            />
          </View>
        )}
      />
      <View style={[globalStyles.plpr20, styles.contentBox]}>
        <View style={styles.titleBox}>
          <CustomText size={24} weight="medium">
            {place.title}
          </CustomText>
          <View style={styles.funcBox}>
            <Pressable onPress={emitFavorite} style={styles.favorite}>
              {place.isFavorite ? (
                <LoveActiveSVG width={IconSize} height={IconSize} />
              ) : (
                <LoveNoneSVG width={IconSize} height={IconSize} />
              )}
              <CustomText size={12} weight="regular" color="#BBBBBB">
                {place.favoriteCount}
              </CustomText>
            </Pressable>
            <Pressable onPress={onPressShare} style={styles.share}>
              <ShareSVG width={IconSize} height={IconSize} />
            </Pressable>
          </View>
        </View>
        <View style={styles.descriptionBox}>
          <CustomText
            size={16}
            weight="regular"
            color="#999999"
            numberOfLine={numberOfLine}
            style={styles.description}>
            {place.description}
          </CustomText>
          <Pressable onPress={onPressExpandMore} style={styles.expandImg}>
            <Animated.View
              style={[
                styles.expandMore,
                {
                  transform: [{ rotate: rotateTransform }],
                },
              ]}>
              <ExpandMoreSVG width={23} height={23} />
            </Animated.View>
          </Pressable>
        </View>
        <View>
          <View style={styles.infoItem}>
            <View style={styles.infoTitleBox}>
              <PhoneSVG
                style={styles.infoImg}
                width={InfoIconSize}
                height={InfoIconSize}
              />
              <CustomText size={16} weight="medium">
                예약하기 / 문의하기
              </CustomText>
            </View>
            <Pressable onPress={moveCall}>
              <CustomText size={16} weight="regular" style={styles.infoText}>
                {place.phoneNumber}
              </CustomText>
            </Pressable>
          </View>
          {place.useTime ? (
            <View style={styles.infoItem}>
              <View style={styles.infoTitleBox}>
                <ClockSVG
                  style={styles.infoImg}
                  width={InfoIconSize}
                  height={InfoIconSize}
                />
                <CustomText size={16} weight="medium">
                  예약시간
                </CustomText>
              </View>
              <CustomText size={16} weight="regular" style={styles.infoText}>
                {place.useTime}
              </CustomText>
            </View>
          ) : null}
          {place.homepage ? (
            <View style={styles.infoItem}>
              <View style={styles.infoTitleBox}>
                <ClockSVG
                  style={styles.infoImg}
                  width={InfoIconSize}
                  height={InfoIconSize}
                />
                <CustomText size={16} weight="medium">
                  홈페이지
                </CustomText>
              </View>
              <Pressable onPress={moveHomepage}>
                <CustomText size={16} weight="regular">
                  바로가기
                </CustomText>
              </Pressable>
            </View>
          ) : null}
          <View style={[styles.etcItem]}>
            <View style={styles.infoTitleBox}>
              <EtcSVG
                style={styles.infoImg}
                width={InfoIconSize}
                height={InfoIconSize}
              />
              <CustomText size={16} weight="medium">
                기타정보
              </CustomText>
            </View>
            <DateDetailItem item={place} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
  },
  img: {
    width: width,
    height: width * 0.6,
    backgroundColor: '#EEEEEE',
  },
  contentBox: {
    marginTop: 10,
  },
  titleBox: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  funcBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favorite: {
    alignItems: 'center',
    marginRight: 12,
  },
  share: {
    marginBottom: 13,
  },
  descriptionBox: {
    alignItems: 'center',
    marginBottom: 30,
  },
  description: {
    marginTop: 10,
  },
  expandMore: {
    marginTop: 10,
  },
  expandImg: {
    width: width,
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    marginBottom: 10,
  },
  infoText: {
    width: width / 2,
    textAlign: 'right',
  },
  infoImg: {
    marginRight: 10,
  },
  etcItem: {
    marginBottom: 20,
  },
});

export default DateDetail;
