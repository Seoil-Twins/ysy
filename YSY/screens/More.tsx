import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';

import { globalStyles } from '../style/global';

import FavoriteSVG from '../assets/icons/love_none.svg';
import RecentSVG from '../assets/icons/history.svg';
import BankBookSVG from '../assets/icons/bank_book.svg';
import CheckListSVG from '../assets/icons/checklist.svg';

import CustomText from '../components/CustomText';
import SettingsHeader from '../components/SettingsHeader';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SettingsNavType } from '../navigation/NavTypes';

const ICON_SIZE = 18;

const More = () => {
  const navigation =
    useNavigation<StackNavigationProp<SettingsNavType, 'More'>>();

  const moveFavorite = () => {
    navigation.navigate('Favorite');
  };

  return (
    <View>
      <SettingsHeader style={globalStyles.plpr20} />
      <View style={[globalStyles.plpr20, styles.btnBox, styles.mb5]}>
        <Pressable style={styles.itemBox} onPress={moveFavorite}>
          <FavoriteSVG
            style={styles.icon}
            width={ICON_SIZE}
            height={ICON_SIZE}
          />
          <CustomText size={16} weight="regular" style={styles.text}>
            찜
          </CustomText>
        </Pressable>
        <Pressable style={styles.itemBox}>
          <RecentSVG style={styles.icon} width={ICON_SIZE} height={ICON_SIZE} />
          <CustomText size={16} weight="regular" style={styles.text}>
            최근에 본 장소
          </CustomText>
        </Pressable>
      </View>
      <View style={[globalStyles.plpr20, styles.btnBox]}>
        <Pressable style={styles.itemBox}>
          <BankBookSVG
            style={styles.icon}
            width={ICON_SIZE}
            height={ICON_SIZE}
          />
          <CustomText size={16} weight="regular" style={styles.text}>
            통장
          </CustomText>
        </Pressable>
        <Pressable style={styles.itemBox}>
          <CheckListSVG
            style={styles.icon}
            width={ICON_SIZE}
            height={ICON_SIZE}
          />
          <CustomText size={16} weight="regular" style={styles.text}>
            체크리스트
          </CustomText>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  btnBox: {
    backgroundColor: '#FFFFFF',
  },
  itemBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  icon: {
    marginRight: 10,
  },
  mb5: {
    marginBottom: 5,
  },
  text: {
    top: -1,
  },
});

export default More;
