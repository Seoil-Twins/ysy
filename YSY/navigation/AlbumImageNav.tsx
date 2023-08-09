import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import ShareSvg from '../assets/icons/share.svg';
import DeleteSvg from '../assets/icons/delete.svg';
import DownloadSvg from '../assets/icons/download.svg';

import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useAppDispatch } from '../redux/hooks';

import { albumFunc } from '../features/albumSlice';

const screenWidth = wp('100%');

const AlbumImageNav = () => {
  const dispatch = useAppDispatch();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 48,
        width: screenWidth,
        zIndex: 1,
        backgroundColor: 'white',
        position: 'absolute',
        bottom: 0,
        left: 0,
      }}>
      <TouchableOpacity
        style={{
          width: screenWidth * 0.2,
          marginLeft: screenWidth * 0.1,
        }}
        onPress={() => {
          dispatch(albumFunc('ImageShare'));
        }}>
        <ShareSvg width={30} height={25} />
      </TouchableOpacity>
      <TouchableOpacity
        style={{ width: screenWidth * 0.3, alignItems: 'center' }}
        onPress={() => {
          dispatch(albumFunc('ImageDownload'));
        }}>
        <DownloadSvg width={26} height={26} />
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          width: screenWidth * 0.2,
          marginRight: screenWidth * 0.1,
          alignItems: 'flex-end',
        }}
        onPress={() => {
          dispatch(albumFunc('ImageDelete'));
        }}>
        <DeleteSvg width={25} height={27} />
      </TouchableOpacity>
    </View>
  );
};

export default AlbumImageNav;
