import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { useAppSelector } from '../redux/hooks';
import { RootState } from '../redux/store';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

import { Darkroom } from 'react-native-image-filter-kit';

import WCheckSvg from '../assets/icons/white_check.svg';
import WCheckBigSvg from '../assets/icons/white_check_big.svg';

const screenWidth = wp('100%');

type RenderImageProps = {
  selectedImages: string[];
  tmpRepImage: string;
  item: string;
  isRepImageSelMode: boolean;
  handleImagePress: (imageName: string) => void;
  handleImageLongPress: () => void;
};

const RenderImage: React.FC<RenderImageProps> = ({
  selectedImages,
  tmpRepImage,
  item,
  isRepImageSelMode,
  handleImagePress,
  handleImageLongPress,
}) => {
  const isSelected = selectedImages.includes(item);
  const isTmpRepImage = tmpRepImage.includes(item);
  const isImage = useAppSelector(
    (state: RootState) => state.imageStatus.isImage,
  );

  return (
    <View style={{ flex: 1, paddingTop: 1, alignItems: 'flex-start' }}>
      <TouchableOpacity
        style={{
          flex: 1,
          paddingTop: 1,
          paddingRight: 1,
        }}
        onPress={() => handleImagePress(item)}
        onLongPress={() => handleImageLongPress()}>
        <View style={{ flexDirection: 'row' }}>
          <Image
            source={{ uri: item }}
            style={{ width: screenWidth / 4 - 2, height: 100 }}
          />
          {isTmpRepImage && (
            <View
              style={{
                position: 'absolute',
                width: screenWidth / 4 - 2,
                height: 100,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
              }}
            />
          )}

          {isImage && (
            <View
              style={
                isSelected ? styles.checkedCircle : styles.unCheckedCircle
              }>
              {isSelected ? <WCheckSvg width={12} height={12} /> : ''}
            </View>
          )}

          {isRepImageSelMode && isTmpRepImage && (
            <View
              style={{
                position: 'absolute',
                justifyContent: 'center',
                alignItems: 'center',
                width: screenWidth / 4 - 2,
                height: 100,
              }}>
              <WCheckBigSvg width={80} height={80} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  checkedCircle: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: '#3675FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    marginRight: 5,
  },
  unCheckedCircle: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF99',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    marginRight: 5,
  },
  darkImage: {
    tintColor: 'rgba(0, 0, 0, 0.5)', // 어두운 효과 생성 (투명도 조절 가능)
  },
});

export default RenderImage;
