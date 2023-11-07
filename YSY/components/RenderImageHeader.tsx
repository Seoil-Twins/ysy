import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useAppSelector } from '../redux/hooks';
import { RootState } from '../redux/store';
// import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

import BackSvg from '../assets/icons/back.svg';
import BAddSvg from '../assets/icons/add_black.svg';
import MoreSvg from '../assets/icons/more_vert.svg';
import BCheckSvg from '../assets/icons/check.svg';
import UCheckSvg from '../assets/icons/un-check.svg';

type RenderImageHeaderProps = {
  selectedImages: string[];
  isRepImageSelMode: boolean;
  handleSelectAll: () => void;
  handleBackBtn: () => void;
  handleRepTrans: () => void;
  selectImageFromGallery: () => void;
  handleMoreBtn: () => void;
};

const RenderImageHeader: React.FC<RenderImageHeaderProps> = ({
  selectedImages,
  isRepImageSelMode,
  handleSelectAll,
  handleBackBtn,
  handleRepTrans,
  selectImageFromGallery,
  handleMoreBtn,
}) => {
  const isImage = useAppSelector(
    (state: RootState) => state.imageStatus.isImage,
  );

  if (isImage) {
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
      <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
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
              selectImageFromGallery();
            }}>
            <BAddSvg style={{ margin: 15 }} width={20} height={20} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              handleMoreBtn();
            }}>
            <MoreSvg style={{ margin: 15 }} width={20} height={20} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
};

export default RenderImageHeader;
