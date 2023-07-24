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

import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

const screenWidth = wp('100%');

export const Album = () => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [selectedSortMethod, setSelectedSortMethod] = useState('최신순');
  const [isDownloadVisible, setIsDownloadVisible] = useState(false);
  const [isMergeVisible, setIsMergeVisible] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [isImageDownloadVisible, setIsImageDownloadVisible] = useState(false);
  const [isImageShareVisible, setIsImageShareVisible] = useState(false);
  const [isImageDeleteVisible, setIsImageDeleteVisible] = useState(false);
  const [isSelectionModeImage, setIsSelectionModeImage] = useState(false);
  const [isMoreModalVisible, setIsMoreModalVisible] = useState(false);
  const [isRepImageSelMode, setIsRepImageSelMode] = useState(false);
  const [RepImage, setRepImage] = useState('');
  const [tmpRepImage, setTmpRepImage] = useState('');
  const [isModNameVisible, setIsModNameVisible] = useState(false);
  const [selectedAddImage, setSelectedAddImage] = useState<string | undefined>(
    undefined,
  );

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [albumImages, setAlbumImages] = useState<string[]>([]);
  const [numColumns] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [isPressed, setIsPressed] = useState({
    option1: false,
    option2: false,
    option3: false,
  });

  const dummyImages = [
    'https://fastly.picsum.photos/id/179/200/200.jpg?hmac=I0g6Uht7h-y3NHqWA4e2Nzrnex7m-RceP1y732tc4Lw',
    'https://fastly.picsum.photos/id/803/200/300.jpg?hmac=v-3AsAcUOG4kCDsLMlWF9_3Xa2DTODGyKLggZNvReno',
    'https://fastly.picsum.photos/id/999/200/300.jpg?hmac=XqjgMZW5yK4MjHpQJFs_TiRodRNf9UVKjJiGnDJV8GI',
    'https://fastly.picsum.photos/id/600/200/300.jpg?hmac=Ub3Deb_eQNe0Un7OyE33D79dnextn3M179L0nRkv1eg',
    'https://fastly.picsum.photos/id/193/200/300.jpg?hmac=b5ZG1TfdndbrnQ8UJbIu-ykB2PRWv0QpHwehH0pqMgE',
    'https://fastly.picsum.photos/id/341/200/300.jpg?hmac=tZpxFpS1LmFfC4e_ChqA5I8JfUfJuwH3oZvmQ58SzHc',
    'https://fastly.picsum.photos/id/387/200/300.jpg?hmac=JlKyfJE4yZ_jxmWXH5sNYl7JdDfP04DOk-hye4p_wtk',
    'https://fastly.picsum.photos/id/863/200/300.jpg?hmac=4kin1N4a7dzocUZXCwLWHewLobhw1Q6_e_9E3Iy3n0I',
    'https://fastly.picsum.photos/id/179/200/200.jpg?hmac=I0g6Uht7h-y3NHqWA4e2Nzrnex7m-RceP1y732tc4Lw',
    'https://fastly.picsum.photos/id/803/200/300.jpg?hmac=v-3AsAcUOG4kCDsLMlWF9_3Xa2DTODGyKLggZNvReno',
    'https://fastly.picsum.photos/id/999/200/300.jpg?hmac=XqjgMZW5yK4MjHpQJFs_TiRodRNf9UVKjJiGnDJV8GI',
    'https://fastly.picsum.photos/id/600/200/300.jpg?hmac=Ub3Deb_eQNe0Un7OyE33D79dnextn3M179L0nRkv1eg',
    'https://fastly.picsum.photos/id/193/200/300.jpg?hmac=b5ZG1TfdndbrnQ8UJbIu-ykB2PRWv0QpHwehH0pqMgE',
    'https://fastly.picsum.photos/id/341/200/300.jpg?hmac=tZpxFpS1LmFfC4e_ChqA5I8JfUfJuwH3oZvmQ58SzHc',
    'https://fastly.picsum.photos/id/387/200/300.jpg?hmac=JlKyfJE4yZ_jxmWXH5sNYl7JdDfP04DOk-hye4p_wtk',
    'https://fastly.picsum.photos/id/863/200/300.jpg?hmac=4kin1N4a7dzocUZXCwLWHewLobhw1Q6_e_9E3Iy3n0I',
    'https://fastly.picsum.photos/id/179/200/200.jpg?hmac=I0g6Uht7h-y3NHqWA4e2Nzrnex7m-RceP1y732tc4Lw',
    'https://fastly.picsum.photos/id/803/200/300.jpg?hmac=v-3AsAcUOG4kCDsLMlWF9_3Xa2DTODGyKLggZNvReno',
    'https://fastly.picsum.photos/id/999/200/300.jpg?hmac=XqjgMZW5yK4MjHpQJFs_TiRodRNf9UVKjJiGnDJV8GI',
    'https://fastly.picsum.photos/id/600/200/300.jpg?hmac=Ub3Deb_eQNe0Un7OyE33D79dnextn3M179L0nRkv1eg',
    'https://fastly.picsum.photos/id/193/200/300.jpg?hmac=b5ZG1TfdndbrnQ8UJbIu-ykB2PRWv0QpHwehH0pqMgE',
    'https://fastly.picsum.photos/id/341/200/300.jpg?hmac=tZpxFpS1LmFfC4e_ChqA5I8JfUfJuwH3oZvmQ58SzHc',
    'https://fastly.picsum.photos/id/387/200/300.jpg?hmac=JlKyfJE4yZ_jxmWXH5sNYl7JdDfP04DOk-hye4p_wtk',
    'https://fastly.picsum.photos/id/863/200/300.jpg?hmac=4kin1N4a7dzocUZXCwLWHewLobhw1Q6_e_9E3Iy3n0I',
    'https://fastly.picsum.photos/id/179/200/200.jpg?hmac=I0g6Uht7h-y3NHqWA4e2Nzrnex7m-RceP1y732tc4Lw',
    'https://fastly.picsum.photos/id/803/200/300.jpg?hmac=v-3AsAcUOG4kCDsLMlWF9_3Xa2DTODGyKLggZNvReno',
    'https://fastly.picsum.photos/id/999/200/300.jpg?hmac=XqjgMZW5yK4MjHpQJFs_TiRodRNf9UVKjJiGnDJV8GI',
    'https://fastly.picsum.photos/id/600/200/300.jpg?hmac=Ub3Deb_eQNe0Un7OyE33D79dnextn3M179L0nRkv1eg',
    'https://fastly.picsum.photos/id/193/200/300.jpg?hmac=b5ZG1TfdndbrnQ8UJbIu-ykB2PRWv0QpHwehH0pqMgE',
    'https://fastly.picsum.photos/id/341/200/300.jpg?hmac=tZpxFpS1LmFfC4e_ChqA5I8JfUfJuwH3oZvmQ58SzHc',
    'https://fastly.picsum.photos/id/387/200/300.jpg?hmac=JlKyfJE4yZ_jxmWXH5sNYl7JdDfP04DOk-hye4p_wtk',
    'https://fastly.picsum.photos/id/863/200/300.jpg?hmac=4kin1N4a7dzocUZXCwLWHewLobhw1Q6_e_9E3Iy3n0I',
    'https://fastly.picsum.photos/id/179/200/200.jpg?hmac=I0g6Uht7h-y3NHqWA4e2Nzrnex7m-RceP1y732tc4Lw',
    'https://fastly.picsum.photos/id/803/200/300.jpg?hmac=v-3AsAcUOG4kCDsLMlWF9_3Xa2DTODGyKLggZNvReno',
    'https://fastly.picsum.photos/id/999/200/300.jpg?hmac=XqjgMZW5yK4MjHpQJFs_TiRodRNf9UVKjJiGnDJV8GI',
    'https://fastly.picsum.photos/id/600/200/300.jpg?hmac=Ub3Deb_eQNe0Un7OyE33D79dnextn3M179L0nRkv1eg',
    'https://fastly.picsum.photos/id/193/200/300.jpg?hmac=b5ZG1TfdndbrnQ8UJbIu-ykB2PRWv0QpHwehH0pqMgE',
    'https://fastly.picsum.photos/id/341/200/300.jpg?hmac=tZpxFpS1LmFfC4e_ChqA5I8JfUfJuwH3oZvmQ58SzHc',
    'https://fastly.picsum.photos/id/387/200/300.jpg?hmac=JlKyfJE4yZ_jxmWXH5sNYl7JdDfP04DOk-hye4p_wtk',
    'https://fastly.picsum.photos/id/863/200/300.jpg?hmac=4kin1N4a7dzocUZXCwLWHewLobhw1Q6_e_9E3Iy3n0I',
    'https://fastly.picsum.photos/id/179/200/200.jpg?hmac=I0g6Uht7h-y3NHqWA4e2Nzrnex7m-RceP1y732tc4Lw',
    'https://fastly.picsum.photos/id/803/200/300.jpg?hmac=v-3AsAcUOG4kCDsLMlWF9_3Xa2DTODGyKLggZNvReno',
    'https://fastly.picsum.photos/id/999/200/300.jpg?hmac=XqjgMZW5yK4MjHpQJFs_TiRodRNf9UVKjJiGnDJV8GI',
    'https://fastly.picsum.photos/id/600/200/300.jpg?hmac=Ub3Deb_eQNe0Un7OyE33D79dnextn3M179L0nRkv1eg',
    'https://fastly.picsum.photos/id/193/200/300.jpg?hmac=b5ZG1TfdndbrnQ8UJbIu-ykB2PRWv0QpHwehH0pqMgE',
    'https://fastly.picsum.photos/id/341/200/300.jpg?hmac=tZpxFpS1LmFfC4e_ChqA5I8JfUfJuwH3oZvmQ58SzHc',
    'https://fastly.picsum.photos/id/387/200/300.jpg?hmac=JlKyfJE4yZ_jxmWXH5sNYl7JdDfP04DOk-hye4p_wtk',
    'https://fastly.picsum.photos/id/863/200/300.jpg?hmac=4kin1N4a7dzocUZXCwLWHewLobhw1Q6_e_9E3Iy3n0I',
    'https://fastly.picsum.photos/id/179/200/200.jpg?hmac=I0g6Uht7h-y3NHqWA4e2Nzrnex7m-RceP1y732tc4Lw',
    'https://fastly.picsum.photos/id/803/200/300.jpg?hmac=v-3AsAcUOG4kCDsLMlWF9_3Xa2DTODGyKLggZNvReno',
    'https://fastly.picsum.photos/id/999/200/300.jpg?hmac=XqjgMZW5yK4MjHpQJFs_TiRodRNf9UVKjJiGnDJV8GI',
    'https://fastly.picsum.photos/id/600/200/300.jpg?hmac=Ub3Deb_eQNe0Un7OyE33D79dnextn3M179L0nRkv1eg',
    'https://fastly.picsum.photos/id/193/200/300.jpg?hmac=b5ZG1TfdndbrnQ8UJbIu-ykB2PRWv0QpHwehH0pqMgE',
    'https://fastly.picsum.photos/id/341/200/300.jpg?hmac=tZpxFpS1LmFfC4e_ChqA5I8JfUfJuwH3oZvmQ58SzHc',
    'https://fastly.picsum.photos/id/387/200/300.jpg?hmac=JlKyfJE4yZ_jxmWXH5sNYl7JdDfP04DOk-hye4p_wtk',
    'https://fastly.picsum.photos/id/863/200/300.jpg?hmac=4kin1N4a7dzocUZXCwLWHewLobhw1Q6_e_9E3Iy3n0I',
    'https://fastly.picsum.photos/id/179/200/200.jpg?hmac=I0g6Uht7h-y3NHqWA4e2Nzrnex7m-RceP1y732tc4Lw',
    'https://fastly.picsum.photos/id/803/200/300.jpg?hmac=v-3AsAcUOG4kCDsLMlWF9_3Xa2DTODGyKLggZNvReno',
    'https://fastly.picsum.photos/id/999/200/300.jpg?hmac=XqjgMZW5yK4MjHpQJFs_TiRodRNf9UVKjJiGnDJV8GI',
    'https://fastly.picsum.photos/id/600/200/300.jpg?hmac=Ub3Deb_eQNe0Un7OyE33D79dnextn3M179L0nRkv1eg',
    'https://fastly.picsum.photos/id/193/200/300.jpg?hmac=b5ZG1TfdndbrnQ8UJbIu-ykB2PRWv0QpHwehH0pqMgE',
    'https://fastly.picsum.photos/id/341/200/300.jpg?hmac=tZpxFpS1LmFfC4e_ChqA5I8JfUfJuwH3oZvmQ58SzHc',
    'https://fastly.picsum.photos/id/387/200/300.jpg?hmac=JlKyfJE4yZ_jxmWXH5sNYl7JdDfP04DOk-hye4p_wtk',
    'https://fastly.picsum.photos/id/863/200/300.jpg?hmac=4kin1N4a7dzocUZXCwLWHewLobhw1Q6_e_9E3Iy3n0I',
    'https://fastly.picsum.photos/id/179/200/200.jpg?hmac=I0g6Uht7h-y3NHqWA4e2Nzrnex7m-RceP1y732tc4Lw',
    'https://fastly.picsum.photos/id/803/200/300.jpg?hmac=v-3AsAcUOG4kCDsLMlWF9_3Xa2DTODGyKLggZNvReno',
    'https://fastly.picsum.photos/id/999/200/300.jpg?hmac=XqjgMZW5yK4MjHpQJFs_TiRodRNf9UVKjJiGnDJV8GI',
    'https://fastly.picsum.photos/id/600/200/300.jpg?hmac=Ub3Deb_eQNe0Un7OyE33D79dnextn3M179L0nRkv1eg',
    'https://fastly.picsum.photos/id/193/200/300.jpg?hmac=b5ZG1TfdndbrnQ8UJbIu-ykB2PRWv0QpHwehH0pqMgE',
    'https://fastly.picsum.photos/id/341/200/300.jpg?hmac=tZpxFpS1LmFfC4e_ChqA5I8JfUfJuwH3oZvmQ58SzHc',
    'https://fastly.picsum.photos/id/387/200/300.jpg?hmac=JlKyfJE4yZ_jxmWXH5sNYl7JdDfP04DOk-hye4p_wtk',
    'https://fastly.picsum.photos/id/863/200/300.jpg?hmac=4kin1N4a7dzocUZXCwLWHewLobhw1Q6_e_9E3Iy3n0I',
    'https://fastly.picsum.photos/id/179/200/200.jpg?hmac=I0g6Uht7h-y3NHqWA4e2Nzrnex7m-RceP1y732tc4Lw',
    'https://fastly.picsum.photos/id/803/200/300.jpg?hmac=v-3AsAcUOG4kCDsLMlWF9_3Xa2DTODGyKLggZNvReno',
    'https://fastly.picsum.photos/id/999/200/300.jpg?hmac=XqjgMZW5yK4MjHpQJFs_TiRodRNf9UVKjJiGnDJV8GI',
    'https://fastly.picsum.photos/id/600/200/300.jpg?hmac=Ub3Deb_eQNe0Un7OyE33D79dnextn3M179L0nRkv1eg',
    'https://fastly.picsum.photos/id/193/200/300.jpg?hmac=b5ZG1TfdndbrnQ8UJbIu-ykB2PRWv0QpHwehH0pqMgE',
    'https://fastly.picsum.photos/id/341/200/300.jpg?hmac=tZpxFpS1LmFfC4e_ChqA5I8JfUfJuwH3oZvmQ58SzHc',
    'https://fastly.picsum.photos/id/387/200/300.jpg?hmac=JlKyfJE4yZ_jxmWXH5sNYl7JdDfP04DOk-hye4p_wtk',
    'https://fastly.picsum.photos/id/863/200/300.jpg?hmac=4kin1N4a7dzocUZXCwLWHewLobhw1Q6_e_9E3Iy3n0I',
    //... (앨범에 해당하는 이미지 URL 추가)
  ];

  // const flatListKey = activeTab === 'AlbumModal' ? 'AlbumModal' : 'Default';

  // 앨범 모달 열기
  const openAlbumModal = () => {
    setContextMenuVisible(true);
    // setActiveTab('AlbumModal'); // 모달이 열릴 때 activeTab을 'AlbumModal'로 설정
  };

  // 앨범 모달 닫기
  const closeAlbumModal = () => {
    setContextMenuVisible(false);
    // setActiveTab('Default'); // 모달이 닫힐 때 activeTab을 다시 'Album'으로 설정
  };

  // 앨범 모달 열기
  const openImageModal = () => {
    setContextMenuVisible(true);
    // setActiveTab('ImageModal'); // 모달이 열릴 때 activeTab을 'AlbumModal'로 설정
  };

  // 앨범 모달 닫기
  const closeImageModal = () => {
    setContextMenuVisible(false);
    // setActiveTab('Default'); // 모달이 닫힐 때 activeTab을 다시 'Album'으로 설정
  };

  const closeMoreModal = () => {
    setIsMoreModalVisible(false);
    setIsPressed({
      option1: false,
      option2: false,
      option3: false,
    });
  };

  // useEffect(() => {
  //   if (activeTab.includes('Album')) {
  //     if (activeTab.includes('Download')) {
  //       setIsDownloadVisible(true);
  //     } else {
  //       setIsDownloadVisible(false);
  //     }

  //     if (activeTab.includes('Merge')) {
  //       setIsMergeVisible(true);
  //     } else {
  //       setIsMergeVisible(false);
  //     }

  //     if (activeTab.includes('Delete')) {
  //       setIsDeleteVisible(true);
  //     } else {
  //       setIsDeleteVisible(false);
  //     }
  //   } else if (activeTab.includes('Image')) {
  //     if (activeTab.includes('Download')) {
  //       setIsImageDownloadVisible(true);
  //     } else {
  //       setIsImageDownloadVisible(false);
  //     }

  //     if (activeTab.includes('Share')) {
  //       setIsImageShareVisible(true);
  //     } else {
  //       setIsImageShareVisible(false);
  //     }

  //     if (activeTab.includes('Delete')) {
  //       setIsImageDeleteVisible(true);
  //     } else {
  //       setIsImageDeleteVisible(false);
  //     }
  //   }
  // }, [activeTab]);

  // useEffect(() => {
  //   if(albumImages > 0)
  //     loadMoreData();
  // }, [albumImages]);

  const loadMoreData = () => {
    // 이미 로딩 중이거나 데이터가 모두 로딩되었을 경우 함수 실행 종료
    if (isLoading || albumImages.length === dummyImages.length) {
      return;
    }

    // 데이터 로딩 시작
    setIsLoading(true);

    // 모의 API 호출 또는 기타 데이터 로딩 로직 구현
    // 이 예시에서는 setTimeout을 사용하여 1초 후에 새로운 데이터를 추가로 로딩합니다.
    setTimeout(() => {
      const newData = dummyImages.slice(
        albumImages.length,
        albumImages.length + 8,
      ); // 8개씩 추가로 로딩
      setAlbumImages(prevData => [...prevData, ...newData]);
      setIsLoading(false);
    }, 1000);
  };

  const handleSelectAll = () => {
    if (isSelectionMode) {
      if (selectedAlbums.length > 0) {
        // 이미 선택된 앨범이 있는 경우 전체 해제 동작 수행
        setSelectedAlbums([]);
      } else {
        // 선택된 앨범이 없는 경우 전체 선택 동작 수행
        setSelectedAlbums(dummyFolder);
      }
    }
    if (isSelectionModeImage) {
      if (selectedImages.length > 0) {
        // 이미 선택된 앨범이 있는 경우 전체 해제 동작 수행
        setSelectedImages([]);
      } else {
        // 선택된 앨범이 없는 경우 전체 선택 동작 수행
        setSelectedImages(albumImages);
      }
    }
  };

  const renderHeaderRight = () => {
    if (isSelectionMode) {
      const numSelected = selectedAlbums.length;
      return (
        <View>
          <TouchableOpacity onPress={handleSelectAll}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {numSelected > 0 ? (
                <BCheckSvg style={{ marginRight: 5 }} />
              ) : (
                <UCheckSvg style={{ marginRight: 5 }} />
              )}
              <Text
                style={{
                  color: numSelected > 0 ? '#3675FB' : '#999999',
                  marginRight: 15,
                }}>
                {numSelected > 0 ? '선택 해제' : '모두 선택'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    } else {
      if (albumImages.length > 0) {
        if (isSelectionModeImage) {
          const numSelected = selectedImages.length;
          return (
            <View>
              <TouchableOpacity onPress={handleSelectAll}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {numSelected > 0 ? (
                    <BCheckSvg style={{ marginRight: 5 }} />
                  ) : (
                    <UCheckSvg style={{ marginRight: 5 }} />
                  )}
                  <Text
                    style={{
                      color: numSelected > 0 ? '#3675FB' : '#999999',
                      marginRight: 15,
                    }}>
                    {numSelected > 0 ? '선택 해제' : '모두 선택'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        } else if (isRepImageSelMode) {
          return (
            <View
              style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() => {
                    handleBackBtn();
                  }}>
                  <BackSvg style={{ width: 70, height: 70, margin: 18 }} />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() => {
                    handleRepTrans();
                  }}>
                  <Text
                    style={{
                      color: '#3675FB',
                      marginRight: 15,
                    }}>
                    변경
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        } else {
          return (
            <View style={{ flexDirection: 'row', flex: 1 }}>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() => {
                    handleBackBtn();
                  }}>
                  <BackSvg style={{ width: 70, height: 70, margin: 18 }} />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() => {
                    handleAddImage();
                  }}>
                  <BAddSvg style={{ width: 70, height: 70, margin: 18 }} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    handleMoreBtn();
                  }}>
                  <MoreSvg style={{ width: 70, height: 70, margin: 18 }} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }
      } else {
        return (
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() => {
                openSortModal();
              }}>
              <SortSvg style={styles.imgBox} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
              <SettingSvg style={styles.imgBox} />
            </TouchableOpacity>
          </View>
        );
      }
    }
  };

  const handleAlbumPress = (albumName: string) => {
    if (isSelectionMode) {
      setSelectedAlbums(prevSelectedAlbums => {
        if (prevSelectedAlbums.includes(albumName)) {
          // 이미 선택된 앨범인 경우 선택 해제
          return prevSelectedAlbums.filter(item => item !== albumName);
        } else {
          // 선택되지 않은 앨범인 경우 선택 추가
          return [...prevSelectedAlbums, albumName];
        }
      });
    } else {
      // 다중 선택 모드가 아닐 때는 단일 앨범을 선택하는 로직
      if (albumImages.length <= 0) {
        setAlbumImages(dummyImages.slice(0, 32));
        setSelectedAlbums([albumName]);
        loadMoreData();
      } else {
        setAlbumImages([]);
      }
    }
  };

  const handleLongPress = (albumName: string) => {
    if (isSelectionMode === true) {
      handleSelectionCancel();
      closeAlbumModal();
    } else {
      setIsSelectionMode(true);
      setSelectedAlbums([albumName]);
      openAlbumModal();
    }
  };

  const handleImagePress = (imageName: string) => {
    if (isSelectionModeImage) {
      setSelectedImages(prevSelectedImages => {
        if (prevSelectedImages.includes(imageName)) {
          // 이미 선택된 앨범인 경우 선택 해제
          return prevSelectedImages.filter(item => item !== imageName);
        } else {
          // 선택되지 않은 앨범인 경우 선택 추가
          return [...prevSelectedImages, imageName];
        }
      });
    } else {
      // 다중 선택 모드가 아닐 때는 단일 앨범을 선택하는 로직
      if (isRepImageSelMode) {
        setTmpRepImage(imageName);
      }
    }
  };

  const handleImageLongPress = () => {
    if (isSelectionModeImage === true) {
      setIsSelectionModeImage(false);
      setSelectedImages([]);
      closeImageModal();
    } else {
      setIsSelectionModeImage(true);
      setIsRepImageSelMode(false);
      setTmpRepImage(RepImage);
      openImageModal();
    }
  };

  const handleSelectionCancel = () => {
    setIsSelectionMode(false);
    setSelectedAlbums([]);
  };

  const openSortModal = () => {
    setIsSortModalVisible(true);
  };

  const closeSortModal = () => {
    setIsSortModalVisible(false);
  };

  const closeDownloadModal = () => {
    setIsDownloadVisible(false);
    // setActiveTab('AlbumModal');
  };

  const closeMergeModal = () => {
    setIsMergeVisible(false);
    // setActiveTab('AlbumModal');
  };

  const closeImageDeleteModal = () => {
    setIsImageDeleteVisible(false);
    // setActiveTab('ImageModal');
  };

  const closeImageDownloadModal = () => {
    setIsImageDownloadVisible(false);
    // setActiveTab('ImageModal');
  };

  const closeImageShareModal = () => {
    setIsImageShareVisible(false);
    // setActiveTab('ImageModal');
  };

  const closeDeleteModal = () => {
    setIsDeleteVisible(false);
    // setActiveTab('AlbumModal');
  };

  const handleSortMethodSelect = (sortMethod: string) => {
    setSelectedSortMethod(sortMethod);
    closeSortModal();
  };

  const handleBackBtn = () => {
    if (isRepImageSelMode) {
      setIsRepImageSelMode(false);
      setTmpRepImage(RepImage);
    } else {
      setAlbumImages([]);
    }
  };

  const handleAddImage = () => {
    selectImageFromGallery();
  };

  const handleMoreBtn = () => {
    setIsMoreModalVisible(true);
  };

  const handleOptionPressIn = (option: any) => {
    setIsPressed(prevState => ({ ...prevState, [option]: true }));
  };

  const handleOptionPressOut = (option: any) => {
    setIsPressed(prevState => ({ ...prevState, [option]: false }));
  };

  const handleRepImage = () => {
    setIsRepImageSelMode(true);
    setIsMoreModalVisible(false);
  };

  const handleRepTrans = () => {
    setRepImage(tmpRepImage);
    setIsRepImageSelMode(false);
  };

  const handleModName = () => {
    setIsModNameVisible(true);
    setIsMoreModalVisible(false);
  };

  const selectImageFromGallery = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo', // 이미지 타입 설정 (사진만 가져오려면 'photo'로 설정)
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else {
        // 이미지가 선택된 경우 이미지 URI를 저장
        if (response.assets) {
          setSelectedAddImage(response.assets[0].uri);
        }
      }
    });
  };

  const renderItem = ({ item }: { item: string }) => {
    const isSelected = selectedAlbums.includes(item);

    return (
      <View style={{ flex: 1, paddingTop: 5, alignItems: 'center' }}>
        <TouchableOpacity
          style={{ flex: 1, paddingTop: 5, alignItems: 'center' }}
          onPress={() => handleAlbumPress(item)}
          onLongPress={() => handleLongPress(item)}>
          <Image
            source={{ uri: item }}
            style={{ width: screenWidth, height: 200 }}
          />
          <View style={{ position: 'absolute', bottom: 0, left: 0 }}>
            <Text style={styles.albumTextLeftTitle}>앨범 이름</Text>
            <Text style={styles.albumTextLeft}>(개수)</Text>
          </View>
          <View style={{ position: 'absolute', bottom: 0, right: 0 }}>
            <Text style={styles.albumTextRight}>2023-07-18</Text>
          </View>
          {isSelectionMode && (
            <View
              style={
                isSelected ? styles.checkedCircle : styles.unCheckedCircle
              }>
              <Text>
                {isSelected ? <WCheckSvg style={styles.checked} /> : ''}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderImage = ({ item }: { item: string }) => {
    const isSelected = selectedImages.includes(item);
    const isTmpRepImage = tmpRepImage.includes(item);

    return (
      <View style={{ flex: 1, paddingTop: 1, alignItems: 'center' }}>
        <TouchableOpacity
          style={{
            flex: 1,
            paddingTop: 1,
            paddingRight: 1,
            alignItems: 'center',
            position: 'relative',
          }}
          onPress={() => handleImagePress(item)}
          onLongPress={() => handleImageLongPress()}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={{ uri: item }}
              style={{ width: screenWidth / 4 - 2, height: 100 }}
            />
            {isSelectionModeImage && (
              <View
                style={
                  isSelected ? styles.checkedCircle : styles.unCheckedCircle
                }>
                <Text>
                  {isSelected ? <WCheckSvg style={styles.checked} /> : ''}
                </Text>
              </View>
            )}

            {isRepImageSelMode && isTmpRepImage && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 60,
                  height: 60,
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 15,
                  marginRight: 20,
                }}>
                <WCheckBigSvg />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  const dummyFolder = [
    'https://fastly.picsum.photos/id/179/200/200.jpg?hmac=I0g6Uht7h-y3NHqWA4e2Nzrnex7m-RceP1y732tc4Lw',
    'https://fastly.picsum.photos/id/803/200/300.jpg?hmac=v-3AsAcUOG4kCDsLMlWF9_3Xa2DTODGyKLggZNvReno',
    'https://fastly.picsum.photos/id/999/200/300.jpg?hmac=XqjgMZW5yK4MjHpQJFs_TiRodRNf9UVKjJiGnDJV8GI',
    'https://fastly.picsum.photos/id/600/200/300.jpg?hmac=Ub3Deb_eQNe0Un7OyE33D79dnextn3M179L0nRkv1eg',
    'https://fastly.picsum.photos/id/193/200/300.jpg?hmac=b5ZG1TfdndbrnQ8UJbIu-ykB2PRWv0QpHwehH0pqMgE',
    'https://fastly.picsum.photos/id/341/200/300.jpg?hmac=tZpxFpS1LmFfC4e_ChqA5I8JfUfJuwH3oZvmQ58SzHc',
    'https://fastly.picsum.photos/id/387/200/300.jpg?hmac=JlKyfJE4yZ_jxmWXH5sNYl7JdDfP04DOk-hye4p_wtk',
    'https://fastly.picsum.photos/id/863/200/300.jpg?hmac=4kin1N4a7dzocUZXCwLWHewLobhw1Q6_e_9E3Iy3n0I',
  ];

  return (
    <React.Fragment>
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            height: 50,
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}>
          {renderHeaderRight()}
        </View>

        {albumImages.length <= 0 ? (
          <FlatList
            data={dummyFolder}
            keyExtractor={(item, index) => String(index)}
            renderItem={renderItem}
            pointerEvents={contextMenuVisible ? 'none' : 'auto'}
          />
        ) : (
          <FlatList
            data={albumImages} // 앨범에 해당하는 이미지 데이터를 사용합니다.
            renderItem={renderImage}
            keyExtractor={(item, index) => String(index)}
            numColumns={numColumns}
            // key={flatListKey}
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.1}
          />
        )}

        {albumImages.length <= 0 && (
          <View style={styles.container}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setIsAddModalVisible(true)}>
              <AddSvg style={styles.addBtn} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal // 앨범 추가 Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>앨범 추가</Text>
            <TextInput style={styles.input} onChangeText={() => {}} />
            <View style={styles.buttonContainer}>
              <Text
                style={styles.modalButtonCancel}
                onPress={() => {
                  setIsAddModalVisible(false);
                  setAlbumImages([]);
                }}>
                취소
              </Text>
              <Text>|</Text>
              <Text
                style={styles.modalButtonOk}
                onPress={() => setIsAddModalVisible(false)}>
                추가
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      <Modal // 정렬 Modal
        visible={isSortModalVisible}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>정렬</Text>
            <TouchableOpacity
              style={[styles.sortMethodButton]}
              onPress={() => handleSortMethodSelect('최신순')}>
              <Text
                style={[
                  styles.sortMethodText,
                  selectedSortMethod === '최신순' &&
                    styles.selectedSortMethodText,
                ]}>
                최신순
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortMethodButton]}
              onPress={() => handleSortMethodSelect('오래된순')}>
              <Text
                style={[
                  styles.sortMethodText,
                  selectedSortMethod === '오래된순' &&
                    styles.selectedSortMethodText,
                ]}>
                오래된순
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortMethodButton]}
              onPress={() => handleSortMethodSelect('제목순')}>
              <Text
                style={[
                  styles.sortMethodText,
                  selectedSortMethod === '제목순' &&
                    styles.selectedSortMethodText,
                ]}>
                제목순
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortMethodButton]}
              onPress={() => handleSortMethodSelect('사진많은순')}>
              <Text
                style={[
                  styles.sortMethodText,
                  selectedSortMethod === '사진많은순' &&
                    styles.selectedSortMethodText,
                ]}>
                사진많은순
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortMethodButton]}
              onPress={() => handleSortMethodSelect('사진적은순')}>
              <Text
                style={[
                  styles.sortMethodText,
                  selectedSortMethod === '사진적은순' &&
                    styles.selectedSortMethodText,
                ]}>
                사진적은순
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal // 앨범 다운로드
        visible={isDownloadVisible}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>앨범 다운로드</Text>
            <Text style={styles.modalContentTitle}>
              앨범 {selectedAlbums.length}개를 다운로드 하시겠습니까?
            </Text>
            <Text>다운로드된 앨범은 기기의 내부 저장소에 저장됩니다.</Text>
            <View style={styles.buttonContainer}>
              <Text
                style={styles.modalButtonCancel}
                onPress={() => closeDownloadModal()}>
                취소
              </Text>
              <Text>|</Text>
              <Text
                style={styles.modalButtonOk}
                onPress={() => closeDownloadModal()}>
                다운로드
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      <Modal // 앨범 합치기
        visible={isMergeVisible}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>앨범 합치기</Text>
            <Text style={styles.modalContentTitle}>
              앨범 {selectedAlbums.length}개를 합치겠습니까?
            </Text>
            <Text>앨범을 합치면 더 이상 되돌릴 수 없습니다.</Text>
            <View style={styles.buttonContainer}>
              <Text
                style={styles.modalButtonCancel}
                onPress={() => closeMergeModal()}>
                취소
              </Text>
              <Text>|</Text>
              <Text
                style={styles.modalButtonOk}
                onPress={() => closeMergeModal()}>
                합치기
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      <Modal // 앨범 삭제
        visible={isDeleteVisible}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>앨범 삭제</Text>
            <Text style={styles.modalContentTitle}>
              앨범 {selectedAlbums.length}개를 삭제 하시겠습니까?
            </Text>
            <Text>앨범을 삭제하시면 더 이상 되돌릴 수 없습니다.</Text>
            <View style={styles.buttonContainer}>
              <Text
                style={styles.modalButtonCancel}
                onPress={() => closeDeleteModal()}>
                취소
              </Text>
              <Text>|</Text>
              <Text
                style={styles.modalButtonOk_red}
                onPress={() => closeDeleteModal()}>
                삭제
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      <Modal // 이미지 다운로드
        visible={isImageDownloadVisible}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>이미지 다운로드</Text>
            <Text style={styles.modalContentTitle}>
              이미지 {selectedImages.length}개를 다운로드 하시겠습니까?
            </Text>
            <Text>다운로드된 이미지는 기기의 내부 저장소에 저장됩니다.</Text>
            <View style={styles.buttonContainer}>
              <Text
                style={styles.modalButtonCancel}
                onPress={() => closeImageDownloadModal()}>
                취소
              </Text>
              <Text>|</Text>
              <Text
                style={styles.modalButtonOk}
                onPress={() => closeImageDownloadModal()}>
                다운로드
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      <Modal // 이미지 공유하기
        visible={isImageShareVisible}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>이미지 공유하기</Text>
            <Text style={styles.modalContentTitle}>
              이미지 {selectedImages.length}개를 공유하시겠습니까?
            </Text>
            <Text>이미지는 공유하면 더 이상 되돌릴 수 없습니다.</Text>
            <View style={styles.buttonContainer}>
              <Text
                style={styles.modalButtonCancel}
                onPress={() => closeImageShareModal()}>
                취소
              </Text>
              <Text>|</Text>
              <Text
                style={styles.modalButtonOk}
                onPress={() => closeImageShareModal()}>
                공유하기
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      <Modal // 이미지 삭제
        visible={isImageDeleteVisible}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>이미지 삭제</Text>
            <Text style={styles.modalContentTitle}>
              이미지 {selectedImages.length}개를 삭제 하시겠습니까?
            </Text>
            <Text>이미지를 삭제하시면 더 이상 되돌릴 수 없습니다.</Text>
            <View style={styles.buttonContainer}>
              <Text
                style={styles.modalButtonCancel}
                onPress={() => closeImageDeleteModal()}>
                취소
              </Text>
              <Text>|</Text>
              <Text
                style={styles.modalButtonOk_red}
                onPress={() => closeImageDeleteModal()}>
                삭제
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      <Modal // 상세 페이지 설정메뉴
        visible={isMoreModalVisible}
        animationType="none"
        transparent={true}>
        <View style={(styles.modalContainer, { flexDirection: 'row' })}>
          <View
            style={{
              flex: 1,
              width: screenWidth * 0.6,
            }}
          />
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 10,
              elevation: 5,
              marginTop: screenWidth * 0.01,
              marginRight: screenWidth * 0.01,
              width: screenWidth * 0.4,
            }}>
            <TouchableOpacity
              onPress={() => handleRepImage()}
              onPressIn={() => handleOptionPressIn('option1')}
              onPressOut={() => handleOptionPressOut('option1')}
              activeOpacity={1}
              style={[
                isPressed.option1 ? styles.touchableOpacityPressed : null,
              ]}>
              <View>
                <Text style={styles.moreText}>대표 사진 변경</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleModName()}
              onPressIn={() => handleOptionPressIn('option2')}
              onPressOut={() => handleOptionPressOut('option2')}
              activeOpacity={1}
              style={[
                isPressed.option2 ? styles.touchableOpacityPressed : null,
              ]}>
              <Text style={styles.moreText}>앨범 이름 변경</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => closeMoreModal()}
              onPressIn={() => handleOptionPressIn('option3')}
              onPressOut={() => handleOptionPressOut('option3')}
              activeOpacity={1}
              style={[
                isPressed.option3 ? styles.touchableOpacityPressed : null,
              ]}>
              <Text style={styles.moreTextRed}>앨범 삭제</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal // 앨범 이름 변경
        visible={isModNameVisible}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>앨범명 변경</Text>
            <TextInput
              style={styles.input}
              onChangeText={() => {}}
              defaultValue={selectedAlbums[0]}
            />
            <View style={styles.buttonContainer}>
              <Text
                style={styles.modalButtonCancel}
                onPress={() => {
                  setIsModNameVisible(false);
                }}>
                취소
              </Text>
              <Text>|</Text>
              <Text
                style={styles.modalButtonOk}
                onPress={() => setIsModNameVisible(false)}>
                변경
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  imgBox: {
    width: 48,
    height: 48,
    marginTop: 25,
  },
  albumImageIconBox: {
    width: 64,
    height: 64,
    marginTop: 25,
    marginRight: 25,
  },
  albumTextLeftTitle: {
    color: 'white',
    fontSize: 18,
    paddingLeft: 15,
    fontWeight: 'bold',
  },

  albumTextLeft: {
    color: 'white',
    fontSize: 14,
    paddingBottom: 15,
    paddingLeft: 15,
  },

  albumTextRight: {
    color: 'white',
    fontSize: 14,
    paddingBottom: 15,
    paddingRight: 15,
  },

  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 999,
  },
  button: {
    backgroundColor: 'blue',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    width: 48,
    height: 48,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '100%',
    padding: 20,
    borderRadius: 15,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: 'gray',
    width: screenWidth - screenWidth * 0.1,
    padding: 5,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  modalButtonCancel: {
    width: screenWidth * 0.5,
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalButtonOk: {
    width: screenWidth * 0.5,
    color: '#3675FB',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalButtonOk_red: {
    width: screenWidth * 0.5,
    color: '#FF6D70',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalContentTitle: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
  },
  sortMethodButton: {
    paddingVertical: 10,
  },
  sortMethodText: {
    fontSize: 14,
    color: '#222222',
  },
  closeButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  selectedSortMethodText: {
    color: '#5A8FFF',
  },
  checkedCircle: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#3675FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginRight: 20,
  },
  unCheckedCircle: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#FFFFFF99',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginRight: 20,
  },
  checked: {
    width: 48,
    height: 48,
  },
  moreText: {
    fontSize: 16,
    color: '#333333',
    marginTop: 7,
    marginBottom: 7,
    marginLeft: 10,
  },
  moreTextRed: {
    fontSize: 16,
    color: '#FF6D70',
    marginTop: 7,
    marginBottom: 7,
    marginLeft: 10,
  },
  touchableOpacityPressed: {
    backgroundColor: 'lightgray', // 클릭 시 배경 회색으로 변경
  },
});

export default Album;
