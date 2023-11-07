import React, { useState } from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  View,
  Pressable,
  Image,
} from 'react-native';
import { globalStyles } from '../style/global';
import {
  RouteProp,
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PERMISSIONS } from 'react-native-permissions';
import Modal from 'react-native-modal';
import ImageCropPicker, { ImageOrVideo } from 'react-native-image-crop-picker';

import ConfirmHeader from '../components/ConfirmHeader';
import CustomText from '../components/CustomText';
import ImagePickerModal, { EventBtnType } from '../components/ImagePickerModal';

import DefaultPersonSVG from '../assets/icons/person.svg';
import PhotoSVG from '../assets/icons/photo.svg';

import { SettingsNavType } from '../navigation/NavTypes';

import { User } from '../types/user';

import { checkPermission } from '../util/permission';
import { userAPI } from '../apis/userAPI';

const PROFILE_SIZE = 100;
const CROP_SIZE = 300;
const { width, height } = Dimensions.get('window');
// const IMG_BASE_URL = 'https://storage.googleapis.com/ysy-bucket/';

const fetchEditProfile = async (profile: string | null) => {
  const response = {
    statusCode: 204,
  };

  return response;
};

const Profile = () => {
  const navigation = useNavigation<StackNavigationProp<SettingsNavType>>();
  const { params } = useRoute<RouteProp<SettingsNavType, 'Profile'>>();
  const infos = [
    {
      title: '이름',
      value: params.user.name,
    },
    {
      title: '생년월일',
      value: params.user.birthday,
    },
    {
      title: '휴대폰 번호',
      value: params.user.phone,
    },
    {
      title: '이메일',
      value: params.user.email,
    },
  ];

  const [user, setUser] = useState<User>(params.user);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const moveEditProfile = () => {
    navigation.navigate('EditProfile', {
      user: user,
    });
  };

  const openModal = () => {
    setIsVisible(true);
  };

  const closeModal = () => {
    setIsVisible(false);
  };

  const onSuccess = async (image: ImageOrVideo) => {
    const date = new Date();
    const imageFile = {
      uri: image.path,
      name: `profile-${date.getMilliseconds()}`,
      size: image.size,
      type: image.mime,
    };
    try {
      const response = await userAPI.patchUserProfile(
        user.userId,
        'profile',
        imageFile,
      );

      if (response.statusCode === 204) {
        user.profile = image.path;
        setUser({ ...user });
      } else {
        console.log('Error!');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onError = async (error: any) => {
    if (String(error).includes('permission') && Platform.OS === 'android') {
      await checkPermission(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
    } else if (String(error).includes('permission') && Platform.OS === 'ios') {
      await checkPermission(PERMISSIONS.IOS.PHOTO_LIBRARY);
    }
  };

  const onPressImagePicker = async (type: EventBtnType) => {
    if (type === 'Album') {
      ImageCropPicker.openPicker({
        width: CROP_SIZE,
        height: CROP_SIZE,
        cropping: true,
        cropperCircleOverlay: true,
      })
        .then(onSuccess)
        .catch(onError);
    } else if (type === 'Camera') {
      ImageCropPicker.openCamera({
        width: CROP_SIZE,
        height: CROP_SIZE,
        cropping: true,
        cropperCircleOverlay: true,
      })
        .then(onSuccess)
        .catch(onError);
    } else if (type === 'Default') {
      const response = await fetchEditProfile(null);

      if (response.statusCode === 204) {
        user.profile = null;
      } else {
        console.log('Error!');
      }
    }

    closeModal();
  };

  useFocusEffect(() => {
    setUser(params.user);
  });

  return (
    <View style={styles.container}>
      <ConfirmHeader
        btnText="수정"
        isEnable={false}
        onPress={moveEditProfile}
      />
      <View style={[globalStyles.plpr20, styles.content]}>
        <View style={styles.profileContainer}>
          <Pressable style={styles.profileEditBox} onPress={openModal}>
            <PhotoSVG />
          </Pressable>
          <Pressable style={styles.profileBox} onPress={openModal}>
            {user.profile ? (
              <Image source={{ uri: user.profile }} style={styles.profileImg} />
            ) : (
              <DefaultPersonSVG
                style={styles.profileDefaultImg}
                width={PROFILE_SIZE - 15}
                height={PROFILE_SIZE - 15}
              />
            )}
          </Pressable>
        </View>
        {infos.map((info, idx) => (
          <View style={styles.infoBox} key={idx}>
            <CustomText size={16} weight="regular" color="#999999">
              {info.title}
            </CustomText>
            <CustomText size={16} weight="medium">
              {info.value}
            </CustomText>
          </View>
        ))}
      </View>
      <Modal
        isVisible={isVisible}
        onBackdropPress={closeModal}
        onBackButtonPress={closeModal}
        deviceWidth={width}
        deviceHeight={height}
        style={styles.bottomModal}>
        <ImagePickerModal onPress={onPressImagePicker} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    marginTop: 25,
  },
  profileContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  profileBox: {
    overflow: 'hidden',
    position: 'relative',
    width: PROFILE_SIZE,
    height: PROFILE_SIZE,
    borderRadius: PROFILE_SIZE / 2,
    elevation: 1,
    backgroundColor: '#E4E8EF',
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
  profileEditBox: {
    position: 'absolute',
    bottom: 5,
    left: width / 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: 25,
    height: 25,
    borderRadius: 25 / 2,
    backgroundColor: '#A4A8AA',
    zIndex: 999,
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
    zIndex: 9999,
  },
});

export default Profile;
