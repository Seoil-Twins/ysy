import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
} from 'react-native';
import {
  ImageLibraryOptions,
  ImagePickerResponse,
  launchImageLibrary,
} from 'react-native-image-picker';

import SortSvg from '../assets/icons/sort.svg';
import SettingSvg from '../assets/icons/settings.svg';
import AddSvg from '../assets/icons/add.svg';
import WCheckSvg from '../assets/icons/white_check.svg';
import WCheckBigSvg from '../assets/icons/white_check_big.svg';
import BCheckSvg from '../assets/icons/check.svg';
import UCheckSvg from '../assets/icons/un-check.svg';
import BackSvg from '../assets/icons/back.svg';
import MoreSvg from '../assets/icons/more_vert.svg';
import BAddSvg from '../assets/icons/add_black.svg';

import { albumSelectionOn, albumSelectionOff } from '../features/albumSlice';

import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { RootState } from '../redux/store';
import { imageSelectionOff, imageSelectionOn } from '../features/ImageSlice';
import { AlbumTypes } from '../navigation/AlbumTypes';
import { RouteProp, useRoute } from '@react-navigation/native';

const screenWidth = wp('100%');

export const AlbumDetail = () => {
  const { albumName } = useRoute<RouteProp<AlbumTypes, 'AlbumDetail'>>().params;
  console.log(albumName);
  return (
    <View style={{ flex: 1 }}>
      <Text> dd </Text>
    </View>
  );
};

export default AlbumDetail;
