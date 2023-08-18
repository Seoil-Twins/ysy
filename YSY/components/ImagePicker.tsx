import React, { useState } from 'react';
import { Platform, StyleSheet, Pressable, View } from 'react-native';
import ImageCropPicker, { ImageOrVideo } from 'react-native-image-crop-picker';
import { PERMISSIONS } from 'react-native-permissions';

import { checkPermission } from '../util/permission';

import ImagePickerSVG from '../assets/icons/image_picker.svg';

import CustomText from './CustomText';

type ImagePickerProps = {
  placeholder: string;
  cropping?: boolean;
  width?: number;
  height?: number;
  multiple?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onInputChange?: (value: ImageOrVideo | ImageOrVideo[]) => void;
};

const ImagePicker: React.FC<ImagePickerProps> = ({
  placeholder,
  cropping = true,
  width = 360,
  height = 640,
  multiple = false,
  isError = false,
  errorMessage,
  onInputChange,
}) => {
  const [values, setValues] = useState<string[]>([]);

  const onSuccess = (images: ImageOrVideo | ImageOrVideo[]) => {
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
    if (Array.isArray(images)) {
      const newValues: string[] = [];

      images.forEach((image: ImageOrVideo) => {
        const name = image.path.substring(image.path.lastIndexOf('/') + 1);
        newValues.push(name);
      });

      setValues(newValues);
      onInputChange?.(images);
    } else {
      const name = images.path.substring(images.path.lastIndexOf('/') + 1);
      setValues([name]);
      onInputChange?.(images);
    }
  };

  const onError = async (error: any) => {
    if (String(error).includes('permission') && Platform.OS === 'android') {
      await checkPermission(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
    } else if (String(error).includes('permission') && Platform.OS === 'ios') {
      await checkPermission(PERMISSIONS.IOS.PHOTO_LIBRARY);
    }
  };

  const showImagePicker = () => {
    if (cropping) {
      ImageCropPicker.openPicker({
        width: width,
        height: height,
        cropping: true,
        multiple: multiple,
      })
        .then(onSuccess)
        .catch(onError);
    } else {
      ImageCropPicker.openPicker({
        cropping: false,
        multiple: multiple,
        maxFiles: 5,
      })
        .then(onSuccess)
        .catch(onError);
    }
  };

  return (
    <View
      style={[
        styles.container,
        isError ? { marginBottom: 30 } : { marginBottom: 15 },
      ]}>
      <Pressable
        onPress={showImagePicker}
        style={[
          styles.input,
          isError ? styles.errorBorder : styles.inputBorder,
        ]}>
        {values.length <= 0 ? (
          <CustomText size={16} color="#999999" weight="regular">
            {placeholder}
          </CustomText>
        ) : (
          values.map((value: string, index: number) => (
            <CustomText size={16} weight="regular" numberOfLine={1} key={index}>
              {value}
            </CustomText>
          ))
        )}
        <ImagePickerSVG style={styles.img} />
      </Pressable>
      {isError ? (
        <CustomText size={14} weight="regular" color="#FF6D70">
          {errorMessage}
        </CustomText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  input: {
    position: 'relative',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingLeft: 15,
    paddingRight: 45,
    minHeight: 50,
    borderWidth: 1,
  },
  img: {
    position: 'absolute',
    right: 15,
  },
  inputBorder: {
    borderColor: '#DDDDDD',
  },
  errorBorder: {
    borderColor: '#FF6D70',
  },
});

export default ImagePicker;
