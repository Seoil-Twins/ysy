import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { PERMISSIONS } from 'react-native-permissions';
import Geolocation, {
  GeolocationResponse,
  GeolocationError,
} from '@react-native-community/geolocation';
import axios, { AxiosRequestConfig } from 'axios';
import { KAKAO_REST_API_KEY } from '@env';

import CustomText from '../components/CustomText';
import SearchHeader from '../components/SearchHeader';
import DateHeader from '../components/DateHeader';

import { globalStyles } from '../style/global';

import { checkPermission, openAppSettings } from '../util/permission';

type DateItem = {
  title: string;
  pressEvent: () => void;
};

const Date = () => {
  const [searchVisible, setSearchVisible] = useState<boolean>(false);
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);

  const prevLatitude = useRef(latitude);
  const prevLongitude = useRef(longitude);

  const onPressSort = () => {
    console.log('sort');
  };

  const onPressAddress1 = () => {
    console.log('onPressAddress1');
  };

  const onPressAddress2 = () => {
    console.log('onPressAddress2');
  };

  const onPressKind = () => {
    console.log('onPressKind');
  };

  const onPressGPS = () => {
    setMyLocation();
  };

  const [items, setItems] = useState<DateItem[]>([
    {
      title: '인기',
      pressEvent: onPressSort,
    },
    {
      title: '서울',
      pressEvent: onPressAddress1,
    },
    {
      title: '전체',
      pressEvent: onPressAddress2,
    },
    {
      title: '전체',
      pressEvent: onPressKind,
    },
  ]);

  const handleTitleChange = (
    updates: { index: number; newTitle: string }[],
  ) => {
    setItems((prevItems: DateItem[]) => {
      const updatedItems = prevItems.map((item, i) => {
        const update = updates.find(u => u.index === i);
        if (update) {
          return { ...item, title: update.newTitle };
        }
        return item;
      });

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

  const setMyLocation = async () => {
    if (Platform.OS === 'android') {
      await checkPermission(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    } else if (Platform.OS === 'ios') {
      await checkPermission(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    }

    Geolocation.getCurrentPosition(successPosition, errorPosition, {
      enableHighAccuracy: true,
    });
  };

  const gpsToAddress = useCallback(async () => {
    const format = 'json';
    const config: AxiosRequestConfig = {
      params: {
        x: longitude,
        y: latitude,
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
        handleTitleChange([
          { index: 1, newTitle: address.region_1depth_name },
          { index: 2, newTitle: address.region_2depth_name },
        ]);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  }, [latitude, longitude]);

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

  useEffect(() => {
    console.log(items);
  }, [items]);

  const showSearchModal = () => {
    setSearchVisible(true);
  };

  const hideSearchModal = () => {
    setSearchVisible(false);
  };

  return (
    <View style={[globalStyles.mlmr20, styles.container]}>
      <SearchHeader onPress={showSearchModal} />
      <DateHeader items={items} onPressGPS={onPressGPS} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
});

export default Date;
