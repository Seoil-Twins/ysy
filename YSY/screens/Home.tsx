import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  Image,
  Pressable,
  Platform,
  Dimensions,
  _Image,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ImageCropPicker, { ImageOrVideo } from 'react-native-image-crop-picker';
import { PERMISSIONS } from 'react-native-permissions';
import Modal from 'react-native-modal';

import CustomText from '../components/CustomText';

import { Couple } from '../types/couple';

import { globalStyles } from '../style/global';
import { checkPermission } from '../util/permission';

import DefaultPersonSVG from '../assets/icons/person.svg';
import LoveSVG from '../assets/icons/small_love.svg';
import CalendarSVG from '../assets/icons/calendar_lightgray.svg';
import PickImageSVG from '../assets/icons/pick_image.svg';
import { coupleAPI } from '../apis/coupleAPI';
import { userAPI } from '../apis/userAPI';

const { width, height } = Dimensions.get('window');
const IMG_BASE_URL = 'https://storage.googleapis.com/ysy-bucket/';

export interface File {
  uri: string;
  name: string;
  size: number;
  type: string;
}

const Home = () => {
  const [cupInfo, setCupInfo] = useState<Couple | undefined>(undefined);
  const [day, setDay] = useState<number>(0);
  const [cupDay, setCupDay] = useState<Date | undefined>(undefined);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const getCoupleInfo = async () => {
    const userData = JSON.stringify(await userAPI.getUserMe()); // login 정보 가져오기
    const userParsedData = JSON.parse(userData);
    const res: any = await coupleAPI.getCouple(userParsedData.cupId);
    const response: Couple = {
      cupId: res.cupId,
      cupDay: res.cupDay,
      title: '커플 제목',
      thumbnail: res.thumbnail ? `${IMG_BASE_URL}${res.thumbnail}` : null,
      createdTime: res.createdTime,
      users: [
        {
          userId: res.users[0].userId,
          cupId: res.users[0].cupId,
          snsId: res.users[0].snsId,
          snsKind: res.users[0].snsKind,
          code: res.users[0].code,
          name: res.users[0].name,
          email: res.users[0].email,
          birthday: res.users[0].birthday,
          phone: res.users[0].phone,
          profile: res.users[0].profile ? res.users[0].profile : null,
          // 'https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg',
          primaryNofi: res.users[0].primaryNofi,
          dateNofi: res.users[0].dateNofi,
          eventNofi: res.users[0].eventNofi,
        },
        {
          userId: res.users[1].userId,
          cupId: res.users[1].cupId,
          snsId: res.users[1].snsId,
          snsKind: res.users[1].snsKind,
          code: res.users[1].code,
          name: res.users[1].name,
          email: res.users[1].email,
          birthday: res.users[1].birthday,
          phone: res.users[1].phone,
          profile: res.users[1].profile ? res.users[1].profile : null,
          // 'https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg',
          primaryNofi: res.users[1].primaryNofi,
          dateNofi: res.users[1].dateNofi,
          eventNofi: res.users[1].eventNofi,
        },
      ],
    };
    console.log(response.thumbnail);

    setThumbnail(response.thumbnail);
    setCupDay(new Date(response.cupDay));
    setCupInfo(response);
  };

  const getServerTime = async () => {
    const serverTime = new Date();
    const response = new Date(
      `${serverTime.getFullYear()}-${
        serverTime.getMonth() + 1
      }-${serverTime.getDate()}`,
    );

    return response;
  };

  const daysDiff = (current: Date, cupDay: Date) => {
    const timeDiff = cupDay.getTime() - current.getTime();
    // 밀리초를 일수로 변환 (1일 = 24시간 * 60분 * 60초 * 1000밀리초)
    const diff = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
    return Math.abs(diff);
  };

  const calculateDay = useCallback(async () => {
    if (cupDay) {
      const current: Date = await getServerTime();
      const cupDayToDate: Date = new Date(cupDay);
      const days: number = daysDiff(current, cupDayToDate);

      setDay(days);
    }
  }, [cupDay]);

  useEffect(() => {
    getCoupleInfo();
  }, []);

  useEffect(() => {
    calculateDay();
  }, [cupDay, calculateDay]);

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const updateCupDay = async (_date: string) => {
    // 업데이트 커플 데이
    const userData = JSON.stringify(await userAPI.getUserMe()); // login 정보 가져오기
    const userParsedData = JSON.parse(userData);
    const data = { cupDay: _date };
    const response = coupleAPI.patchCouple(userParsedData.cupId, data);
    return response;
  };

  const handleConfirm = async (date: Date) => {
    try {
      console.log('date :: ' + date.getDate());
      await updateCupDay(
        `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate() + 1}`,
      );
      setCupDay(date);
    } catch (error) {
      console.log(error.response);
    }

    hideDatePicker();
  };

  const updateThumbnail = async (_image: ImageOrVideo | null) => {
    try {
      const userData = JSON.stringify(await userAPI.getUserMe()); // login 정보 가져오기
      const userParsedData = JSON.parse(userData);

      console.log('-------------------------------------------');
      if (_image) {
        const splitedFilename = _image!.path.split('/');
        const filename = _image!.path.split('/')[splitedFilename!.length - 1];

        // uri, name, size, type 추가해서 formdata로 넘기면 알아서 buffer가 들어감.
        // file 객체라는 것을 인지해서 buffer를 넣는지는 나도 잘 모르겠음.
        const newFile: File = {
          uri: _image!.path,
          name: filename,
          size: _image!.size,
          type: _image!.mime,
        };
        const response = await coupleAPI.patchFormdataCouple(
          userParsedData.cupId,
          newFile,
        );
        console.log(response);
      } else {
        console.log('asdasd');
        const response = await coupleAPI.patchFormdataCouple(
          userParsedData.cupId,
          null,
        );
        console.log('asdasd');
        console.log(response);
      }
    } catch (error: any) {
      console.log('error :: ' + error);
    }
  };

  const showModal = async () => {
    setModalVisible(true);
  };

  const hideModal = async () => {
    setModalVisible(false);
  };

  const onSuccess = async (image: ImageOrVideo) => {
    // Formdata를 통해 전송
    /**
     * {
        "cropRect":{
            "height":2857,
            "width":1713,
            "x":1168,
            "y":1
        },
        "height":600,
        "mime":"image/jpeg",
        "modificationDate":"1689677165000",
        "path":"file:///storage/emulated/0/Android/data/com.ysy/files/Pictures/3526149c-84b9-4ab6-92ec-a3943e1bde4b.jpg",
        "size":194997,
        "width":360
       }
     */
    await updateThumbnail(image);
    setThumbnail(image.path);
  };

  const onError = async (error: any) => {
    if (String(error).includes('permission') && Platform.OS === 'android') {
      await checkPermission(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
    } else if (String(error).includes('permission') && Platform.OS === 'ios') {
      await checkPermission(PERMISSIONS.IOS.PHOTO_LIBRARY);
    }
  };

  const showImagePicker = () => {
    hideModal();

    ImageCropPicker.openPicker({
      width: 360,
      height: 640,
      cropping: true,
    })
      .then(onSuccess)
      .catch(onError);
  };

  const showAlbumPicker = () => {
    hideModal();
    console.log('album picker');
  };

  const setDefaultThumbnail = async () => {
    hideModal();

    await updateThumbnail(null);
    setThumbnail(null);
  };

  return (
    <ImageBackground
      source={
        thumbnail
          ? { uri: thumbnail }
          : require('../assets/images/main_background.png')
      }
      resizeMode="cover"
      style={[styles.container, globalStyles.mlmr20]}>
      <View style={styles.titleBox}>
        <CustomText size={22} weight="regular" color="#FFFFFF">
          우리 사랑한지
        </CustomText>
        <View style={styles.titleRow}>
          <CustomText size={30} weight="medium" color="#FF6D70">
            {day}
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
      <View style={styles.funcBox}>
        <Pressable
          style={[styles.funcItem, styles.mr20]}
          onPress={showDatePicker}>
          <CalendarSVG />
        </Pressable>
        <Pressable style={styles.funcItem} onPress={showModal}>
          <PickImageSVG />
        </Pressable>
      </View>
      <DateTimePickerModal
        isVisible={datePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        locale="ko_KR"
        date={cupDay ? cupDay : new Date()}
        maximumDate={new Date()}
      />
      <Modal
        isVisible={modalVisible}
        onBackdropPress={hideModal}
        onBackButtonPress={hideModal}
        deviceWidth={width}
        deviceHeight={height}>
        <View style={styles.modal}>
          <CustomText size={20} weight="medium" style={styles.modalTitle}>
            배경사진
          </CustomText>
          <Pressable style={styles.modalItem} onPress={showImagePicker}>
            <CustomText size={14} weight="regular">
              갤러리에서 선택
            </CustomText>
          </Pressable>
          <Pressable style={styles.modalItem} onPress={showAlbumPicker}>
            <CustomText size={14} weight="regular">
              앨범에서 선택
            </CustomText>
          </Pressable>
          <Pressable style={styles.modalItem} onPress={setDefaultThumbnail}>
            <CustomText size={14} weight="regular">
              기본 이미지로 변경
            </CustomText>
          </Pressable>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleBox: {
    flex: 1,
    alignItems: 'center',
    marginTop: 70,
  },
  titleRow: {
    flexDirection: 'row',
  },
  userBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
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
    elevation: 1,
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
  funcBox: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 15,
  },
  funcItem: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 40 / 2,
    backgroundColor: '#0000004D',
  },
  mr20: {
    marginRight: 20,
  },
  modal: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    marginBottom: 10,
  },
  modalItem: {
    height: 40,
    justifyContent: 'center',
  },
});

export default Home;
