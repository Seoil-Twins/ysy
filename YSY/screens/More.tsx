import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
// import ReactNativeBlobUtil from 'react-native-blob-util';

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

  const moveRecent = () => {
    navigation.navigate('Recent');
  };
    
//   useEffect(() => {
//     const fetchMyImage = () => {
//       const date = new Date();
//       const { config, fs } = ReactNativeBlobUtil;
//       const fileDir = fs.dirs.DownloadDir;

//       // 'http://tong.visitkorea.or.kr/cms/resource/46/1290346_image2_1.jpg',
//       // 'http://tong.visitkorea.or.kr/cms/resource/38/1290338_image2_1.jpg',
//       // 'http://tong.visitkorea.or.kr/cms/resource/40/1290340_image2_1.jpg',
//       config({
//         fileCache: true,
//         addAndroidDownloads: {
//           useDownloadManager: true,
//           notification: true,
//           description: 'file download',
//           path:
//             fileDir +
//             '/download_' +
//             Math.floor(date.getDate() + date.getSeconds() / 2) +
//             '.png',
//         },
//       })
//         .fetch(
//           'GET',
//           'https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg',
//         )
//         .then(async res => {
//           const imagePath = res.path();
//           console.log(imagePath);

//           ReactNativeBlobUtil.fs
//             .scanFile([{ path: imagePath, mime: 'image/jpg' }])
//             .then(() => {
//               console.log('success');
//             })
//             .catch(res => {
//               console.log('failed', res);
//             });
//         })
//         .catch((res: any) => {
//           console.log(res);
//         });
//     };

//     fetchMyImage();
//   }, []);

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
        <Pressable style={styles.itemBox} onPress={moveRecent}>
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
