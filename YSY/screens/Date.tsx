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
import { dateAPI } from '../apis/dateAPI';

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
      title: '서울',
      value: '1',
    },
    {
      title: '경기도',
      value: '31',
    },
    {
      title: '인천',
      value: '2',
    },
    {
      title: '대전',
      value: '3',
    },
    {
      title: '대구',
      value: '4',
    },
    {
      title: '광주',
      value: '5',
    },
    {
      title: '부산',
      value: '6',
    },
    {
      title: '울산',
      value: '7',
    },
    {
      title: '세종특별자치시',
      value: '8',
    },
    {
      title: '강원특별자치도',
      value: '32',
    },
    {
      title: '충청북도',
      value: '33',
    },
    {
      title: '충청남도',
      value: '34',
    },
    {
      title: '경상북도',
      value: '35',
    },
    {
      title: '경상남도',
      value: '36',
    },
    {
      title: '전라북도',
      value: '37',
    },
    {
      title: '전라남도',
      value: '38',
    },
    {
      title: '제주도',
      value: '39',
    },
  ];

  return response;
};

const getInitSubcitys = () => {
  const response: SortItem[] = [
    {
      title: '전체',
      value: undefined,
    },
    {
      title: '강남구',
      value: '1',
    },
    {
      title: '강동구',
      value: '2',
    },
    {
      title: '강북구',
      value: '3',
    },
    {
      title: '강서구',
      value: '4',
    },
    {
      title: '관악구',
      value: '5',
    },
    {
      title: '광진구',
      value: '6',
    },
    {
      title: '구로구',
      value: '7',
    },
    {
      title: '금천구',
      value: '8',
    },
    {
      title: '노원구',
      value: '9',
    },
    {
      title: '도봉구',
      value: '10',
    },
    {
      title: '동대문구',
      value: '11',
    },
    {
      title: '동작구',
      value: '12',
    },
    {
      title: '마포구',
      value: '13',
    },
    {
      title: '서대문구',
      value: '14',
    },
    {
      title: '서초구',
      value: '15',
    },
    {
      title: '성동구',
      value: '16',
    },
    {
      title: '성북구',
      value: '17',
    },
    {
      title: '송파구',
      value: '18',
    },
    {
      title: '양천구',
      value: '19',
    },
    {
      title: '영등포구',
      value: '20',
    },
    {
      title: '용산구',
      value: '21',
    },
    {
      title: '은평구',
      value: '22',
    },
    {
      title: '종로구',
      value: '23',
    },
    {
      title: '중구',
      value: '24',
    },
    {
      title: '중랑구',
      value: '25',
    },
  ];

  return response;
};

const getSubCitys = async (mainCode?: string) => {
  // return response;

  const regionCode = await dateAPI.getRegionCode();

  const newRegionList: SortItem[] = [];

  if (!mainCode) {
    mainCode = '1';
  }
  for (const rc of regionCode) {
    if (rc.mainCode === mainCode) {
      const newRegionItem: SortItem = {
        title: rc.subCode !== '0' ? rc.name : '전체',
        value: rc.subCode !== '0' ? rc.subCode : undefined,
      };
      newRegionList.push(newRegionItem);
    }
  }

  return newRegionList;
};

const getDateAPI = async (
  sort: string,
  address1: string,
  address2: string,
  kind: string,
  page: number,
  count: number,
) => {
  const data = {
    sort: sort,
    areaCode: address1,
    sigunguCode: address2,
    kind: kind,
    page: page,
    count: count,
  };
  const datePlaces = await dateAPI.getDate(data);

  const newDateList = [];

  for (const dp of datePlaces.results) {
    const newPlaceItem = {
      id: dp.contentId,
      contentId: dp.contentId,
      contentTypeId: dp.contentTypeId,
      areaCode: dp.areaCode,
      sigunguCode: dp.sigunguCode,
      view: dp.views,
      title: dp.title,
      description: dp.description,
      thumbnails: dp.thumbnail,
      address: dp.address,
      mapX: dp.mapX,
      mapY: dp.mapY,
      phoneNumber: dp.phoneNumber,
      babyCarriage: dp.babyCarriage,
      pet: dp.pet,
      useTime: dp.useTime,
      parking: dp.parking,
      restDate: dp.restDate,
      homepage: dp.homepage,
      tags: [],
      favoriteCount: 1234,
      datePlaceImages: dp.datePlaceImages,
      isFavorite: dp.isFavorite,
    };
    newDateList.push(newPlaceItem);
  }

  return newDateList;
};

const Date = () => {
  const sortItems: SortItem[] = [
    {
      title: '인기',
      value: 'f',
    },
    {
      title: '제목',
      value: 't',
    },
    {
      title: '최신',
      value: 'r',
    },
  ];
  const kindItems: SortItem[] = [
    {
      title: '전체',
      value: undefined,
    },
    {
      title: '음식점',
      value: '39',
    },
    {
      title: '문화시설',
      value: '14',
    },
    {
      title: '관광지',
      value: '12',
    },
    {
      title: '쇼핑',
      value: '38',
    },
  ];
  const navigation = useNavigation<StackNavigationProp<DateNavType, 'Date'>>();

  const [citys, _setCitys] = useState<SortItem[]>(() => {
    return getCitys();
  });
  const [subCitys, _setSubCitys] = useState<SortItem[]>(() => {
    return getInitSubcitys();
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
  const [hasMoreToLoad, setHasMoreToLoad] = useState(true);

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
    setHasMoreToLoad(true);
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
        const foundCity1 = citys.find(
          item => item.title === address.region_1depth_name,
        );
        _setSubCitys(await getSubCitys(foundCity1?.value));
      }
    } catch (error: any) {
      console.log(error.message);
    }
  }, [latitude, longitude]);

  const onPressFavorite = useCallback(
    async (id: number, isFavorite: boolean) => {
      const res = await dateAPI.getDateOne(id);

      await dateAPI.patchFavorite(res.contentId, res.contentTypeId, {
        isFavorite: res.isFavorite,
      });
      const response = 204;

      if (response === 204) {
        handleDateItemChange(id, !isFavorite);
      }
    },
    [],
  );

  const moreDateViews = useCallback(async () => {
    if (isLoading || dateItems!.length <= 0) {
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

    if (response.length < 10) {
      setHasMoreToLoad(false);
    }

    setDateItems(prevItems => [...prevItems!, ...response]);

    page.current += 1;
  }, [isLoading]);

  const handleTitleChange = (
    updates: { index: number; newTitle: string }[],
  ) => {
    setSortHeaderItems((prevItems: DateSortHeaderItem[]) => {
      const updatedItems = [...prevItems];

      for (const update of updates) {
        const { index, newTitle } = update;
        updatedItems[index].title = newTitle;
      }

      const foundCity1 = citys.find(
        item => item.title === updatedItems[1].title,
      );
      const foundCity2 = subCitys.find(
        item => item.title === updatedItems[2].title,
      );

      setAddress1({ title: updatedItems[1].title, value: foundCity1!.value });
      if (foundCity2) {
        setAddress2({ title: updatedItems[2].title, value: foundCity2!.value });
      } else {
        setAddress2({ title: '전체', value: undefined });
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

  const moveDateDetail = async (id: number) => {
    await dateAPI.patchViews(id);
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

  const onPressAddress1Modal = async (item: SortItem) => {
    const newSortObject = { ...item };
    const newSortHeaderObject = [...sortHeaderItems];
    newSortHeaderObject[1].title = item.title;
    newSortHeaderObject[2].title = '전체';
    setAddress2({ title: '전체', value: undefined });
    setAddress1(newSortObject);
    _setSubCitys(await getSubCitys(item.value));
    setSortHeaderItems(newSortHeaderObject);
    closeAddress1Modal();

    handlePressChange([{ index: 0, isActive: false }]);
    setLatitude(0);
    prevLatitude.current = 0;
    setLongitude(0);
    prevLongitude.current = 0;
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
        onEndReached={hasMoreToLoad ? moreDateViews : null}
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
