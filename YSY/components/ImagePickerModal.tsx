import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';

import CustomText from './CustomText';

export type EventBtnType = 'Album' | 'Camera' | 'Default';

type ImagePickerModalProps = {
  onPress: (type: EventBtnType) => void;
};

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({ onPress }) => {
  const emitPress = (type: EventBtnType) => {
    onPress(type);
  };

  return (
    <View style={styles.container}>
      <View style={styles.btnBox}>
        <CustomText size={22} weight="regular" style={styles.title}>
          사진 선택
        </CustomText>
        <Pressable
          style={styles.btn}
          onPress={() => {
            emitPress('Album');
          }}>
          <CustomText size={18} weight="regular">
            사진 앨범
          </CustomText>
        </Pressable>
        <Pressable
          style={styles.btn}
          onPress={() => {
            emitPress('Camera');
          }}>
          <CustomText size={18} weight="regular">
            카메라
          </CustomText>
        </Pressable>
        <Pressable
          style={styles.btn}
          onPress={() => {
            emitPress('Default');
          }}>
          <CustomText size={18} weight="regular">
            기본 이미지
          </CustomText>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  btnBox: {
    justifyContent: 'center',
  },
  title: {
    marginBottom: 20,
  },
  btn: {
    paddingVertical: 15,
  },
});

export default ImagePickerModal;
