// 이 페이지는 불필요한 재렌더링을 막기 위해 다음과 같은 규칙을 무시한다.
/* eslint-disable react-hooks/exhaustive-deps */

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  createRef,
} from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  View,
  FlatList,
  ScrollView,
} from 'react-native';
import { PERMISSIONS } from 'react-native-permissions';
import Geolocation, {
  GeolocationResponse,
  GeolocationError,
} from '@react-native-community/geolocation';
import axios, { AxiosRequestConfig } from 'axios';
import { KAKAO_REST_API_KEY } from '@env';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Modal from 'react-native-modal';

import DateHeader from '../components/DateHeader';
import DateViewItem from '../components/DateViewItem';
import ScrollLoading from '../components/ScrollLoading';
import DateSortItem from '../components/DateSortItem';
import DateSortActiveItem from '../components/DateSortActiveItem';

import { checkPermission, openAppSettings } from '../util/permission';

import { Date as DateType } from '../types/date';
import { DateNavType } from '../navigation/NavTypes';
import DateSortModal from '../components/DateSortModal';

type DateSortHeaderItem = {
  title: string;
  pressEvent: () => void;
};

type DateSortHeaderActiveItem = {
  title: string;
  isActive: boolean;
  pressEvent: () => void;
};

type SortItem = {
  title: string;
  value: string;
};

const { width, height } = Dimensions.get('window');

const getCitys = () => {
  const response: SortItem[] = [
    {
      title: '전체',
      value: 'A',
    },
    {
      title: '서울',
      value: 'B',
    },
    {
      title: '경기도',
      value: 'C',
    },
    {
      title: '대구',
      value: 'D',
    },
    {
      title: '부산',
      value: 'E',
    },
    {
      title: '전라남도',
      value: 'F',
    },
  ];

  return response;
};

const getSubCitys = () => {
  const response: SortItem[] = [
    {
      title: '전체',
      value: 'A',
    },
    {
      title: '강남구',
      value: 'B',
    },
    {
      title: '은평구',
      value: 'C',
    },
    {
      title: '노원구',
      value: 'D',
    },
    {
      title: '동대문구',
      value: 'E',
    },
    {
      title: '중랑구',
      value: 'F',
    },
  ];

  return response;
};

const getDateAPI = async (
  sort: string,
  address1: string,
  address2: string,
  kind: string,
  page: number,
  count: number,
) => {
  console.log(sort, address1, address2, kind, page, count);
  const response: DateType[] = [
    {
      id: Math.random(),
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
    },
    {
      id: Math.random(),
      contentId: '123456',
      contentTypeId: 39,
      areaCode: 1,
      sigunguCode: 1,
      view: 123456,
      title: '스시겐',
      description:
        '스시겐은 일본보다 더 일본다운 전통 일식의 진수를 볼 수 있는 곳이다. 이곳에는 일식집에서 손님과 마주 보고 초밥 등 회를 즉석에서 만들어 주는 두 명의 조리장이 있다. 이들의 일식 솜씨는 이미 정평이 나 있다. 당연히 설명하지 않아도 스시겐의 맛은 보장할 수 있다. 또한 가격도 저렴하고 신선도 또한 최상급이다. 특히, 지라시 초밥의 맛이 뛰어나다. 저녁에 안주를 겸할 수 있는 따끈한 짱꼬냄비와 계란찜, 튀김두부 또한 별미이다.',
      thumbnails: [
        'http://tong.visitkorea.or.kr/cms/resource/01/1288501_image2_1.jpg',
        'http://tong.visitkorea.or.kr/cms/resource/99/1288499_image2_1.jpg',
      ],
      address: '서울특별시 마포구 양화로7길 6-12',
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
      isFavorite: false,
    },
    {
      id: Math.random(),
      contentId: '123456',
      contentTypeId: 39,
      areaCode: 1,
      sigunguCode: 1,
      view: 123456,
      title: '목꾸안',
      description:
        '서울 회기역 근처에 자리한 목꾸안은 베트남 북부 하노이식 정통 요리 전문점이다. 노란색 외관부터 눈길을 사로잡는 이곳은 식당 내부도 현지에서 직접 공수한 소품과 그림들로 채워졌다. 요리사는 물론 서빙하는 직원도 현지인이고 메뉴판에도 한국어와 함께 베트남어가 쓰여 있다. 이곳의 대표 메뉴는 양지 쌀국수를 뜻하는 퍼남과 돼지 숯불구이 국수인 분짜다. 베트남식 쟁반국수인 분더우맘똥, 볶음 쌀국수인 퍼싸오, 선지 매운 쌀국수인 분보후에 등 현지의 맛을 최대한 살린 메뉴들이 입맛을 돋운다. 점심에는 식사류만 판매하지만, 저녁에는 베트남 맥주를 비롯한 다양한 맥주를 함께 판매해 하노이 맥주 거리의 분위기도 즐길 수 있다.',
      thumbnails: [
        'http://tong.visitkorea.or.kr/cms/resource/36/2792136_image2_1.jpg',
        'http://tong.visitkorea.or.kr/cms/resource/24/2792124_image2_1.jpg',
        'http://tong.visitkorea.or.kr/cms/resource/29/2792129_image2_1.jpg',
        'http://tong.visitkorea.or.kr/cms/resource/32/2792132_image2_1.jpg',
      ],
      address: '서울특별시 동대문구 회기로 135 (회기동)',
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
      isFavorite: false,
    },
    {
      id: Math.random(),
      contentId: '123456',
      contentTypeId: 39,
      areaCode: 1,
      sigunguCode: 1,
      view: 123456,
      title: '부빙',
      description:
        '[서울 종로구 부암동에 있는 빙수 전문점 부빙]\n부빙은 창의문 인근에 있는 빙수 전문점이다. 부빙은 부암동 빙수집의 약자이며, 다양한 종류의 빙수를 제공한다. 모든 메뉴는 1인 기준이며, 이 곳에서 제공하는 팥은 직접 계약 재배한다.',
      thumbnails: [
        'http://tong.visitkorea.or.kr/cms/resource/46/1290346_image2_1.jpg',
        'http://tong.visitkorea.or.kr/cms/resource/38/1290338_image2_1.jpg',
        'http://tong.visitkorea.or.kr/cms/resource/40/1290340_image2_1.jpg',
      ],
      address: '서울특별시 종로구 창의문로 136',
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
    },
    {
      id: Math.random(),
      contentId: '123456',
      contentTypeId: 39,
      areaCode: 1,
      sigunguCode: 1,
      view: 123456,
      title: '사조참치',
      description:
        '참치 마니아들로부터 사랑을 받고 있는 곳이다. 다양한 맛과 신선한 맛을 볼 수 있다는 점이 가장 큰 장점이다. 참다랑어 스페셜의 경우 최고급 부위들이 골고루 제공되고 이곳에서만 볼 수 있는 진귀한 장식이 눈길을 끈다. 또한 새치의 가마살구이와 참치 머리 찜, 참치구이와 튀김 등은 또 다른 먹는 재미를 주는 별미 중의 별미이다. 손님들에게 백년초주, 인삼 산수유주 등 직접 담근 술을 손수 따라주는 사장의 서비스도 이곳을 특별하게 만드는 이유이다.',
      thumbnails: [
        'http://tong.visitkorea.or.kr/cms/resource/12/1900512_image2_1.jpg',
        'http://tong.visitkorea.or.kr/cms/resource/10/1900510_image2_1.jpg',
        'http://tong.visitkorea.or.kr/cms/resource/11/1900511_image2_1.jpg',
      ],
      address: '서울특별시 서대문구 통일로 107-39 ',
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
    },
  ];

  return response;
};

const Date = () => {
  const sortItems: SortItem[] = [
    {
      title: '인기',
      value: 'A',
    },
    {
      title: '제목',
      value: 'B',
    },
    {
      title: '최신',
      value: 'C',
    },
  ];
  const kindItems: SortItem[] = [
    {
      title: '전체',
      value: 'A',
    },
    {
      title: '음식점',
      value: 'B',
    },
    {
      title: '문화시설',
      value: 'C',
    },
    {
      title: '관광지',
      value: 'D',
    },
    {
      title: '쇼핑',
      value: 'E',
    },
  ];
  const navigation = useNavigation<StackNavigationProp<DateNavType, 'Date'>>();

  const [citys, _setCitys] = useState<SortItem[]>(() => {
    return getCitys();
  });
  const [subCitys, _setSubCitys] = useState<SortItem[]>(() => {
    return getSubCitys();
  });

  const [sort, setSort] = useState<SortItem>({
    title: sortItems[0].title,
    value: sortItems[0].value,
  });
  const [address1, setAddress1] = useState<SortItem>({
    title: citys[0].title,
    value: citys[0].value,
  });
  const [address2, setAddress2] = useState<SortItem>({
    title: subCitys[0].title,
    value: subCitys[0].value,
  });
  const [kind, setKind] = useState<SortItem>({
    title: kindItems[0].title,
    value: kindItems[0].value,
  });
  const [isSortVisible, setIsSortVisible] = useState<boolean>(false);
  const [isAddress1Visible, setIsAddress1Visible] = useState<boolean>(false);
  const [isAddress2Visible, setIsAddress2Visible] = useState<boolean>(false);
  const [isKindVisible, setIsKindVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [dateItems, setDateItems] = useState<DateType[] | undefined>(undefined);

  const prevLatitude = useRef(latitude);
  const prevLongitude = useRef(longitude);
  const page = useRef(1);
  const count = useRef(10);
  const flatListRef = createRef<FlatList>();

  const getDate = useCallback(async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    const response = await getDateAPI(
      sort.value,
      address1.value,
      address2.value,
      kind.value,
      page.current,
      count.current,
    );

    setDateItems(response);
    page.current += 1;
    setIsLoading(false);
  }, [sort, address1, address2, kind]);

  const setMyLocation = useCallback(async () => {
    if (Platform.OS === 'android') {
      await checkPermission(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    } else if (Platform.OS === 'ios') {
      await checkPermission(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    }

    Geolocation.getCurrentPosition(successPosition, errorPosition, {
      enableHighAccuracy: true,
    });
  }, []);

  const gpsToAddress = useCallback(async () => {
    const format = 'json';
    const config: AxiosRequestConfig = {
      params: {
        x: Math.abs(longitude),
        y: Math.abs(latitude),
      },
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
      },
    };

    try {
      const response = await axios.get(
        `https://dapi.kakao.com/v2/local/geo/coord2address.${format}`,
        config,
      );

      if (response.status === 200 && response.data) {
        const address = response.data.documents[0].address;

        // address 없으면 error Modal

        handleTitleChange([
          { index: 1, newTitle: address.region_1depth_name },
          { index: 2, newTitle: address.region_2depth_name },
        ]);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  }, [latitude, longitude]);

  const onPressFavorite = useCallback((id: number, isFavorite: boolean) => {
    const response = 204;

    if (response === 204) {
      handleDateItemChange(id, !isFavorite);
    }
  }, []);

  const moreDateViews = useCallback(async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    const response: DateType[] = await getDateAPI(
      sort.value,
      address1.value,
      address2.value,
      kind.value,
      page.current,
      count.current,
    );

    setDateItems(prevItems => [...prevItems!, ...response]);

    page.current += 1;
  }, []);

  const handleTitleChange = (
    updates: { index: number; newTitle: string }[],
  ) => {
    setSortHeaderItems((prevItems: DateSortHeaderItem[]) => {
      const updatedItems = [...prevItems];

      for (const update of updates) {
        const { index, newTitle } = update;
        updatedItems[index].title = newTitle;
      }

      return updatedItems;
    });
  };

  const handlePressChange = (
    updates: { index: number; isActive: boolean }[],
  ) => {
    setSortHeaderActiveItems((prevItems: DateSortHeaderActiveItem[]) => {
      const updatedItems = [...prevItems];

      for (const update of updates) {
        const { index, isActive } = update;
        updatedItems[index].isActive = isActive;
      }

      return updatedItems;
    });
  };

  const handleDateItemChange = (id: number, isFavorite: boolean) => {
    setDateItems((prevItems: DateType[] | undefined) => {
      const updatedItems = [...prevItems!];
      const find = updatedItems.find(item => item.id === id);

      if (find) {
        find.isFavorite = isFavorite;
        find.favoriteCount = isFavorite
          ? find.favoriteCount + 1
          : find.favoriteCount - 1;
      }

      return updatedItems;
    });
  };

  const successPosition = (position: GeolocationResponse) => {
    setLatitude(position.coords.latitude);
    setLongitude(position.coords.longitude);
  };

  const errorPosition = (error: GeolocationError) => {
    if (error.PERMISSION_DENIED === -1) {
      openAppSettings();
    }
  };

  const moveDateDetail = (id: number) => {
    navigation.navigate('DateDetail', {
      dateId: id,
    });
  };

  const moveSearch = () => {
    navigation.navigate('DateSearch');
  };

  const onPressSort = () => {
    openSortModal();
  };

  const onPressAddress1 = () => {
    openAddress1Modal();
  };

  const onPressAddress2 = () => {
    openAddress2Modal();
  };

  const onPressKind = () => {
    openKindModal();
  };

  const onPressGPS = () => {
    if (!sortHeaderActiveItems[0].isActive) {
      setMyLocation();
    } else {
      getDate();
    }

    handlePressChange([
      { index: 0, isActive: !sortHeaderActiveItems[0].isActive },
    ]);
  };

  const onPressSortModal = (item: SortItem) => {
    const newSortObject = { ...item };
    const newSortHeaderObject = [...sortHeaderItems];
    newSortHeaderObject[0].title = item.title;

    setSort(newSortObject);
    setSortHeaderItems(newSortHeaderObject);
    closeSortModal();
  };

  const onPressAddress1Modal = (item: SortItem) => {
    const newSortObject = { ...item };
    const newSortHeaderObject = [...sortHeaderItems];
    newSortHeaderObject[1].title = item.title;

    setAddress1(newSortObject);
    setSortHeaderItems(newSortHeaderObject);
    closeAddress1Modal();
  };

  const onPressAddress2Modal = (item: SortItem) => {
    const newSortObject = { ...item };
    const newSortHeaderObject = [...sortHeaderItems];
    newSortHeaderObject[2].title = item.title;

    setAddress2(newSortObject);
    setSortHeaderItems(newSortHeaderObject);
    closeAddress2Modal();
  };

  const onPressKindModal = (item: SortItem) => {
    const newSortObject = { ...item };
    const newSortHeaderObject = [...sortHeaderItems];
    newSortHeaderObject[3].title = item.title;

    setKind(newSortObject);
    setSortHeaderItems(newSortHeaderObject);
    closeKindModal();
  };

  const openSortModal = () => setIsSortVisible(true);
  const closeSortModal = () => setIsSortVisible(false);
  const openAddress1Modal = () => setIsAddress1Visible(true);
  const closeAddress1Modal = () => setIsAddress1Visible(false);
  const openAddress2Modal = () => setIsAddress2Visible(true);
  const closeAddress2Modal = () => setIsAddress2Visible(false);
  const openKindModal = () => setIsKindVisible(true);
  const closeKindModal = () => setIsKindVisible(false);

  useEffect(() => {
    page.current = 1;
    if (dateItems) {
      flatListRef.current?.scrollToIndex({ index: 0, animated: false });
    }

    getDate();
  }, [getDate]);

  useEffect(() => {
    if (dateItems) {
      setIsLoading(false);
    }
  }, [dateItems]);

  useEffect(() => {
    if (
      latitude !== 0 &&
      longitude !== 0 &&
      latitude !== prevLatitude.current &&
      longitude !== prevLongitude.current
    ) {
      gpsToAddress();

      prevLatitude.current = latitude;
      prevLongitude.current = longitude;
    }
  }, [latitude, longitude, gpsToAddress]);

  const [sortHeaderItems, setSortHeaderItems] = useState<DateSortHeaderItem[]>([
    {
      title: sort.title,
      pressEvent: onPressSort,
    },
    {
      title: address1.title,
      pressEvent: onPressAddress1,
    },
    {
      title: address2.title,
      pressEvent: onPressAddress2,
    },
    {
      title: kind.title,
      pressEvent: onPressKind,
    },
  ]);

  const [sortHeaderActiveItems, setSortHeaderActiveItems] = useState<
    DateSortHeaderActiveItem[]
  >([
    {
      title: '내 위치 기반',
      pressEvent: onPressGPS,
      isActive: false,
    },
  ]);

  return (
    <View style={styles.container}>
      <DateHeader onPress={moveSearch} />
      <View style={styles.subHeader}>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}>
          {sortHeaderItems &&
            sortHeaderItems.map((item, idx) => (
              <DateSortItem
                key={`item${idx}`}
                title={item.title}
                onPress={item.pressEvent}
              />
            ))}
          {sortHeaderActiveItems &&
            sortHeaderActiveItems.map((item, idx) => (
              <DateSortActiveItem
                key={`activeItem${idx}`}
                title={item.title}
                onPress={item.pressEvent}
                isActive={item.isActive}
              />
            ))}
        </ScrollView>
      </View>
      <FlatList
        ref={flatListRef}
        data={dateItems}
        extraData={isLoading}
        keyExtractor={item => String(item.id)}
        onEndReached={moreDateViews}
        onEndReachedThreshold={0.4}
        renderItem={({ item }) => (
          <DateViewItem
            item={item}
            onPressDetail={moveDateDetail}
            onPressFavorite={onPressFavorite}
          />
        )}
        ListFooterComponent={isLoading ? <ScrollLoading height={50} /> : null}
      />
      <Modal
        isVisible={isSortVisible}
        onBackdropPress={closeSortModal}
        onBackButtonPress={closeSortModal}
        deviceWidth={width}
        deviceHeight={height}
        style={styles.bottomModal}>
        <DateSortModal
          title="정렬"
          items={sortItems}
          active={sort}
          onPress={onPressSortModal}
        />
      </Modal>
      <Modal
        isVisible={isAddress1Visible}
        onBackdropPress={closeAddress1Modal}
        onBackButtonPress={closeAddress1Modal}
        deviceWidth={width}
        deviceHeight={height}
        style={styles.bottomModal}>
        <DateSortModal
          title="도시"
          items={citys}
          active={address1}
          onPress={onPressAddress1Modal}
        />
      </Modal>
      <Modal
        isVisible={isAddress2Visible}
        onBackdropPress={closeAddress2Modal}
        onBackButtonPress={closeAddress2Modal}
        deviceWidth={width}
        deviceHeight={height}
        style={styles.bottomModal}>
        <DateSortModal
          title="시군구"
          items={subCitys}
          active={address2}
          onPress={onPressAddress2Modal}
        />
      </Modal>
      <Modal
        isVisible={isKindVisible}
        onBackdropPress={closeKindModal}
        onBackButtonPress={closeKindModal}
        deviceWidth={width}
        deviceHeight={height}
        style={styles.bottomModal}>
        <DateSortModal
          title="종류"
          items={kindItems}
          active={kind}
          onPress={onPressKindModal}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
});

export default Date;
