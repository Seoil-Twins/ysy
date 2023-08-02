import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  ScrollView,
  Dimensions,
  Pressable,
} from 'react-native';

import LoveNoneSVG from '../assets/icons/love_none.svg';
import LoveActiveSVG from '../assets/icons/love_active.svg';
import CustomText from './CustomText';

const { width } = Dimensions.get('window');

type DateViewItemProps = {
  id: number;
  title: string;
  tags: string[];
  thumbnail: string;
  favoriteCount: number;
  isFavorite: boolean;
  onPressFavorite: (id: number, isFavorite: boolean) => void;
};

const DateViewItem: React.FC<DateViewItemProps> = ({
  id,
  title,
  tags,
  thumbnail,
  favoriteCount,
  isFavorite,
  onPressFavorite,
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const onPress = () => {
    if (loading) {
      return;
    }

    setLoading(true);
    onPressFavorite(id, isFavorite);

    // throttle 적용
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  return (
    <ImageBackground
      source={
        thumbnail
          ? { uri: thumbnail }
          : require('../assets/images/date_image.png')
      }
      style={styles.container}>
      <Pressable style={styles.favorite} onPress={onPress}>
        {isFavorite ? (
          <LoveActiveSVG style={styles.img} />
        ) : (
          <LoveNoneSVG style={styles.img} />
        )}
        <CustomText
          weight="medium"
          size={18}
          color="#FFFFFF"
          style={styles.textShadow}>
          {favoriteCount}
        </CustomText>
      </Pressable>
      <View style={styles.bottom}>
        <CustomText
          weight="medium"
          size={24}
          color="#FFFFFF"
          style={[styles.title, styles.textShadow]}>
          {title}
        </CustomText>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}>
          {tags.map((tag, idx) => (
            <View key={idx} style={styles.tag}>
              <CustomText size={12} weight="regular">
                {tag}
              </CustomText>
            </View>
          ))}
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: width,
    height: width - 120,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 5,
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
