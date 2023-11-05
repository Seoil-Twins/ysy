import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { getObjectData } from '../util/asyncStorage';

import { Date } from '../types/date';
import { DateNavType } from '../navigation/NavTypes';

import { globalStyles } from '../style/global';

import SadSVG from '../assets/icons/sad.svg';

import BackHeader from '../components/BackHeader';
import DateViewItem from '../components/DateViewItem';
import ScrollLoading from '../components/ScrollLoading';
import NoItem from '../components/NoItem';
import { dateAPI } from '../apis/dateAPI';

const descriptions = ['최근에 본 데이트 장소가 없습니다.'];

const fetchGetDates = async (page: number, ids: number[]) => {
  console.log(page, ids);
  const response: Date[] = [];

  for (const id of ids) {
    const dp = await dateAPI.getDateOne(id);

    const place: Date = {
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

    response.push(place);
  }

  return response;
};

const Recent = () => {
  const navigation =
    useNavigation<StackNavigationProp<DateNavType, 'Recent'>>();

  const [dateItems, setDateItems] = useState<Date[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [historys, setHistorys] = useState<number[] | undefined>(undefined);
  const page = useRef(0);
  const count = useRef(10);

  const moreDateViews = async () => {
    setIsLoading(true);

    if (isLoading || !historys) {
      return;
    }

    const selectIds = historys!.splice(
      page.current,
      count.current + count.current,
    );
    page.current += 1;

    if (selectIds.length === 0) {
      setIsLoading(false);
      return;
    }

    const response = await fetchGetDates(page.current, selectIds);

    setDateItems(prevItems => {
      if (prevItems) {
        return [...prevItems, ...response];
      } else {
        return [...response];
      }
    });
  };

  const getHistorys = async () => {
    const response: string[] = await getObjectData('dateHistory');

    if (response) {
      setHistorys(response.map((item: string) => Number(item)));
    }
  };

  const onPressFavorite = useCallback((id: number, isFavorite: boolean) => {
    const response = 204;

    if (response === 204) {
      handleDateItemChange(id, !isFavorite);
    }
  }, []);

  const handleDateItemChange = (id: number, isFavorite: boolean) => {
    setDateItems((prevItems: Date[] | undefined) => {
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

  const moveDateDetail = (id: number) => {
    navigation.navigate('DateDetail', {
      dateId: id,
    });
  };

  useEffect(() => {
    getHistorys();
  }, []);

  useEffect(() => {
    moreDateViews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historys]);

  useEffect(() => {
    setIsLoading(false);
  }, [dateItems]);

  return (
    <View style={styles.container}>
      <BackHeader style={globalStyles.plpr20} />
      {historys ? (
        <FlatList
          data={dateItems}
          keyExtractor={item => String(item.id)}
          onEndReached={moreDateViews}
          onEndReachedThreshold={0.2}
          renderItem={({ item }) => (
            <DateViewItem
              item={item}
              onPressDetail={moveDateDetail}
              onPressFavorite={onPressFavorite}
            />
          )}
          ListFooterComponent={isLoading ? <ScrollLoading height={50} /> : null}
        />
      ) : (
        <NoItem icon={SadSVG} descriptions={descriptions} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default Recent;
