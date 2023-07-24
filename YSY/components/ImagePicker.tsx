import React, { useState } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import ImageCropPicker, { ImageOrVideo } from 'react-native-image-crop-picker';

import ImagePickerSVG from '../assets/icons/image_picker.svg';

import CustomText from './CustomText';

type ImagePickerProps = {
  placeholder: string;
  onInputChange?: (value: ImageOrVideo) => void;
};

const ImagePicker: React.FC<ImagePickerProps> = ({
  placeholder,
  onInputChange,
}) => {
  const [value, setValue] = useState('');

  const onSuccess = (image: ImageOrVideo) => {
    // Formdata를 통해 전송
    /**
     * {
        "cropRect":{
            "height":2857,
            "width":1713,
            "x":1168,
            "y":1
        },
        "height":600,
        "mime":"image/jpeg",
        "modificationDate":"1689677165000",
        "path":"file:///storage/emulated/0/Android/data/com.ysy/files/Pictures/3526149c-84b9-4ab6-92ec-a3943e1bde4b.jpg",
        "size":194997,
        "width":360
       }
     */
    const name = image.path.substring(image.path.lastIndexOf('/') + 1);
    setValue(name);
    onInputChange?.(image);
  };

  const onError = (error: any) => {
    if (String(error).includes('User cancelled image selection')) {
      console.log('user cancel');
    } else if (String(error).includes('permission')) {
      console.log('Not Allow permission');
    }
  };

  const showImagePicker = () => {
    ImageCropPicker.openPicker({
      width: 360,
      height: 600,
      cropping: true,
    })
      .then(onSuccess)
      .catch(onError);
  };

  return (
    <Pressable style={styles.container} onPress={showImagePicker}>
      {value === '' ? (
        <CustomText size={16} color="#999999" weight="regular">
          {placeholder}
        </CustomText>
      ) : (
        <CustomText size={16} weight="regular" numberOfLine={1}>
          {value}
        </CustomText>
      )}
      <ImagePickerSVG style={styles.img} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 15,
    paddingLeft: 15,
    paddingRight: 45,
    height: 50,
    maxHeight: 50,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  img: {
    position: 'absolute',
    right: 15,
  },
});

export default ImagePicker;
