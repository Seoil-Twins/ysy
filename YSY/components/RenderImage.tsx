import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image, Text } from 'react-native';
import { useAppSelector } from '../redux/hooks';
import { RootState } from '../redux/store';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

import WCheckBigSvg from '../assets/icons/white_check_big.svg';
import WCheckSvg from '../assets/icons/white_check.svg';

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
    <View style={{ flex: 1, paddingTop: 1, alignItems: 'center' }}>
      <TouchableOpacity
        style={{
          flex: 1,
          paddingTop: 1,
          paddingRight: 1,
          position: 'relative',
          alignItems: 'center',
        }}
        onPress={() => handleImagePress(item)}
        onLongPress={() => handleImageLongPress()}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={{ uri: item }}
            style={{ width: screenWidth / 4 - 2, height: 100 }}
          />

          {isImage && (
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

const styles = StyleSheet.create({
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
});

export default RenderImage;
