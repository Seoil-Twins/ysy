import {
  NAVER_CONSUMERKEY,
  NAVER_CONSUMER_SECRET,
  NAVER_APP_NAME,
  SERVICE_URL_SCHEME,
  GOOGLE_WEB_CLIENT_ID,
} from '@env';
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Pressable,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import Modal from 'react-native-modal';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

import * as KakaoOAuth from '@react-native-seoul/kakao-login';
import NaverOAuth from '@react-native-seoul/naver-login';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import GoogleOAuth from '@react-native-firebase/auth';

import FirstTutorialSVG from '../assets/icons/tutorial_love.svg';
import SecondTutorialSVG from '../assets/icons/tutorial_album.svg';
import ThirdTutorialSVG from '../assets/icons/tutorial_place.svg';

import CustomText from '../components/CustomText';

import {
  AppToken,
  LoginOptions,
  appLogin,
  verifyLoginData,
} from '../util/login';
import { setSecureValue } from '../util/jwt';
import { TutorialNavType } from '../navigation/NavTypes';
import { User } from '../types/user';

const { width, height } = Dimensions.get('window');
const slides = [
  {
    key: 'first',
    title: '애인과 함께',
    contents: [
      'YSY를 사용하여 애인과 함께',
      '앨범, 일정, 데이트 장소를 공유하고',
      '이야기 해보세요!',
    ],
    image: FirstTutorialSVG,
  },
  {
    key: 'second',
    title: '앨범 공유',
    contents: [
      '공용 앨범 기능을 사용하여',
      '서로의 추억을 남기고 공유해보세요!',
    ],
    image: SecondTutorialSVG,
  },
  {
    key: 'third',
    title: '데이트 장소',
    contents: [
      '추천 데이트 장소를 제공합니다.',
      '같은 데이트 장소를 가는 것보단 한 번',
      '둘러봐서 새로운 데이트 장소를 확인하세요!',
    ],
    image: ThirdTutorialSVG,
  },
];

type Item = (typeof slides)[0];

const Tutorial = () => {
  let slider: AppIntroSlider | undefined;
  const navigation = useNavigation<StackNavigationProp<TutorialNavType>>();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    googleSigninConfigure();
  }, []);

  const googleSigninConfigure = () => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
    });
  };

  const showModal = () => {
    setIsVisible(true);
  };

  const hideModal = () => {
    setIsVisible(false);
  };

  const renderItem = ({ item }: { item: Item }) => {
    return (
      <View style={styles.container}>
        <item.image style={styles.img} />
        <View>
          <CustomText
            size={36}
            weight="medium"
            color="#527BD2"
            style={[styles.title, styles.textCenter]}>
            {item.title}
          </CustomText>
          <View>
            {item.contents.map((content: string, idx: number) => (
              <CustomText
                size={18}
                weight="regular"
                style={styles.textCenter}
                key={idx}>
                {content}
              </CustomText>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderPagination = (activeIndex: number) => {
    return (
      <View>
        {activeIndex === 2 ? (
          <TouchableOpacity style={styles.startBtn} onPress={showModal}>
            <CustomText
              size={24}
              weight="medium"
              color="#FFFFFF"
              style={{ textAlign: 'center' }}>
              시작하기
            </CustomText>
          </TouchableOpacity>
        ) : (
          <View style={styles.dotBox}>
            {slides.length > 1 &&
              slides.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.dot,
                    i === activeIndex ? styles.active : styles.none,
                    styles.mr15,
                  ]}
                  onPress={() => slider?.goToSlide(i, true)}
                />
              ))}
          </View>
        )}
      </View>
    );
  };

  // Get User Info API
  const getMyInfo = async (data: LoginOptions) => {
    const user: User = {
      userId: 1,
      snsId: '0002',
      name: String(data.name),
      email: String(data.email),
      phone: String(data.phone),
      birthday: String(data.birthday),
      cupId: null,
      dateNofi: false,
      primaryNofi: false,
      eventNofi: false,
      code: 'DAS111',
      profile: data.profile,
    };

    return user;
  };

  const kakaoLogin = async () => {
    if (isLoggingIn) {
      return;
    }
    setIsLoggingIn(true);

    try {
      await KakaoOAuth.login();

      /**
       * {
       *    "ageRange": "null",
       *    "ageRangeNeedsAgreement": false,
       *    "birthday": "1126",
       *    "birthdayNeedsAgreement": false,
       *    "birthdayType": "SOLAR",
       *    "birthyear": "null",
       *    "birthyearNeedsAgreement": false,
       *    "email": "seungyong00@kakao.com",
       *    "emailNeedsAgreement": false,
       *    "gender": "MALE",
       *    "genderNeedsAgreement": false,
       *    "id": "2904977053",
       *    "isEmailValid": true,
       *    "isEmailVerified": true,
       *    "isKorean": false,
       *    "isKoreanNeedsAgreement": false,
       *    "name": "null",
       *    "nickname": "승용",
       *    "phoneNumber": "null",
       *    "phoneNumberNeedsAgreement": false,
       *    "profileImageUrl": "https://k.kakaocdn.net/dn/Y4YRS/btsiPPlUQdf/5jbfMmQk55nTOnvaTzpiR0/img_640x640.jpg",
       *    "profileNeedsAgreement": false,
       *    "thumbnailImageUrl": "https://k.kakaocdn.net/dn/Y4YRS/btsiPPlUQdf/5jbfMmQk55nTOnvaTzpiR0/img_110x110.jpg"
       * }
       */
      const profile: KakaoOAuth.KakaoProfile = await KakaoOAuth.getProfile();
      const data: LoginOptions = {
        snsId: '0001',
        email: profile.email !== 'null' ? profile.email : null,
        name: profile.nickname !== 'null' ? profile.nickname : null,
        birthday:
          profile.birthday !== 'null' && profile.birthyear !== 'null'
            ? ` ${profile.birthyear}-${profile.birthday.substring(
                0,
                2,
              )}-${profile.birthday.substring(2, 4)}`
            : null,
        phone: profile.phoneNumber !== 'null' ? profile.phoneNumber : null,
        profile:
          profile.profileImageUrl !== 'null' ? profile.profileImageUrl : null,
        eventNofi: false,
      };

      console.log('kakao data', data);

      if (!verifyLoginData(data)) {
        hideModal();
        navigation.navigate('AdditionalInformation', { info: data });
        return;
      }

      const token: AppToken = await appLogin(data);

      await setSecureValue('accessToken', token.accessToken);
      await setSecureValue('refreshToken', token.refreshToken);

      const user: User = await getMyInfo(data);

      hideModal();
      navigation.navigate('ConnectCouple', { myCode: user.code });
    } catch (error) {
      if (!String(error).includes('user cancelled')) {
        console.log('알 수 없는 에러');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const naverLogin = async () => {
    if (isLoggingIn) {
      return;
    }
    setIsLoggingIn(true);

    const { failureResponse, successResponse } = await NaverOAuth.login({
      appName: NAVER_APP_NAME,
      consumerKey: NAVER_CONSUMERKEY,
      consumerSecret: NAVER_CONSUMER_SECRET,
      // naver devloper에서 ios 등록할 때 URL_SCHEME과 맞춰줘야함
      serviceUrlScheme: SERVICE_URL_SCHEME,
    });

    if (successResponse?.accessToken) {
      const profileResult = await NaverOAuth.getProfile(
        successResponse!.accessToken,
      );

      if (profileResult.message === 'success') {
        // Naver는 모든 정보를 필수로 가져오게 할 수 있음.
        const { name, birthyear, birthday, email, mobile, profile_image } =
          profileResult.response;

        const data: LoginOptions = {
          snsId: '0002',
          name,
          email,
          phone: mobile,
          profile: profile_image,
          birthday: `${birthyear}-${birthday}`,
          eventNofi: false,
        };

        console.log('naver data', data);

        // false면 추가 정보 페이지로 이동
        if (!verifyLoginData(data)) {
          hideModal();
          navigation.navigate('AdditionalInformation', { info: data });
          return;
        }

        const token: AppToken = await appLogin(data);

        await setSecureValue('accessToken', token.accessToken);
        await setSecureValue('refreshToken', token.refreshToken);

        // Get User API
        const user: User = await getMyInfo(data);

        hideModal();
        navigation.navigate('ConnectCouple', { myCode: user.code });
      } else {
        console.log('Failed get profile');
        console.log(profileResult);
      }
    } else if (!failureResponse?.isCancel) {
      console.log('Failed! : ', failureResponse);
    }

    hideModal();
    setIsLoggingIn(false);
  };

  const googleLogin = async () => {
    if (isLoggingIn) {
      return;
    }
    setIsLoggingIn(true);

    try {
      const { idToken } = await GoogleSignin.signIn();
      // GoogleOAuth를 통해 사용자 인증을 하면 더 많은 정보를 가져올 수 있음(phoneNumber).
      const googleCredential =
        GoogleOAuth.GoogleAuthProvider.credential(idToken);
      const response = await GoogleOAuth().signInWithCredential(
        googleCredential,
      );

      if (response.user) {
        const data: LoginOptions = {
          snsId: '0003',
          name: response.user.displayName,
          // 나중에 이메일 인증이 생긴다면 response.user.emailVerified로 인증 여부 확인
          email: response.user.email,
          phone: response.user.phoneNumber ? response.user.phoneNumber : null,
          profile: response.user.photoURL,
          // 생년월일을 제공하지 않음
          birthday: null,
          eventNofi: false,
        };

        console.log('google data', data);

        hideModal();
        navigation.navigate('AdditionalInformation', { info: data });
      } else {
        console.log('no user to goole');
      }
    } catch (error) {
      if (!String(error).includes('Sign in action cancelled')) {
        console.log('알 수 없는 에러');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <Modal
        isVisible={isVisible}
        onBackdropPress={hideModal}
        onBackButtonPress={hideModal}
        deviceWidth={width}
        deviceHeight={height}
        style={styles.bottomModal}>
        <View style={styles.modalBox}>
          <View style={styles.textBox}>
            <CustomText
              size={26}
              weight="medium"
              style={[styles.textCenter, styles.mb5]}>
              간편 회원가입
            </CustomText>
            <CustomText
              size={16}
              weight="regular"
              color="#999999"
              style={styles.textCenter}>
              자주 사용하는 SNS를 통해 간편하게
            </CustomText>
            <CustomText
              size={16}
              weight="regular"
              color="#999999"
              style={styles.textCenter}>
              YSY 앱 서비스를 가입하실 수 있습니다.
            </CustomText>
          </View>
          <View style={styles.loginBox}>
            <Pressable onPress={kakaoLogin}>
              <Image
                source={require('../assets/icons/kakao_login_btn.png')}
                style={styles.mb15}
              />
            </Pressable>
            <Pressable onPress={naverLogin}>
              <Image
                source={require('../assets/icons/naver_login_btn.png')}
                style={styles.mb15}
              />
            </Pressable>
            <Pressable onPress={googleLogin}>
              <Image source={require('../assets/icons/google_login_btn.png')} />
            </Pressable>
          </View>
        </View>
      </Modal>
      <AppIntroSlider
        renderItem={renderItem}
        renderPagination={renderPagination}
        data={slides}
        ref={(ref: any) => (slider = ref!)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    width: 155,
    height: 155,
    marginBottom: 70,
  },
  title: {
    marginBottom: 10,
  },
  textCenter: {
    textAlign: 'center',
  },
  dotBox: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mr15: {
    marginRight: 15,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 14 / 2,
  },
  active: {
    backgroundColor: '#5A8FFF',
  },
  none: {
    backgroundColor: '#DDDDDD',
  },
  startBtn: {
    position: 'absolute',
    width: 320,
    height: 52,
    bottom: 48,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#3675FB',
    borderRadius: 10,
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalBox: {
    width: width,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 48,
    paddingBottom: 48,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  textBox: {
    marginBottom: 35,
  },
  mb5: {
    marginBottom: 5,
  },
  mb15: {
    marginBottom: 15,
  },
  loginBox: {},
});

export default Tutorial;
