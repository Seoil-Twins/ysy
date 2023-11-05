import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, FlatList } from 'react-native';

import { globalStyles } from '../style/global';

import { Date } from '../types/date';

import BackHeader from '../components/BackHeader';
import DateViewItem from '../components/DateViewItem';
import ScrollLoading from '../components/ScrollLoading';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { DateNavType } from '../navigation/NavTypes';
import { favoriteAPI } from '../apis/favoriteAPI';
import { dateAPI } from '../apis/dateAPI';

const fetchGetFavoriteDates = async (page: number, count: number) => {
  const favoires = await favoriteAPI.getFavorite();
  const favoriteIds = favoires.map(
    (item: { contentId: any }) => item.contentId,
  );

  const response: Date[] = [];

  for (const id of favoriteIds) {
    const dp = await dateAPI.getDateOne(id);
    console.log(dp);

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
      favoriteCount: dp.favoriteCount,
      datePlaceImages: dp.datePlaceImages,
      isFavorite: dp.isFavorite,
    };

    response.push(place);
  }

  console.log('page : ', page, 'count : ', count);
  console.log(response);

  return response;
};

const Favorite = () => {
  const navigation = useNavigation<StackNavigationProp<DateNavType, 'More'>>();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dateItems, setDateItems] = useState<Date[]>([]);
  const page = useRef(0);
  const count = useRef(10);

  const moreDateViews = useCallback(async () => {
    setIsLoading(true);

    if (isLoading) {
      return;
    }

    page.current += 1;
    const response = await fetchGetFavoriteDates(page.current, count.current);

    setDateItems(prevItems => [...prevItems, ...response]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPressFavorite = useCallback((id: number, isFavorite: boolean) => {
    const response = 204;

    if (response === 204) {
      handleDateItemChange(id, !isFavorite);
    }
  }, []);

  const handleDateItemChange = (id: number, isFavorite: boolean) => {
    setDateItems((prevItems: Date[]) => {
      const updatedItems = [...prevItems];
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
    moreDateViews();
  }, [moreDateViews]);

  useEffect(() => {
    setIsLoading(false);
  }, [dateItems]);

  return (
    <View>
      <BackHeader style={globalStyles.plpr20} />
      <FlatList
        data={dateItems}
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
    </View>
  );
};

export default Favorite;
