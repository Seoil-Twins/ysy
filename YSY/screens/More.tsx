import React, { useEffect } from 'react';
import ReactNativeBlobUtil from 'react-native-blob-util';

import CustomText from '../components/CustomText';

const More = () => {
  useEffect(() => {
    const fetchMyImage = () => {
      const date = new Date();
      const { config, fs } = ReactNativeBlobUtil;
      const fileDir = fs.dirs.DownloadDir;

      // 'http://tong.visitkorea.or.kr/cms/resource/46/1290346_image2_1.jpg',
      // 'http://tong.visitkorea.or.kr/cms/resource/38/1290338_image2_1.jpg',
      // 'http://tong.visitkorea.or.kr/cms/resource/40/1290340_image2_1.jpg',
      config({
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          description: 'file download',
          path:
            fileDir +
            '/download_' +
            Math.floor(date.getDate() + date.getSeconds() / 2) +
            '.png',
        },
      })
        .fetch(
          'GET',
          'https://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg',
        )
        .then(async res => {
          const imagePath = res.path();
          console.log(imagePath);

          ReactNativeBlobUtil.fs
            .scanFile([{ path: imagePath, mime: 'image/jpg' }])
            .then(() => {
              console.log('success');
            })
            .catch(res => {
              console.log('failed', res);
            });
        })
        .catch((res: any) => {
          console.log(res);
        });
    };

    fetchMyImage();
  }, []);

  return (
    <CustomText size={20} weight="regular">
      안녕하세요. More!!!!
    </CustomText>
  );
};

export default More;
