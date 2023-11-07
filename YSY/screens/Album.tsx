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
import { QueryClient } from 'react-query';
import { userAPI } from '../apis/userAPI';
import { albumAPI } from '../apis/albumAPI';

import NoItem from '../components/NoItem';
import AlbumNoneSVG from '../assets/icons/album_none.svg';

const screenWidth = wp('100%');
const IMG_BASE_URL = 'https://storage.googleapis.com/ysy-bucket/';

export const Album = () => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [selectedSortMethod, setSelectedSortMethod] = useState('최신순');
  const [isDownloadVisible, setIsDownloadVisible] = useState(false);
  const [isMergeVisible, setIsMergeVisible] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [isMergeNameVisible, setIsMergeNameVisible] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('default');
  const [mergeAlbumTitle, setMergeAlbumTitle] = useState('default');

  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);
  const [selectedAlbumIds, setSelectedAlbumIds] = useState<number[]>([]);
  const [selectedAlbumTitle, setSelectedAlbumTitle] = useState('');
  const [albumImages, setAlbumImages] = useState<string[]>([]);
  const [dummyFolder, setDummyFolder] = useState<string[]>([]);
  const [foldersData, setFoldersData] = useState<string[]>([]);

  const [cupId, setCupId] = useState('');

  const navigation = useNavigation<StackNavigationProp<AlbumTypes>>();

  const isAlbum = useAppSelector(
    (state: RootState) => state.albumStatus.isAlbum,
  );
  const isFunc = useAppSelector((state: RootState) => state.albumStatus.isFunc);

  const getAlbumFolders = async (sort?: string) => {
    try {
      const userData = JSON.stringify(await userAPI.getUserMe()); // login 정보 가져오기
      const userParsedData = JSON.parse(userData);
      const data = JSON.stringify(
        await albumAPI.getAlbumFolder(userParsedData.cupId, sort),
      );
      const parsedData = JSON.parse(data);
      setCupId(parsedData.cupId);

      const defaultThumbnail =
        'https://dummyimage.com/600x400/000/fff&text=Im+Dummy'; // 적절한 기본 이미지 URL을 설정하세요.

      setFoldersData(parsedData);
      const folderList = parsedData.albums.map(
        (album: {
          albumId: number;
          thumbnail: string;
          title: string;
          total: number;
          createdTime: Date;
        }) => ({
          albumId: album.albumId,
          thumbnail: album.thumbnail
            ? `${IMG_BASE_URL}${album.thumbnail}`
            : defaultThumbnail,
          title: album.title,
          total: album.total,
          createdTime: album.createdTime,
        }),
      );
      setDummyFolder(folderList);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddAlbum = async (newAlbumTitle: string) => {
    const userData = JSON.stringify(await userAPI.getUserMe()); // login 정보 가져오기

    const userParsedData = JSON.parse(userData);
    const postData = { title: newAlbumTitle };

    try {
      await albumAPI.postNewAlbum(userParsedData.cupId, postData);
      await getAlbumFolders('r');
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAlbumFolders(); // f
  }, []);

  const backAction = () => {
    dispatch(albumSelectionOff());
    return true; // true를 반환하면 앱이 종료되지 않습니다.
  };

  useFocusEffect(
    React.useCallback(() => {
      BackHandler.addEventListener('hardwareBackPress', backAction);
      getAlbumFolders('r');
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
        if (selectedAlbumIds.length <= 0) {
          return;
        }
        setIsDownloadVisible(true);
      } else {
        setIsDownloadVisible(false);
      }

      if (isFunc.includes('Merge')) {
        if (selectedAlbumIds.length <= 0) {
          return;
        }
        setIsMergeVisible(true);
      } else {
        setIsMergeVisible(false);
      }

      if (isFunc.includes('Delete')) {
        if (selectedAlbumIds.length <= 0) {
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
      if (selectedAlbumIds.length > 0) {
        // 이미 선택된 앨범이 있는 경우 전체 해제 동작 수행
        setSelectedAlbumIds([]);
      } else {
        // 선택된 앨범이 없는 경우 전체 선택 동작 수행
        const Ids = dummyFolder.map(folder => folder.albumId);
        setSelectedAlbumIds(Ids);
      }
    }
  };

  const handleAlbumPress = async (item: {
    albumId: number;
    thumbnail: string;
    title: string;
    total: number;
    createdTime: Date;
  }) => {
    if (isAlbum) {
      setSelectedAlbumIds(prevSelectedAlbums => {
        if (prevSelectedAlbums.includes(item.albumId)) {
          // 이미 선택된 앨범인 경우 선택 해제
          return prevSelectedAlbums.filter(tartget => tartget !== item.albumId);
        } else {
          // 선택되지 않은 앨범인 경우 선택 추가
          return [...prevSelectedAlbums, item.albumId];
        }
      });

      if (selectedAlbumIds[0]) {
        const data = dummyFolder.filter(
          item => item.albumId === selectedAlbumIds[0],
        );
        setSelectedAlbumTitle(data[0].title);
      }
    } else {
      // 다중 선택 모드가 아닐 때는 단일 앨범을 선택하는 로직
      if (albumImages.length <= 0) {
        const userData = JSON.stringify(await userAPI.getUserMe()); // login 정보 가져오기

        const userParsedData = JSON.parse(userData);
        navigation.navigate('AlbumDetail', {
          albumId: item.albumId,
          albumTitle: item.title,
          cupId: userParsedData.cupId,
        });
        dispatch(albumFunc('Image'));
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
    setMergeAlbumTitle(selectedAlbumTitle);
    setIsMergeNameVisible(true);
  };

  const handleMerge = async () => {
    renewMergeAlbum();
    setIsMergeNameVisible(false);
    setIsMergeVisible(false);
  };

  const createNewAlbumDetail = async (seletedAlbumNames: number[]) => {
    // selectedAlbumNames와 NewAlbumName을 통해 제물들의 이미지들을 하나로 모은 테이블을 생성한는 sql을 날림.
    // selectedAlbum의 첫번째 인자가 머지의 주축이 되어야한다. 즉, 첫 번째 폴더의 이름을 mergeAlbumTitle로 바꾸고,
    // 타 앨범의 album_id를 첫번째 인자의 id로 바꾸어버리면 될 거 같다.
    const album_id = seletedAlbumNames[0];
    const target_ids = seletedAlbumNames.slice(1);

    try {
      const userData = JSON.stringify(await userAPI.getUserMe()); // login 정보 가져오기

      const userParsedData = JSON.parse(userData);
      const data = {
        albumId: album_id,
        targetIds: target_ids,
        title: mergeAlbumTitle,
        cup_id: userParsedData.cupId,
      };
      await albumAPI.postMergeAlbum(userParsedData.cupId, data);
      await getAlbumFolders('r');
    } catch (error) {
      console.log(error);
    }
  };

  const renewMergeAlbum = async () => {
    await createNewAlbumDetail(selectedAlbumIds);
    setSelectedAlbums([]);
    setSelectedAlbumIds([]);
  };

  const handleDelete = async () => {
    try {
      const userData = JSON.stringify(await userAPI.getUserMe()); // login 정보 가져오기

      const userParsedData = JSON.parse(userData);
      const res = await albumAPI.deleteAlbum(
        userParsedData.cupId,
        selectedAlbumIds,
      );
      await getAlbumFolders('r');
      closeDeleteModal();
      setSelectedAlbums([]);
      setSelectedAlbumIds([]);

      return res;
    } catch (error) {
      console.log(error);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteVisible(false);
    dispatch(albumSelectionOff());
    // setActiveTab('AlbumModal');
  };

  const handleSortMethodSelect = (sortMethod: string) => {
    setSelectedSortMethod(sortMethod);
    if (sortMethod === '최신순') {
      getAlbumFolders('r');
    }
    if (sortMethod === '오래된순') {
      getAlbumFolders('o');
    }
    if (sortMethod === '제목순') {
      getAlbumFolders('t');
    }

    if (sortMethod === '사진많은순') {
      getAlbumFolders('im');
    }

    if (sortMethod === '사진적은순') {
      getAlbumFolders('il');
    }
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
              selectedAlbums={selectedAlbumIds}
              handleSelectAll={handleSelectAll}
              openSortModal={openSortModal}
            />
          }
        </View>
        {dummyFolder.length > 0 ? (
          <FlatList
            data={dummyFolder}
            keyExtractor={(item, index) => String(index)}
            renderItem={({ item }) => (
              <RenderAlbum
                item={item}
                selectedAlbums={selectedAlbumIds}
                handleAlbumPress={() => handleAlbumPress(item)}
                handleLongPress={handleLongPress}
              />
            )}
          />
        ) : (
          <NoItem
            icon={AlbumNoneSVG}
            descriptions={[
              '이런, 아직 앨범이 없어요.',
              '소중한 추억을 담을 앨범을 만들어보세요.',
            ]}
          />
        )}

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
                  onPress={() => {
                    handleAddAlbum(newAlbumTitle);
                    setIsAddModalVisible(false);
                  }}>
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
                  {selectedAlbumIds.length}
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
                  {selectedAlbumIds.length}
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
                  {selectedAlbumIds.length}
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
                  onPress={() => handleDelete()}>
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
                onChangeText={text => {
                  setMergeAlbumTitle(text);
                }}
                defaultValue={selectedAlbumTitle}
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
                  onPress={() => handleMerge()}>
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
