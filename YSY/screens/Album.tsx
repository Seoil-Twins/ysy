import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  BackHandler,
  TouchableWithoutFeedback,
} from 'react-native';
import AddSvg from '../assets/icons/add.svg';

import {
  albumSelectionOn,
  albumSelectionOff,
  albumFunc,
} from '../features/albumSlice';

import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { RootState } from '../redux/store';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AlbumTypes } from '../navigation/AlbumTypes';

import RenderAlbumHeader from '../components/RenderAlbumHeader';
import RenderAlbum from '../components/RenderAlbum';
import { QueryClient, useQuery } from 'react-query';
import { userAPI } from '../apis/userAPI';
import { albumAPI } from '../apis/albumAPI';

const screenWidth = wp('100%');

export const Album = () => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [selectedSortMethod, setSelectedSortMethod] = useState('최신순');
  const [isDownloadVisible, setIsDownloadVisible] = useState(false);
  const [isMergeVisible, setIsMergeVisible] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [isMergeNameVisible, setIsMergeNameVisible] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('default');

  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);
  const [albumImages, setAlbumImages] = useState<string[]>([]);
  const [dummyFolder, setDummyFolder] = useState<string[]>([]);
  const [foldersData, setFoldersData] = useState<string[]>([]);

  const navigation = useNavigation<StackNavigationProp<AlbumTypes>>();

  const queryClient = new QueryClient();

  const isAlbum = useAppSelector(
    (state: RootState) => state.albumStatus.isAlbum,
  );
  const isFunc = useAppSelector((state: RootState) => state.albumStatus.isFunc);

  // const getMe = async () => {
  //   const data = JSON.stringify(await userAPI.getUserMe()); // login 정보 가져오기
  //   const parsedData = JSON.parse(data);
  //   console.log(parsedData);
  //   return parsedData;
  // };

  const getAlbumImageCount = (albumId: number) => {
    // firebase에서 바로 제공해주나?
    // 임시 코드
    if (albumId === 1) {
      return 30;
    } else if (albumId === 2) {
      return 20;
    } else if (albumId === 3) {
      return 130;
    }
  };

  const getAlbumFolders = async () => {
    const userData = JSON.stringify(await userAPI.getUserMe()); // login 정보 가져오기
    const userParsedData = JSON.parse(userData);
    const data = JSON.stringify(
      await albumAPI.getAlbumFolder(userParsedData.cupId),
    ); // login 정보 가져오기
    const parsedData = JSON.parse(data);

    for (const item of parsedData.albums) {
      item.count = getAlbumImageCount(item.albumId);
    }
    setFoldersData(parsedData);
    const sortedAlbums = parsedData.albums.sort((a, b) => {
      // 문자열로 된 날짜를 JavaScript Date 객체로 변환하여 비교합니다
      const dateA = new Date(a.createdTime);
      const dateB = new Date(b.createdTime);

      return dateA - dateB;
      // return dateB - dateA;
    });
    const folderList = sortedAlbums.map(
      (album: { thumbnail: string }) => album.thumbnail,
    );
    setDummyFolder(folderList);
  };

  useEffect(() => {
    getAlbumFolders(); // f
  }, []);

  // const flatListKey = activeTab === 'AlbumModal' ? 'AlbumModal' : 'Default';
  const backAction = () => {
    dispatch(albumSelectionOff());
    return true; // true를 반환하면 앱이 종료되지 않습니다.
  };

  // const data = useQuery('userme', userAPI.getUserMe());
  // console.log('useQuery 1 : ' + JSON.stringify(data));

  useFocusEffect(
    React.useCallback(() => {
      BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => {
        // 화면 이동 시 핸들러 언마운트
        BackHandler.removeEventListener('hardwareBackPress', backAction);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    if (isFunc.includes('Album')) {
      if (isFunc.includes('Download')) {
        if (selectedAlbums.length <= 0) {
          return;
        }
        setIsDownloadVisible(true);
      } else {
        setIsDownloadVisible(false);
      }

      if (isFunc.includes('Merge')) {
        if (selectedAlbums.length <= 0) {
          return;
        }
        setIsMergeVisible(true);
      } else {
        setIsMergeVisible(false);
      }

      if (isFunc.includes('Delete')) {
        if (selectedAlbums.length <= 0) {
          return;
        }
        setIsDeleteVisible(true);
      } else {
        setIsDeleteVisible(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFunc]);

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
        dispatch(albumFunc('Image'));
        setSelectedAlbums([albumName]);
        // loadMoreData();
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
    // queryClient.invalidateQueries('userme');
    // TestCallQuery(userAPI.getUserMe());
  };

  const closeSortModal = () => {
    setIsSortModalVisible(false);
  };

  const closeDownloadModal = () => {
    setIsDownloadVisible(false);
    dispatch(albumSelectionOff());
    // setActiveTab('AlbumModal');
  };

  const closeMergeModal = () => {
    setIsMergeVisible(false);
    dispatch(albumFunc('Album'));
    dispatch(albumSelectionOff());
    // setActiveTab('AlbumModal');
  };

  const openMergeNameModal = () => {
    closeMergeModal();
    setIsMergeNameVisible(true);
  };

  const handleMerge = async (newAlbumName: string) => {
    renewMergeAlbum(selectedAlbums, newAlbumName);
    console.log('after' + dummyFolder);
    setIsMergeNameVisible(false);
    setIsMergeVisible(false);
  };

  const createNewAlbumDetail = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    seletedAlbumNames: string[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    newAlbumName: string,
  ) => {
    // selectedAlbumNames와 NewAlbumName을 통해 제물들의 이미지들을 하나로 모은 테이블을 생성한는 sql을 날림.
  };

  const renewMergeAlbum = async (
    albumNames: string[],
    newAlbumName: string,
  ) => {
    const newData = await dummyFolder.filter(
      item => !albumNames.includes(item),
    ); // 데이터 삭제로직
    createNewAlbumDetail(albumNames, newAlbumName);
    newData.push(
      'https://fastly.picsum.photos/id/855/500/500.jpg?hmac=TOLIBgvj-ag8FMNpBsnbDWdmC-6i_R9jFJh0qSSBUK8',
    );
    setSelectedAlbums([]);

    setDummyFolder(newData);
  };

  const closeDeleteModal = () => {
    setIsDeleteVisible(false);
    dispatch(albumSelectionOff());
    // setActiveTab('AlbumModal');
  };

  const handleSortMethodSelect = (sortMethod: string) => {
    setSelectedSortMethod(sortMethod);
    if (sortMethod == '최신순') {
      const sortedAlbums = foldersData.albums.sort((a, b) => {
        const dateA = new Date(a.createdTime);
        const dateB = new Date(b.createdTime);

        return dateB - dateA;
      });
      const folderList = sortedAlbums.map(
        (album: { thumbnail: string }) => album.thumbnail,
      );
      setDummyFolder(folderList);
    }
    if (sortMethod == '오래된순') {
      const sortedAlbums = foldersData.albums.sort((a, b) => {
        const dateA = new Date(a.createdTime);
        const dateB = new Date(b.createdTime);

        return dateA - dateB;
      });
      const folderList = sortedAlbums.map(
        (album: { thumbnail: string }) => album.thumbnail,
      );
      setDummyFolder(folderList);
    }
    if (sortMethod == '제목순') {
      const sortedAlbums = foldersData.albums.sort((a, b) => {
        const titleA = a.title.toLowerCase(); // 대소문자 구분 없이 정렬하려면 소문자로 변환
        const titleB = b.title.toLowerCase();

        if (titleA < titleB) {
          return -1; // a가 b보다 작으면 -1 반환 (a를 b보다 앞에 배치)
        } else if (titleA > titleB) {
          return 1; // a가 b보다 크면 1 반환 (a를 b보다 뒤에 배치)
        } else {
          return 0; // 같은 경우 0 반환 (순서 변경 없음)
        }
      });
      const folderList = sortedAlbums.map(
        (album: { thumbnail: string }) => album.thumbnail,
      );
      setDummyFolder(folderList);
    }

    if (sortMethod == '사진많은순') {
      const sortedAlbums = foldersData.albums.sort((a, b) => {
        const countA = a.count; // 대소문자 구분 없이 정렬하려면 소문자로 변환
        const countB = b.count;

        return countB - countA;
      });
      const folderList = sortedAlbums.map(
        (album: { thumbnail: string }) => album.thumbnail,
      );
      setDummyFolder(folderList);
    }

    if (sortMethod == '사진적은순') {
      const sortedAlbums = foldersData.albums.sort((a, b) => {
        const countA = a.count; // 대소문자 구분 없이 정렬하려면 소문자로 변환
        const countB = b.count;

        return countA - countB;
      });
      const folderList = sortedAlbums.map(
        (album: { thumbnail: string }) => album.thumbnail,
      );
      setDummyFolder(folderList);
    }
    closeSortModal();
  };

  const handleAddAlbum = async () => {
    const userData = JSON.stringify(await userAPI.getUserMe()); // login 정보 가져오기

    const userParsedData = JSON.parse(userData);
    const postData = { title: 'testTitle' };

    console.log(albumAPI.postNewAlbum(userParsedData.cupId, postData));
    setIsAddModalVisible(false);
  };

  return (
    <React.Fragment>
      {/* <MyComponent /> */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            height: 48,
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}>
          {
            <RenderAlbumHeader
              selectedAlbums={selectedAlbums}
              handleSelectAll={handleSelectAll}
              openSortModal={openSortModal}
            />
          }
        </View>

        <FlatList
          data={dummyFolder}
          keyExtractor={(item, index) => String(index)}
          renderItem={({ item }) => (
            <RenderAlbum
              item={item}
              selectedAlbums={selectedAlbums}
              handleAlbumPress={() => handleAlbumPress(item)}
              handleLongPress={handleLongPress}
            />
          )}
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
        <TouchableWithoutFeedback
          onPress={() => {
            setIsAddModalVisible(false);
          }}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text>앨범 추가</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => {
                  setNewAlbumTitle(text);
                }}
              />
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
                  onPress={() => handleAddAlbum()}>
                  추가
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal // 정렬 Modal
        visible={isSortModalVisible}
        animationType="slide"
        transparent={true}>
        <TouchableWithoutFeedback
          onPress={() => {
            setIsSortModalVisible(false);
          }}>
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
        </TouchableWithoutFeedback>
      </Modal>

      <Modal // 앨범 다운로드
        visible={isDownloadVisible}
        animationType="slide"
        transparent={true}>
        <TouchableWithoutFeedback
          onPress={() => {
            closeDownloadModal();
          }}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>앨범 다운로드</Text>
              <Text style={styles.modalContentTitle}>
                앨범{' '}
                <Text style={{ color: '#3675FB' }}>
                  {selectedAlbums.length}
                </Text>
                개를 다운로드 하시겠습니까?
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
        </TouchableWithoutFeedback>
      </Modal>

      <Modal // 앨범 합치기
        visible={isMergeVisible}
        animationType="slide"
        transparent={true}>
        <TouchableWithoutFeedback
          onPress={() => {
            closeMergeModal();
          }}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>앨범 합치기</Text>
              <Text style={styles.modalContentTitle}>
                앨범{' '}
                <Text style={{ color: '#3675FB' }}>
                  {selectedAlbums.length}
                </Text>
                개를 합치겠습니까?
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
                  onPress={() => openMergeNameModal()}>
                  합치기
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal // 앨범 삭제
        visible={isDeleteVisible}
        animationType="slide"
        transparent={true}>
        <TouchableWithoutFeedback
          onPress={() => {
            closeDeleteModal();
          }}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>앨범 삭제</Text>
              <Text style={styles.modalContentTitle}>
                앨범{' '}
                <Text style={{ color: '#3675FB' }}>
                  {selectedAlbums.length}
                </Text>
                개를 삭제 하시겠습니까?
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
        </TouchableWithoutFeedback>
      </Modal>

      <Modal // Merge를 통한 새로운 앨범명 설정
        visible={isMergeNameVisible}
        animationType="slide"
        transparent={true}>
        <TouchableWithoutFeedback
          onPress={() => {
            setIsMergeNameVisible(false);
          }}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text>새로운 앨범명</Text>
              <TextInput
                style={styles.input}
                onChangeText={() => {}}
                defaultValue={'새로운 앨범'}
              />
              <View style={styles.buttonContainer}>
                <Text
                  style={styles.modalButtonCancel}
                  onPress={() => {
                    setIsMergeNameVisible(false);
                  }}>
                  취소
                </Text>
                <Text>|</Text>
                <Text
                  style={styles.modalButtonOk}
                  onPress={() => handleMerge('새로운 이름')}>
                  생성
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
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
  container: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    zIndex: 999,
  },
  button: {
    backgroundColor: '#3675FB',
    width: 40,
    height: 40,
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
