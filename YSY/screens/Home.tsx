import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ImageBackground, Image } from 'react-native';

import CustomText from '../components/CustomText';

import { Couple } from '../types/couple';

import { globalStyles } from '../style/global';

import DefaultPersonSVG from '../assets/icons/person.svg';
import LoveSVG from '../assets/icons/small_love.svg';

const Home = () => {
  const [cupInfo, setCupInfo] = useState<Couple | undefined>(undefined);

  const getCoupleInfo = async () => {
    const response: Couple = {
      cupId: 'gPz9fLmw',
      cupDay: '2023-01-17',
      title: '커플 제목2',
      thumbnail:
        'https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg',
      createdTime: '2023-01-23T05:03:49.000Z',
      users: [
        {
          userId: 21,
          cupId: 'gPz9fLmw',
          snsId: '1001',
          code: 'lEVDgJ',
          name: '김승용10',
          email: 'seungyong23@naver.com',
          birthday: '2000-11-26',
          phone: '01085297196',
          profile:
            'https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg',
          primaryNofi: true,
          dateNofi: false,
          eventNofi: false,
        },
        {
          userId: 22,
          cupId: 'gPz9fLmw',
          snsId: '1001',
          code: 'X8iTjE',
          name: '김승용22',
          email: 'seungyong20@naver.com',
          birthday: '2000-11-26',
          phone: '01085297194',
          profile: null,
          primaryNofi: true,
          dateNofi: true,
          eventNofi: false,
        },
      ],
    };

    setCupInfo(response);
  };

  useEffect(() => {
    getCoupleInfo();
  }, []);

  return (
    <ImageBackground
      source={require('../assets/icons/main_background.png')}
      resizeMode="cover"
      style={[styles.container, globalStyles.mlmr20]}>
      <View style={styles.titleBox}>
        <CustomText size={22} weight="regular" color="#FFFFFF">
          우리 사랑한지
        </CustomText>
        <View style={styles.titleRow}>
          <CustomText size={30} weight="medium" color="#FF6D70">
            456
          </CustomText>
          <CustomText size={30} weight="regular" color="#FFFFFF">
            일
          </CustomText>
        </View>
      </View>
      <View style={styles.userBox}>
        <View style={styles.userItemBox}>
          <View style={styles.user}>
            {cupInfo?.users[0].profile ? (
              <Image
                source={{ uri: cupInfo.users[0].profile }}
                style={styles.profileImg}
              />
            ) : (
              <DefaultPersonSVG style={styles.profileDefaultImg} />
            )}
          </View>
          <CustomText size={18} weight="regular" color="#FFFFFF">
            {cupInfo?.users[0].name}
          </CustomText>
        </View>
        <LoveSVG style={styles.loveImg} />
        <View style={styles.userItemBox}>
          <View style={styles.user}>
            {cupInfo?.users[1].profile ? (
              <Image
                source={{ uri: cupInfo.users[1].profile }}
                style={styles.profileImg}
              />
            ) : (
              <DefaultPersonSVG style={styles.profileDefaultImg} />
            )}
          </View>
          <CustomText size={18} weight="regular" color="#FFFFFF">
            {cupInfo?.users[1].name}
          </CustomText>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleBox: {
    flex: 2,
    alignItems: 'center',
    marginTop: 70,
  },
  titleRow: {
    flexDirection: 'row',
  },
  userBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  userItemBox: {
    alignItems: 'center',
  },
  user: {
    position: 'relative',
    width: 45,
    height: 45,
    borderRadius: 45 / 2,
    backgroundColor: '#E4E8EF',
    overflow: 'hidden',
  },
  loveImg: {
    marginLeft: 35,
    marginRight: 35,
  },
  profileImg: {
    width: 45,
    height: 45,
    borderRadius: 45 / 2,
  },
  profileDefaultImg: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 0,
  },
});

export default Home;
