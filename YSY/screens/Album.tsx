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
import SortSvg from '../assets/icons/sort.svg';
import SettingSvg from '../assets/icons/settings.svg';
import AddSvg from '../assets/icons/add.svg';
import WCheckSvg from '../assets/icons/white_check.svg';
import BCheckSvg from '../assets/icons/check.svg';
import UCheckSvg from '../assets/icons/un-check.svg';

import {
  albumSelectionOn,
  albumSelectionOff,
  albumFunc,
} from '../features/albumSlice';

import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { RootState } from '../redux/store';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AlbumTypes } from '../navigation/AlbumTypes';

const screenWidth = wp('100%');

export const Album = () => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [selectedSortMethod, setSelectedSortMethod] = useState('최신순');
  const [isDownloadVisible, setIsDownloadVisible] = useState(false);
  const [isMergeVisible, setIsMergeVisible] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [albumImages, setAlbumImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation<StackNavigationProp<AlbumTypes>>();

  const isAlbum = useAppSelector(
    (state: RootState) => state.albumStatus.isAlbum,
  );
  const isFunc = useAppSelector((state: RootState) => state.albumStatus.isFunc);
  const isImage = useAppSelector(
    (state: RootState) => state.imageStatus.isImage,
  );

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

  useEffect(() => {
    if (isFunc.includes('Album')) {
      if (isFunc.includes('Download')) {
        setIsDownloadVisible(true);
      } else {
        setIsDownloadVisible(false);
      }

      if (isFunc.includes('Merge')) {
        setIsMergeVisible(true);
      } else {
        setIsMergeVisible(false);
      }

      if (isFunc.includes('Delete')) {
        setIsDeleteVisible(true);
      } else {
        setIsDeleteVisible(false);
      }
    }
  }, [isFunc]);

  useEffect(() => {
    if (albumImages.length > 0) {
      loadMoreData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumImages]);

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
    if (isAlbum) {
      if (selectedAlbums.length > 0) {
        // 이미 선택된 앨범이 있는 경우 전체 해제 동작 수행
        setSelectedAlbums([]);
      } else {
        // 선택된 앨범이 없는 경우 전체 선택 동작 수행
        setSelectedAlbums(dummyFolder);
      }
    }
    if (isImage) {
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
    if (isAlbum) {
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
  };
  const handleAlbumPress = (albumName: string) => {
    if (isAlbum) {
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
        navigation.navigate('AlbumDetail', { albumName: 'asdasd' });
        setAlbumImages(dummyImages.slice(0, 32));
        dispatch(albumFunc('Image'));
        setSelectedAlbums([albumName]);
        loadMoreData();
      } else {
        setAlbumImages([]);
      }
    }
  };

  const dispatch = useAppDispatch();
  const handleLongPress = () => {
    if (isAlbum === true) {
      dispatch(albumSelectionOff());
    } else {
      dispatch(albumSelectionOn());
    }
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

  const closeDeleteModal = () => {
    setIsDeleteVisible(false);
    // setActiveTab('AlbumModal');
  };

  const handleSortMethodSelect = (sortMethod: string) => {
    setSelectedSortMethod(sortMethod);
    closeSortModal();
  };

  const renderItem = ({ item }: { item: string }) => {
    const isSelected = selectedAlbums.includes(item);

    return (
      <View style={{ flex: 1, paddingTop: 5, alignItems: 'center' }}>
        <TouchableOpacity
          style={{ flex: 1, paddingTop: 5, alignItems: 'center' }}
          onPress={() => handleAlbumPress(item)}
          onLongPress={() => handleLongPress()}>
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
          {isAlbum && (
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

        <FlatList
          data={dummyFolder}
          keyExtractor={(item, index) => String(index)}
          renderItem={renderItem}
        />
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setIsAddModalVisible(true)}>
            <AddSvg style={styles.addBtn} />
          </TouchableOpacity>
        </View>
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
