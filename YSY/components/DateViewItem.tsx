import React from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  ScrollView,
  Dimensions,
  Pressable,
} from 'react-native';
import { useDebouncedCallback } from 'use-debounce';

import LoveNoneSVG from '../assets/icons/love_none.svg';
import LoveActiveSVG from '../assets/icons/love_active.svg';

import { Date } from '../types/date';

import CustomText from './CustomText';

const { width } = Dimensions.get('window');

type DateViewItemProps = {
  item: Date;
  onPressDetail: (id: number) => void;
  onPressFavorite: (id: number, isFavorite: boolean) => void;
};

const DateViewItem: React.FC<DateViewItemProps> = ({
  item,
  onPressDetail,
  onPressFavorite,
}) => {
  const emitFavorite = useDebouncedCallback(() => {
    onPressFavorite(item.id, item.isFavorite);
  }, 500);

  const emitDetail = () => {
    onPressDetail(item.id);
  };

  return (
    <Pressable style={styles.container} onPress={emitDetail}>
      <ImageBackground
        source={
          item.thumbnails[0]
            ? { uri: item.thumbnails[0] }
            : require('../assets/images/date_image.png')
        }
        style={styles.background}>
        <Pressable style={styles.favorite} onPress={emitFavorite}>
          {item.isFavorite ? (
            <LoveActiveSVG style={styles.img} />
          ) : (
            <LoveNoneSVG style={styles.img} />
          )}
          <CustomText
            weight="medium"
            size={18}
            color="#FFFFFF"
            style={styles.textShadow}>
            {item.favoriteCount}
          </CustomText>
        </Pressable>
        <View style={styles.bottom}>
          <CustomText
            weight="medium"
            size={24}
            color="#FFFFFF"
            style={[styles.title, styles.textShadow]}>
            {item.title}
          </CustomText>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}>
            {item.tags.map((tag, idx) => (
              <View key={idx} style={styles.tag}>
                <CustomText size={12} weight="regular">
                  {tag}
                </CustomText>
              </View>
            ))}
          </ScrollView>
        </View>
      </ImageBackground>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: width,
    height: width - 120,
    marginBottom: 5,
  },
  background: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  favorite: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  img: {
    marginRight: 5,
  },
  bottom: {
    position: 'absolute',
    left: 20,
    bottom: 15,
    // alignSelf: 'flex-end',
  },
  title: {
    marginBottom: 5,
  },
  tag: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
  },
  textShadow: {
    textShadowColor: '#6b6b6b',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default DateViewItem;
