import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import CustomText from './CustomText';

type ConfirmModalViewProps = {
  title: string;
  subTitle: string;
  description: string;
  cancelText: string;
  confirmText: string;
  cancelColor?: string;
  confirmColor?: string;
  onPressCancel: () => void;
  onPressConfirm: () => void;
};

const ConfirmModalView: React.FC<ConfirmModalViewProps> = ({
  title,
  subTitle,
  description,
  cancelText,
  confirmText,
  cancelColor = '#222222',
  confirmColor = '#FF6D70',
  onPressCancel,
  onPressConfirm,
}) => {
  return (
    <View style={styles.container}>
      <CustomText size={18} weight="medium" style={styles.title}>
        {title}
      </CustomText>
      <CustomText size={18} weight="medium">
        {subTitle}
      </CustomText>
      <CustomText
        size={16}
        weight="regular"
        color="#999999"
        style={styles.description}>
        {description}
      </CustomText>
      <View style={styles.btnBox}>
        <Pressable onPress={onPressCancel} style={styles.btn}>
          <CustomText size={18} weight="medium" color={cancelColor}>
            {cancelText}
          </CustomText>
        </Pressable>
        <CustomText size={20} weight="medium">
          |
        </CustomText>
        <Pressable onPress={onPressConfirm} style={styles.btn}>
          <CustomText size={18} weight="medium" color={confirmColor}>
            {confirmText}
          </CustomText>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  title: {
    marginBottom: 15,
  },
  description: {
    marginBottom: 25,
  },
  btnBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    flex: 1,
    alignItems: 'center',
  },
});

export default ConfirmModalView;
