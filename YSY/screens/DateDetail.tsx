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

  const emitFavorite = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    await setFavorite();

    // throttle 적용
    setTimeout(() => {
      setLoading(false);
    }, 500);
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

  const getDateDetail = useCallback(async () => {
    console.log(detailId);

    const response = {
      id: 6,
      contentId: '123456',
      contentTypeId: 39,
      areaCode: 1,
      sigunguCode: 1,
      view: 123456,
      title: '대상해',
      description:
        '코리아나호텔 3층에 위치한 대상해는 사천식에 북경식을 가미한 독특한 북경 사천요리를 즐길 수 있고, 산지에서 직수입한 샥스핀 요리가 일품인 중식당이다. 30년 이상 경력을 가진 주방장의 손맛을 그대로 느낄 수 있는 샥스핀 요리 이외에도 보양식인 불도장이 있으며 드시는 분들에게 복을 준다는 전가복요리가 대표적이다. 그리고 대상해에서만 있는 것으로 평소 등소평이 장수 음식으로 즐겨 먹었던 마파두부와 딴딴면이 있다. 고급스러운 인테리어와 태평로가 내려다보이는 훌륭한 전망과 크고 작은 룸들이 준비되어 있어 상견례나 비즈니스 미팅, 세미나 및 가족모임까지 다양한 모임의 장소로도 많이 쓰이고 있으며, 호텔에 투숙하는 고객들도 많이 찾는 곳이다. 코리나아호텔의 장애인용 화장실과 엘리베이터를 이용할 수 있어 편리하다.',
      thumbnails: [
        'http://tong.visitkorea.or.kr/cms/resource/46/1290346_image2_1.jpg',
        'http://tong.visitkorea.or.kr/cms/resource/38/1290338_image2_1.jpg',
        'http://tong.visitkorea.or.kr/cms/resource/40/1290340_image2_1.jpg',
      ],
      address: '서울특별시 중구 세종대로 135',
      mapX: '57.456',
      mapY: '57.456',
      phoneNumber: '02-2171-7869',
      babyCarriage: '없음',
      pet: '불가',
      useTime: '11:30~22:00 (브레이크타임 15:00~17:00)',
      parking: '없음',
      restDate: '연중무휴',
      homepage: 'https://sushikaisinofsato.modoo.at',
      tags: [
        '서울',
        '상봉동',
        '정통 이타리안 요리',
        '노래방',
        '주차가능',
        '펫 보관 가능',
        '언제나',
        '환영',
        '라쿠니차',
      ],
      favoriteCount: 1234,
      isFavorite: true,
    };

    setDateInfo(response);
  }, [detailId]);

  useEffect(() => {
    getDateDetail();
  }, [detailId, getDateDetail]);

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
