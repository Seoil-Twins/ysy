import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ImageOrVideo } from 'react-native-image-crop-picker';
import { RouteProp, useRoute } from '@react-navigation/native';
import KakaoShareLink from 'react-native-kakao-share-link';

import { globalStyles } from '../style/global';

import BackHeader from '../components/BackHeader';
import InputTitle from '../components/InputTitle';
import Input from '../components/Input';
import DatePicker from '../components/DatePicker';
import ImagePicker from '../components/ImagePicker';
import CustomText from '../components/CustomText';
import { TutorialTypes } from '../navigation/TutorialTypes';
import { getSecureValue } from '../util/jwt';

const ConnectCouple = () => {
  const { params } = useRoute<RouteProp<TutorialTypes, 'ConnectCouple'>>();
  const title = '연인 맺기';
  const descriptions = [
    'YSY 서비스를 원할하게 사용하기 위해서는',
    '연인을 등록 해야합니다!',
  ];

  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [code, setCode] = useState('');
  const [date, setDate] = useState('');
  const [image, setImage] = useState('');

  const getToken = async () => {
    const accessToken: string | false = await getSecureValue('accessToken');
    const refreshToken: string | false = await getSecureValue('refreshToken');

    if (!accessToken || !refreshToken) {
      console.log('error');
      return;
    }

    await setAccessToken(accessToken);
    await setRefreshToken(refreshToken);
  };

  useEffect(() => {
    getToken();
  }, []);

  const changeCode = (code: string) => {
    setCode(code);
  };

  const changeDatePicker = (date: string) => {
    setDate(date);
  };

  const changeImagePicker = (image: ImageOrVideo) => {
    setImage(image.path);
  };

  const clickShareBtn = async () => {
    // Kakao Share 사용
    const response = await KakaoShareLink.sendFeed({
      content: {
        title: `나의 코드 : ${params.info.code}`,
        imageUrl:
          'http://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg',
        link: {
          webUrl: 'https://developers.kakao.com/',
          mobileWebUrl: 'https://developers.kakao.com/',
        },
        description: 'YSY를 원할하게 이용하기 위해서는 연인과 연결 해야합니다!',
      },
      buttons: [
        {
          title: '앱에서 등록하기',
          link: {
            androidExecutionParams: [{ key: 'code', value: params.info.code }],
          },
        },
      ],
    });

    console.log(response);
  };

  const clickConnectBtn = () => {
    if (code === '' && code.length !== 6) {
      return;
    }
    if (date === '') {
      return;
    }
    if (image === '') {
      return;
    }

    // Couple POST API
    console.log('Code : ', code);
    console.log('Date : ', date);
    console.log('Image : ', image);
    console.log('accessToken : ', accessToken);
    console.log('refreshToken : ', refreshToken);

    // routing MAIN
  };

  return (
    <View style={[styles.container, globalStyles.mlmr20]}>
      <BackHeader />
      <View style={styles.contentBox}>
        <InputTitle title={title} descriptions={descriptions} />
        <Input
          placeholder="연인 맺을 상대방의 코드 입력"
          onInputChange={changeCode}
          maxLength={6}
        />
        <DatePicker
          placeholder="사귄 날짜"
          mode="date"
          onInputChange={changeDatePicker}
        />
        <ImagePicker
          placeholder="대표 사진"
          onInputChange={changeImagePicker}
        />
      </View>
      <View style={styles.btnBox}>
        <Pressable
          style={[styles.btn, styles.shareBtn]}
          onPress={clickShareBtn}>
          <CustomText size={20} weight="medium" color="#999999">
            나의 코드 공유
          </CustomText>
        </Pressable>
        <Pressable
          style={[styles.btn, styles.connectBtn]}
          onPress={clickConnectBtn}>
          <CustomText size={20} weight="medium" color="#FFFFFF">
            연인 맺기
          </CustomText>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  contentBox: {
    flex: 3,
  },
  btnBox: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 48,
  },
  btn: {
    height: 48,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  shareBtn: {
    borderColor: '#DDDDDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectBtn: {
    borderColor: '#5A8FFF',
    backgroundColor: '#5A8FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ConnectCouple;
