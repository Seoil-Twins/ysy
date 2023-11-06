import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Text,
  Modal,
  TextInput,
  BackHandler,
  Share,
  TouchableWithoutFeedback,
} from 'react-native';
import { AlbumTypes } from '../navigation/AlbumTypes';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { RootState } from '../redux/store';
import { imageSelectionOff, imageSelectionOn } from '../features/ImageSlice';
import {
  ImageLibraryOptions,
  ImagePickerResponse,
  launchImageLibrary,
} from 'react-native-image-picker';

import RenderImageHeader from '../components/RenderImageHeader';
import RenderImage from '../components/RenderImage';
// import RNFS from 'react-native-fs';
import { albumFunc } from '../features/albumSlice';
import { albumAPI } from '../apis/albumAPI';
import { assets } from '../react-native.config';
import { File } from '../util/API';
const screenWidth = wp('100%');
const IMG_BASE_URL = 'https://storage.googleapis.com/ysy-bucket/';
let imageCount = 0;

export const AlbumDetail = () => {
  const { albumId, albumTitle, cupId } =
    useRoute<RouteProp<AlbumTypes, 'AlbumDetail'>>().params;

  const [isLoading, setIsLoading] = useState(false);
  const [numColumns] = useState(4);
  const [RepImage, setRepImage] = useState(0);
  const [totalImage, setTotalImage] = useState(0);

  const [albumImages, setAlbumImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);
  const [changeTitle, setChangeTitle] = useState('');
  const [isRepImageSelMode, setIsRepImageSelMode] = useState(false);
  const [tmpRepImage, setTmpRepImage] = useState(0);

  const [selectedAddImage, setSelectedAddImage] = useState<string | undefined>(
    undefined,
  );
  //ss
  const [isModNameVisible, setIsModNameVisible] = useState(false);
  const [isMoreModalVisible, setIsMoreModalVisible] = useState(false);
  const [isPressed, setIsPressed] = useState({
    option1: false,
    option2: false,
    option3: false,
  });
  const [isImageDownloadVisible, setIsImageDownloadVisible] = useState(false);
  const [isImageShareVisible, setIsImageShareVisible] = useState(false);
  const [isImageDeleteVisible, setIsImageDeleteVisible] = useState(false);

  const isImage = useAppSelector(
    (state: RootState) => state.imageStatus.isImage,
  );
  const isFunc = useAppSelector((state: RootState) => state.albumStatus.isFunc);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    const callNewData = async () => {
      const res = await loadImageFromDB(albumId, 50);
      return res;
    };
    imageCount = 0;
    callNewData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {}, [isImage]);

  const backAction = React.useCallback(() => {
    console.log('if밖 : ' + isImage);
    if (isImage) {
      dispatch(imageSelectionOff());
      console.log('if안 : ' + isImage);
      return true; // true를 반환하면 앱이 종료되지 않습니다.
    }
  }, [dispatch, isImage]);
  // const backAction = () => {
  //   console.log('if밖 : ' + isImage);
  //   if (isImage) {
  //     dispatch(imageSelectionOff());
  //     console.log('if안 : ' + isImage);
  //     return true; // true를 반환하면 앱이 종료되지 않습니다.
  //   }
  // };

  useFocusEffect(
    React.useCallback(() => {
      BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => {
        // 화면 이동 시 핸들러 언마운트
        BackHandler.removeEventListener('hardwareBackPress', backAction);
      };
    }, [backAction]),
  );

  useEffect(() => {
    console.log(isFunc);
    if (isFunc.includes('Image')) {
      if (isFunc.includes('Download')) {
        if (selectedImages.length <= 0) {
          return;
        }
        setIsImageDownloadVisible(true);
      } else {
        setIsImageDownloadVisible(false);
      }

      if (isFunc.includes('Share')) {
        if (selectedImages.length <= 0) {
          return;
        }
        setIsImageShareVisible(true);
      } else {
        setIsImageShareVisible(false);
      }

      if (isFunc.includes('Delete')) {
        if (selectedImages.length <= 0) {
          return;
        }
        setIsImageDeleteVisible(true);
      } else {
        setIsImageDeleteVisible(false);
      }
    }
  }, [isFunc, selectedImages.length]);

  const loadImageFromDB = async (albumId: number, slice: number) => {
    console.log('ss' + albumId);
    const data = JSON.stringify(
      await albumAPI.getAlbumImages(cupId, albumId, {
        page: imageCount / 40 + 1,
        count: slice,
      }),
    );
    imageCount += slice;
    console.log(imageCount);
    const parsedData = JSON.parse(data);
    setTotalImage(parsedData.total);
    const thumb = parsedData.images.map(
      (image: { path: string }) => `${IMG_BASE_URL}${image.path}`,
    );
    // albumId을 이용한 Image 가져오는 코드 작성해야함
    const ImageArray = thumb.slice(
      albumImages.length,
      albumImages.length + slice,
    );
    console.log(ImageArray);

    const imageList = parsedData.images.map(
      (image: {
        albumImageId: number;
        size: number;
        type: string;
        path: string;
        createdTime: Date;
      }) => ({
        albumImageId: image.albumImageId,
        size: image.size,
        type: image.type,
        path: `${IMG_BASE_URL}${image.path}`,
        createdTime: image.createdTime,
      }),
    );
    setAlbumImages(prevData => [...prevData, ...imageList]);
    return ImageArray;
  };

  const loadMoreData = () => {
    // 이미 로딩 중이거나 데이터가 모두 로딩되었을 경우 함수 실행 종료
    if (isLoading || albumImages.length >= totalImage) {
      return;
    }

    // 데이터 로딩 시작
    setIsLoading(true);
    console.log('로딩시이이이작' + imageCount);
    // 모의 API 호출 또는 기타 데이터 로딩 로직 구현
    // 이 예시에서는 setTimeout을 사용하여 1초 후에 새로운 데이터를 추가로 로딩합니다.
    setTimeout(async () => {
      await loadImageFromDB(albumId, 40);
      // setAlbumImages(prevData => [...prevData, ...newData]);
      setIsLoading(false);
    }, 1000);
  };

  const selectImageFromGallery = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo', // 이미지 타입 설정 (사진만 가져오려면 'photo'로 설정)
    };
    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else {
        // 이미지가 선택된 경우 이미지 URI를 저장
        if (response.assets) {
          await setSelectedAddImage(response.assets[0].uri);
          // console.log(response.assets[0]);
          const res = await fetch(response.assets[0].uri);
          const blob = await res.blob();

          if (!response.assets[0].uri || !response.assets[0].fileName) {
            console.log('Image Data Not Found ! ');
            return;
          }
          const newFile: File = {
            uri: response.assets[0].uri,
            type: blob.type,
            size: blob.size,
            name: response.assets[0].fileName,
          };
          const apiRes = await albumAPI.postNewImage(cupId, albumId, newFile);
          console.log(JSON.stringify(apiRes));
          const ress = await albumAPI.getAlbumImages(cupId, albumId, {
            page: 1,
            count: 1,
            sort: 'r',
          });
          const parsedData = JSON.stringify(ress.images[0]);

          const imageList: {
            albumImageId: number;
            size: number;
            type: string;
            path: string;
            createdTime: Date;
          } = {
            albumImageId: parsedData.albumImageId,
            size: parsedData.size,
            type: parsedData.type,
            path: newFile.uri,
            createdTime: parsedData.createdTime,
          };

          await albumImages.unshift(imageList);
          setAlbumImages(prev => {
            return [...prev];
          });
        }
      }
    });
  };

  const handleSelectAll = () => {
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

  const handleBackBtn = () => {
    if (isRepImageSelMode) {
      setIsRepImageSelMode(false);
      setTmpRepImage(RepImage);
    } else {
      setAlbumImages([]);
      navigation.goBack();
    }
  };

  const handleMoreBtn = () => {
    setIsMoreModalVisible(true);
  };

  const handleRepTrans = async () => {
    await setRepImage(tmpRepImage);
    setIsRepImageSelMode(false);

    try {
      const imgList = await albumAPI.getAlbumImages(cupId, albumId);
      const targetImg = imgList.images.filter(
        (tartget: { albumImageId: number }) =>
          tartget.albumImageId === tmpRepImage,
      );
      console.log(targetImg);
      const newFile: File = {
        uri: `${IMG_BASE_URL}${targetImg[0].path}`,
        type: targetImg[0].type,
        size: targetImg[0].size,
        name: '4ac2af96-4d2c-4f43-a04d-41cc736ad273.jpg',
      };
      const data = JSON.stringify(
        await albumAPI.patchRepImgAlbum(cupId, albumId, newFile),
      );
      console.log('ss' + data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleOptionPressIn = (option: any) => {
    setIsPressed(prevState => ({ ...prevState, [option]: true }));
  };

  const handleOptionPressOut = (option: any) => {
    setIsPressed(prevState => ({ ...prevState, [option]: false }));
  };

  const handleRepImage = async () => {
    setIsRepImageSelMode(true);
    // dispatch(imageSelectionOn());
    setIsMoreModalVisible(false);
  };

  const handleTitle = async () => {
    const data = JSON.stringify(
      await albumAPI.patchTitleAlbum(cupId, albumId, { title: changeTitle }),
    );
    setIsModNameVisible(false);
  };

  const openImageModal = () => {
    dispatch(imageSelectionOn());
  };

  const closeImageModal = () => {
    dispatch(imageSelectionOff());
  };

  const handleImagePress = (item: any) => {
    if (isImage) {
      setSelectedImages(prevSelectedImages => {
        if (prevSelectedImages.includes(item.albumImageId)) {
          // 이미 선택된 앨범인 경우 선택 해제
          return prevSelectedImages.filter(
            itesm => itesm !== item.albumImageId,
          );
        } else {
          // 선택되지 않은 앨범인 경우 선택 추가
          return [...prevSelectedImages, item.albumImageId];
        }
      });
      setSelectedImageIds(prevSelectedImageIds => {
        if (prevSelectedImageIds.includes(item.albumImageId)) {
          // 이미 선택된 앨범인 경우 선택 해제
          return prevSelectedImageIds.filter(
            tartget => tartget !== item.albumImageId,
          );
        } else {
          // 선택되지 않은 앨범인 경우 선택 추가
          return [...prevSelectedImageIds, item.albumImageId];
        }
      });
    } else {
      if (isRepImageSelMode) {
        setTmpRepImage(item.albumImageId);
      }
    }
  };

  const handleImageLongPress = () => {
    if (isImage === true) {
      setSelectedImages([]);
      closeImageModal();
    } else {
      setIsRepImageSelMode(false);
      setTmpRepImage(RepImage);
      openImageModal();
    }
  };

  const handleModName = () => {
    setIsModNameVisible(true);
    setIsMoreModalVisible(false);
  };

  const handleDeleteAlbum = () => {
    albumAPI.deleteAlbum(cupId, albumId);
    closeMoreModal();
  };

  const closeMoreModal = () => {
    setIsMoreModalVisible(false);
    setIsPressed({
      option1: false,
      option2: false,
      option3: false,
    });
  };

  const closeImageDeleteModal = () => {
    setIsImageDeleteVisible(false);
    dispatch(albumFunc('Image'));
    dispatch(imageSelectionOff());
  };

  const handleImageDelete = async () => {
    const data = { imageIds: selectedImageIds };
    const res = albumAPI.deleteImage(cupId, albumId, data);
    console.log(res);
    const newData = await albumImages.filter(
      item => !selectedImages.includes(item),
    );
    await setAlbumImages([]);
    setSelectedImages([]);
    setAlbumImages(newData);
    closeImageDeleteModal();
  };

  const closeImageDownloadModal = () => {
    setIsImageDownloadVisible(false);
    dispatch(albumFunc('Image'));
    dispatch(imageSelectionOff());
  };

  const ImageDownload = async () => {
    closeImageDownloadModal();
    console.log('Download');
    // const downloadDest = `${RNFS.DocumentDirectoryPath}/sss`;
    // const { promise } = RNFS.downloadFile({
    //   fromUrl:
    //     'https://fastly.picsum.photos/id/179/200/200.jpg?hmac=I0g6Uht7h-y3NHqWA4e2Nzrnex7m-RceP1y732tc4Lw',
    //   toFile: downloadDest,
    // });
    // const { statusCode } = await promise;
    // console.log(statusCode);
    // const { config, fs } = RNFetchBlob;
    // let date = new Date();
    // let PictureDir = fs.dirs.DocumentDir;
    // let options = {
    //   fileCache: true,
    //   addAndroidDownloads: {
    //     //Related to the Android only
    //     useDownloadManager: true,
    //     notification: true,
    //     path:
    //       PictureDir +
    //       '/image_' +
    //       Math.floor(date.getTime() + date.getSeconds() / 2),
    //     description: 'Image',
    //   },
    // };
    // config(options)
    //   .fetch(
    //     'GET',
    //     'https://fastly.picsum.photos/id/179/200/200.jpg?hmac=I0g6Uht7h-y3NHqWA4e2Nzrnex7m-RceP1y732tc4Lw',
    //   )
    //   .then(res => {
    //     //Showing alert after successful downloading
    //     console.log('res -> ', JSON.stringify(res));
    //   });
  };

  const closeImageShareModal = () => {
    setIsImageShareVisible(false);
    dispatch(albumFunc('Image'));
    dispatch(imageSelectionOff());
    // setActiveTab('ImageModal');
  };

  const handleImageShare = async () => {
    try {
      const result = await Share.share({
        message:
          'React Native | A framework for building native apps using React',
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log('type1');
        } else {
          // shared
          console.log('type2');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('type3');
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          height: 50,
          backgroundColor: 'white',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}>
        {
          <RenderImageHeader
            selectedImages={selectedImages}
            isRepImageSelMode={isRepImageSelMode}
            handleSelectAll={handleSelectAll}
            handleBackBtn={handleBackBtn}
            handleRepTrans={handleRepTrans}
            selectImageFromGallery={selectImageFromGallery}
            handleMoreBtn={handleMoreBtn}
          />
        }
      </View>
      <View>
        <FlatList
          data={albumImages} // 앨범에 해당하는 이미지 데이터를 사용합니다.
          renderItem={({ item }) => (
            <RenderImage
              selectedImages={selectedImageIds}
              tmpRepImage={tmpRepImage}
              isRepImageSelMode={isRepImageSelMode}
              handleImagePress={() => handleImagePress(item)}
              handleImageLongPress={handleImageLongPress}
              item={item}
            />
          )}
          keyExtractor={(item, index) => String(index)}
          numColumns={numColumns}
          key={'ImageModal'}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.1}
        />
      </View>

      <Modal // 상세 페이지 설정메뉴
        visible={isMoreModalVisible}
        animationType="none"
        transparent={true}>
        <TouchableWithoutFeedback
          onPress={() => {
            setIsMoreModalVisible(false);
          }}>
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
                onPress={() => handleDeleteAlbum()}
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
        </TouchableWithoutFeedback>
      </Modal>

      <Modal // 앨범 이름 변경
        visible={isModNameVisible}
        animationType="slide"
        transparent={true}>
        <TouchableWithoutFeedback
          onPress={() => {
            setIsModNameVisible(false);
          }}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text>앨범명 변경</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => {
                  setChangeTitle(text);
                }}
                defaultValue={albumTitle}
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
                  onPress={() => handleTitle()}>
                  변경
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal // 이미지 다운로드
        visible={isImageDownloadVisible}
        animationType="slide"
        transparent={true}>
        <TouchableWithoutFeedback
          onPress={() => {
            closeImageDownloadModal();
          }}>
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
                  onPress={() => ImageDownload()}>
                  다운로드
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal // 이미지 공유하기
        visible={isImageShareVisible}
        animationType="slide"
        transparent={true}>
        <TouchableWithoutFeedback
          onPress={() => {
            closeImageShareModal();
          }}>
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
                  onPress={() => handleImageShare()}>
                  공유하기
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal // 이미지 삭제
        visible={isImageDeleteVisible}
        animationType="slide"
        transparent={true}>
        <TouchableWithoutFeedback
          onPress={() => {
            closeImageDeleteModal();
          }}>
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
                  onPress={() => handleImageDelete()}>
                  삭제
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
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

export default AlbumDetail;
