import React, { useEffect, useState, useCallback } from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  Image,
  Pressable,
  ScrollView,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import VersionCheck from 'react-native-version-check';
import Modal from 'react-native-modal';

import { globalStyles } from '../style/global';
import { useAppDispatch } from '../redux/hooks';

import ArrowRightSVG from '../assets/icons/arrow_right_gray.svg';
import DefaultPersonSVG from '../assets/icons/person.svg';

import BackHeader from '../components/BackHeader';
import CustomText from '../components/CustomText';
import SettingsItem from '../components/SettingsItem';
import ConfirmModalView from '../components/ConfirmModalView';

import { User } from '../types/user';
import { Couple } from '../types/couple';

import { SettingsNavType } from '../navigation/NavTypes';

import { logout } from '../features/loginStatusSlice';

import { removeSecureValue } from '../util/jwt';
import { userAPI } from '../apis/userAPI';

const PROFILE_SIZE = 45;
const { width, height } = Dimensions.get('window');
const IMG_BASE_URL = 'https://storage.googleapis.com/ysy-bucket/';

const fetchDisconnectCouple = async () => {
  const response = {
    statusCode: 204,
  };

  return response;
};

const fetchWithdraw = async () => {
  const response = {
    statusCode: 204,
  };

  return response;
};

const Settings = () => {
  const navigation = useNavigation<StackNavigationProp<SettingsNavType>>();
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();

  const [user, setUser] = useState<User | null>(null);
  const [coupleUser, setCoupleUser] = useState<User | null>(null);
  const [isWithdraw, setIsWithdraw] = useState<boolean>(false);
  const [isDisconnect, setIsDisconnect] = useState<boolean>(false);
  const [version] = useState<string>(() => {
    return VersionCheck.getCurrentVersion();
  });

  const openWithdrawModal = useCallback(() => {
    setIsWithdraw(true);
  }, []);

  const closeWithdrawModal = useCallback(() => {
    setIsWithdraw(false);
  }, []);

  const openDisconnectModal = useCallback(() => {
    setIsDisconnect(true);
  }, []);

  const closeDisconnectModal = useCallback(() => {
    setIsDisconnect(false);
  }, []);

  const logoutApp = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const disconnectCouple = useCallback(async () => {
    const response = await fetchDisconnectCouple();

    if (response.statusCode === 204) {
      await removeSecureValue('accessToken');
      await removeSecureValue('refreshToken');
      logoutApp();
    }

    closeDisconnectModal();
  }, [closeDisconnectModal, logoutApp]);

  const withdrawUser = useCallback(async () => {
    const response = await fetchWithdraw();

    if (response.statusCode === 204) {
      await removeSecureValue('accessToken');
      await removeSecureValue('refreshToken');
      logoutApp();
    }

    closeWithdrawModal();
  }, [closeWithdrawModal, logoutApp]);

  const moveProfile = () => {
    navigation.navigate('Profile', {
      user: user!,
    });
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userData = JSON.stringify(await userAPI.getUserMe()); // login 정보 가져오기
      const users = JSON.parse(userData);
      console.log(users);
      const response: Couple = {
        cupId: 'gPz9fLmw',
        cupDay: '2023-01-17',
        title: '커플 제목2',
        thumbnail: 'couples/gPz9fLmw/thumbnail/1675832561129.check.png',
        createdTime: '2023-01-23T05:03:49.000Z',
        users: [
          {
            userId: users.userId,
            cupId: users.cupId,
            snsKind: users.snsKind,
            snsId: users.snsId,
            code: users.code,
            name: users.name,
            email: users.email,
            birthday: users.birthday,
            phone: users.phone,
            profile: users.profile
              ? `${IMG_BASE_URL}${users.profile}`
              : 'https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg',
            primaryNofi: users.primaryNofi,
            dateNofi: users.dateNofi,
            eventNofi: users.eventNofi,
          },
          {
            userId: users.couple.userId,
            cupId: users.couple.cupId,
            snsKind: users.couple.snsKind,
            snsId: users.couple.snsId,
            code: users.couple.code,
            name: users.couple.name,
            email: users.couple.email,
            birthday: users.couple.birthday,
            phone: users.couple.phone,
            profile: users.couple.profile
              ? `${IMG_BASE_URL}${users.couple.profile}`
              : 'https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg',
            primaryNofi: users.couple.primaryNofi,
            dateNofi: users.couple.dateNofi,
            eventNofi: users.couple.eventNofi,
          },
        ],
      };

      setUser(response.users[0]);
      setCoupleUser(response.users[1]);
    };

    if (isFocused) {
      fetchUserInfo();
    }
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <BackHeader style={globalStyles.plpr20} />
      <ScrollView
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        <View style={[globalStyles.plpr20, styles.profileBox]}>
          {user ? (
            <Pressable
              style={[styles.profile, styles.mb15]}
              onPress={moveProfile}>
              <View style={styles.profileImgBox}>
                {user.profile ? (
                  <Image
                    source={{ uri: user.profile }}
                    style={styles.profileImg}
                  />
                ) : (
                  <DefaultPersonSVG style={styles.profileDefaultImg} />
                )}
              </View>
              <View style={styles.infoBox}>
                <CustomText size={16} weight="medium">
                  {user.name}
                </CustomText>
                <CustomText size={14} weight="regular" color="#999999">
                  {user.birthday}
                </CustomText>
              </View>
              <ArrowRightSVG />
            </Pressable>
          ) : null}
          {coupleUser ? (
            <View style={styles.profile}>
              <View style={styles.profileImgBox}>
                {coupleUser.profile ? (
                  <Image
                    source={{ uri: coupleUser.profile }}
                    style={styles.profileImg}
                  />
                ) : (
                  <DefaultPersonSVG style={styles.profileDefaultImg} />
                )}
              </View>
              <View style={styles.infoBox}>
                <CustomText size={16} weight="medium">
                  {coupleUser.name}
                </CustomText>
                <CustomText size={14} weight="regular" color="#999999">
                  {coupleUser.birthday}
                </CustomText>
              </View>
            </View>
          ) : null}
        </View>
        <View>
          <View style={[globalStyles.plpr20, styles.navItemBox]}>
            <SettingsItem title="공지사항" navName="Notice" isMargin />
            <SettingsItem title="고객센터" navName="ServiceCenter" />
          </View>
          <View style={[globalStyles.plpr20, styles.navItemBox]}>
            <SettingsItem title="알람" navName="Alram" />
          </View>
          <View style={[globalStyles.plpr20, styles.navItemBox]}>
            <Pressable style={styles.navItem} onPress={openDisconnectModal}>
              <CustomText size={16} weight="regular">
                연인 끊기
              </CustomText>
              <ArrowRightSVG width={15} height={15} />
            </Pressable>
            <Pressable style={styles.navItem} onPress={openWithdrawModal}>
              <CustomText size={16} weight="regular">
                회원 탈퇴
              </CustomText>
              <ArrowRightSVG width={15} height={15} />
            </Pressable>
          </View>
          <View style={[globalStyles.plpr20, styles.navItemBox]}>
            <SettingsItem title="이용약관" navName="TermsOfUse" isMargin />
            <SettingsItem
              title="개인정보 처리방침"
              navName="TermsOfPrivacyPolicy"
              isMargin
            />
            <View style={styles.navItem}>
              <CustomText size={16} weight="regular">
                앱 버전
              </CustomText>
              <CustomText size={16} weight="medium">
                {version}
              </CustomText>
            </View>
          </View>
        </View>
      </ScrollView>
      <Modal
        isVisible={isDisconnect}
        onBackdropPress={closeDisconnectModal}
        onBackButtonPress={closeDisconnectModal}
        deviceWidth={width}
        deviceHeight={height}
        style={styles.bottomModal}>
        <ConfirmModalView
          title="연인 끊기"
          subTitle="연인을 끊겠습니까?"
          description="연인을 끊게되면 앨범, 일정을 더 이상 되돌릴 수 없게 됩니다."
          cancelText="취소"
          confirmText="끊기"
          onPressCancel={closeDisconnectModal}
          onPressConfirm={disconnectCouple}
        />
      </Modal>
      <Modal
        isVisible={isWithdraw}
        onBackdropPress={closeWithdrawModal}
        onBackButtonPress={closeWithdrawModal}
        deviceWidth={width}
        deviceHeight={height}
        style={styles.bottomModal}>
        <ConfirmModalView
          title="회원 탈퇴"
          subTitle="회원을 탈퇴 하시겠습니까?"
          description="회원을 탈퇴하시게 된다면 연인과의 관련된 정보(앨범, 일정)을 더 이상 되돌릴 수 없게 됩니다."
          cancelText="취소"
          confirmText="탈퇴"
          onPressCancel={closeWithdrawModal}
          onPressConfirm={withdrawUser}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileBox: {
    alignItems: 'center',
    marginBottom: 5,
    paddingVertical: 25,
    backgroundColor: '#FFFFFF',
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mb15: {
    marginBottom: 15,
  },
  profileImgBox: {
    overflow: 'hidden',
    position: 'relative',
    width: PROFILE_SIZE,
    height: PROFILE_SIZE,
    borderRadius: PROFILE_SIZE / 2,
    backgroundColor: '#E4E8EF',
    marginRight: 20,
    elevation: 1,
  },
  profileImg: {
    width: PROFILE_SIZE,
    height: PROFILE_SIZE,
    borderRadius: PROFILE_SIZE / 2,
  },
  profileDefaultImg: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 0,
  },
  infoBox: {
    flex: 1,
    marginRight: 20,
  },
  navItemBox: {
    marginBottom: 5,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  navItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  mb10: {
    marginBottom: 10,
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
});

export default Settings;
