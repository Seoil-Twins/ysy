import React, { useState, useEffect, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ImageOrVideo } from 'react-native-image-crop-picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import KakaoShareLink from 'react-native-kakao-share-link';
import { StackNavigationProp } from '@react-navigation/stack';

import { globalStyles } from '../style/global';

import BackHeader from '../components/BackHeader';
import InputTitle from '../components/InputTitle';
import Input from '../components/Input';
import DatePicker from '../components/DatePicker';
import ImagePicker from '../components/ImagePicker';
import CustomText from '../components/CustomText';

import { TutorialNavType } from '../navigation/NavTypes';

import { getSecureValue, setSecureValue } from '../util/jwt';
import { useAppDispatch } from '../redux/hooks';
import { login } from '../features/loginStatusSlice';
import { getStringData, storeStringData } from '../util/asyncStorage';

import { coupleAPI } from '../apis/coupleAPI';
import { AppToken, LoginOptions, appLogin } from '../util/login';
import { userAPI } from '../apis/userAPI';

const ConnectCouple = () => {
  const navigation = useNavigation<StackNavigationProp<TutorialNavType>>();
  const { params } = useRoute<RouteProp<TutorialNavType, 'ConnectCouple'>>();
  const dispatch = useAppDispatch();

  const title = '연인 맺기';
  const descriptions = [
    'YSY 서비스를 원할하게 사용하기 위해서는',
    '연인을 등록 해야합니다!',
  ];

  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [code, setCode] = useState('');
  const [myCode, setMyCode] = useState(params.myCode);
  const [date, setDate] = useState('');
  const [image, setImage] = useState('');

  const getToken = useCallback(async () => {
    const accessToken: string | false = await getSecureValue('accessToken');
    const refreshToken: string | false = await getSecureValue('refreshToken');

    if (!accessToken || !refreshToken) {
      navigation.navigate('Tutorial');
      return;
    }

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
  }, [navigation]);

  // token 사용해서 내 정보 가져오기
  const initalMyCode = async () => {
    setMyCode('ASD123');
  };

  useEffect(() => {
    getToken();
  }, [getToken]);

  useEffect(() => {
    if (myCode) {
      return;
    }

    initalMyCode();
  }, [myCode]);

  const changeCode = (code: string) => {
    setCode(code);
  };

  const changeDatePicker = (date: string) => {
    setDate(date);
  };

  const changeImagePicker = (image: ImageOrVideo | ImageOrVideo[]) => {
    if (Array.isArray(image)) {
      return;
    }

    setImage(image.path);
  };

  const connectCouple = async () => {
    // Couple POST API
    console.log('Code : ', code);
    console.log('Date : ', date);
    console.log('Image : ', image);
    console.log('accessToken : ', accessToken);
    console.log('refreshToken : ', refreshToken);

    const data = {
      otherCode: code,
      cupDay: date,
      thumbnail: image,
    };
    if (await storeStringData('accessToken', `Bearer ${accessToken}`)) {
      console.log('Token Data Save Success ! ');
      const res =
        `Bearer ${accessToken}` === (await getStringData('accessToken'));
      console.log('Save ? ' + res);
      console.log(await getStringData('accessToken'));
    }

    const result = await coupleAPI.postNewCouple(data);
    console.log(JSON.stringify(result));

    const userData = JSON.stringify(await userAPI.getUserMe()); // login 정보 가져오기
    const userParsedData = JSON.parse(userData);

    const userTokenData: LoginOptions = {
      snsId: userParsedData.snsId,
      snsKind: userParsedData.snsKind,
      name: userParsedData.name,
      email: userParsedData.email,
      phone: userParsedData.phone,
      profile: userParsedData.profile,
      birthday: userParsedData.birthday,
      eventNofi: userParsedData.eventNofi,
    };

    const token: AppToken = await appLogin(userTokenData);

    await setSecureValue('accessToken', token.accessToken);
    await setSecureValue('refreshToken', token.refreshToken);
    await storeStringData('accessToken', `Bearer ${token.accessToken}`);

    if (params.loginOption) {
      console.log('new Token');
      const token: AppToken = await appLogin(params.loginOption);
      await setAccessToken(token.accessToken);

      if (
        await storeStringData('accessToken', `Bearer ${result.accessToken}`)
      ) {
        console.log('Token Data Save Success part2 ! ');
        const res =
          `Bearer ${accessToken}` === (await getStringData('accessToken'));
        console.log('Save ? ' + res);
        console.log(await getStringData('accessToken'));
      }
    }
  };

  const clickShareBtn = async () => {
    const androidExecutionParams = [
      { key: 'screen', value: 'ConnectCouple' },
      { key: 'otherCode', value: myCode },
    ];
    const iosExecutionParams = [
      { key: 'screen', value: 'ConnectCouple' },
      { key: 'otherCode', value: myCode },
    ];

    await KakaoShareLink.sendFeed({
      content: {
        title: `나의 코드 : ${myCode}`,
        imageUrl:
          'http://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg',
        link: {
          androidExecutionParams: androidExecutionParams,
          iosExecutionParams: iosExecutionParams,
        },
        description: 'YSY를 원할하게 이용하기 위해서는 연인과 연결 해야합니다!',
      },
      buttons: [
        {
          title: '연결하기',
          link: {
            androidExecutionParams: androidExecutionParams,
            iosExecutionParams: iosExecutionParams,
          },
        },
      ],
    });
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

    connectCouple();

    // routing MAIN
    dispatch(login());
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
          defaultValue={params.otherCode}
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
