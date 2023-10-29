import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  Pressable,
  Image,
  Animated,
  Linking,
  ScrollView,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import KakaoShareLink from 'react-native-kakao-share-link';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useDebouncedCallback } from 'use-debounce';

import { Date } from '../types/date';
import { DateNavType } from '../navigation/NavTypes';

import LoveNoneSVG from '../assets/icons/love_none.svg';
import LoveActiveSVG from '../assets/icons/love_active.svg';
import ShareSVG from '../assets/icons/share.svg';
import ExpandMoreSVG from '../assets/icons/expand_more.svg';
import PhoneSVG from '../assets/icons/phone.svg';
import ClockSVG from '../assets/icons/clock.svg';
import EtcSVG from '../assets/icons/info.svg';

import CustomText from '../components/CustomText';
import DateDetailItem from '../components/DateDetailItem';
import BackHeader from '../components/BackHeader';

import { globalStyles } from '../style/global';
import { getObjectData, storeObjectData } from '../util/asyncStorage';
import { dateAPI } from '../apis/dateAPI';

const width = Dimensions.get('window').width;
const IconSize = 18;
const InfoIconSize = 15;

const DateDetail = () => {
  const { params } = useRoute<RouteProp<DateNavType, 'DateDetail'>>();

  const [detailId] = useState<number>(params.dateId);
  const [dateInfo, setDateInfo] = useState<Date>();
  const [isOpenDesc, setIsOpenDesc] = useState<boolean>(false);
  const [numberOfLine, setNumberOfLine] = useState<number>(3);
  const [rotation] = useState(new Animated.Value(0));

  const getDateDetail = useCallback(async () => {
    const dp = await dateAPI.getDateOne(detailId);

    const response: Date = {
      id: Math.random(),
      contentId: dp.contentId ? dp.contentId : 'null',
      contentTypeId: dp.contentTypeId ? dp.contentTypeId : 'null',
      areaCode: dp.areaCode ? dp.areaCode : 'null',
      sigunguCode: dp.sigunguCode ? dp.sigunguCode : 'null',
      view: dp.views ? dp.views : 'null',
      title: dp.title ? dp.title : 'null',
      description: dp.description ? dp.description : 'null',
      thumbnails: [dp.thumbnail]
        ? [dp.thumbnail]
        : ['https://dummyimage.com/600x400/000/fff'],
      address: dp.address ? dp.address : 'null',
      mapX: dp.mapX ? dp.mapX : 'null',
      mapY: dp.mapY ? dp.mapY : 'null',
      phoneNumber: dp.phoneNumber ? dp.phoneNumber : 'null',
      babyCarriage: dp.babyCarriage ? dp.babyCarriage : 'null',
      pet: dp.pet ? dp.pet : 'null',
      useTime: dp.useTime ? dp.useTime : 'null',
      parking: dp.parking ? dp.parking : 'null',
      restDate: dp.restDate ? dp.restDate : 'null',
      homepage: dp.homepage ? dp.homepage : 'null',
      tags: ['unused'],
      favoriteCount: 1234,
      isFavorite: false,
    };

    console.log(response);
    setDateInfo(response);
  }, [detailId]);

  const emitFavorite = useDebouncedCallback(async () => {
    await setFavorite();
  }, 500);

  const addHistory = useCallback(async () => {
    console.log(
      '=================================================================================3호기',
    );
    const historys = await getObjectData('dateHistory');
    console.log(
      '=================================================================================3.5호기',
    );

    if (historys) {
      console.log(
        '=================================================================================3.6호기',
      );
      const newItems = [...historys];
      newItems.push(detailId);
      await storeObjectData('dateHistory', newItems);
    } else {
      console.log(
        '=================================================================================3.6호기',
      );
      await storeObjectData('dateHistory', [detailId]);
    }
    console.log(
      '=================================================================================4호기',
    );
  }, [detailId]);

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

  const setFavorite = async () => {
    if (!dateInfo) {
      return;
    }

    const response = {
      statusCode: 204,
    };

    if (response.statusCode === 204) {
      const obj: Date = {
        ...dateInfo,
        isFavorite: !dateInfo.isFavorite,
        favoriteCount: !dateInfo.isFavorite
          ? dateInfo.favoriteCount + 1
          : dateInfo.favoriteCount - 1,
      };

      setDateInfo(obj);
    }
  };

  const onPressShare = async () => {
    if (!dateInfo) {
      return;
    }

    const androidExecutionParams = [
      { key: 'screen', value: 'DateDetail' },
      {
        key: 'dateId',
        value: String(dateInfo.id),
      },
    ];
    const iosExecutionParams = [
      { key: 'screen', value: 'DateDetail' },
      {
        key: 'dateId',
        value: String(dateInfo.id),
      },
    ];

    await KakaoShareLink.sendFeed({
      content: {
        title: dateInfo.title,
        imageUrl: dateInfo.thumbnails[0],
        link: {
          androidExecutionParams: androidExecutionParams,
          iosExecutionParams: iosExecutionParams,
        },
        description: dateInfo.description,
      },
      buttons: [
        {
          title: '상세보기',
          link: {
            androidExecutionParams: androidExecutionParams,
            iosExecutionParams: iosExecutionParams,
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
    if (!dateInfo) {
      return;
    }

    Linking.openURL(`tel:${dateInfo.phoneNumber}`);
  };

  const moveHomepage = () => {
    if (!dateInfo) {
      return;
    }

    Linking.openURL(dateInfo.homepage);
  };

  useEffect(() => {
    addHistory();
    getDateDetail();
  }, [detailId, addHistory, getDateDetail]);

  return (
    <ScrollView style={styles.container}>
      {dateInfo ? (
        <>
          <BackHeader style={[globalStyles.plpr20, { marginBottom: 25 }]} />
          <Carousel
            loop
            width={width}
            height={(width / 2) * 1.2}
            autoPlay={false}
            scrollAnimationDuration={1000}
            data={dateInfo.thumbnails}
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
                {dateInfo.title}
              </CustomText>
              <View style={styles.funcBox}>
                <Pressable onPress={emitFavorite} style={styles.favorite}>
                  {dateInfo.isFavorite ? (
                    <LoveActiveSVG width={IconSize} height={IconSize} />
                  ) : (
                    <LoveNoneSVG width={IconSize} height={IconSize} />
                  )}
                  <CustomText size={12} weight="regular" color="#BBBBBB">
                    {dateInfo.favoriteCount}
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
                {dateInfo.description}
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
                  <CustomText
                    size={16}
                    weight="regular"
                    style={styles.infoText}>
                    {dateInfo.phoneNumber}
                  </CustomText>
                </Pressable>
              </View>
              {dateInfo.useTime ? (
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
                  <CustomText
                    size={16}
                    weight="regular"
                    style={styles.infoText}>
                    {dateInfo.useTime}
                  </CustomText>
                </View>
              ) : null}
              {dateInfo.homepage ? (
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
                <DateDetailItem item={dateInfo} />
              </View>
            </View>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
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
