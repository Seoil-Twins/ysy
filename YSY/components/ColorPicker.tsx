import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Pressable, View, Modal } from 'react-native';
import { TriangleColorPicker, toHsv, fromHsv } from 'react-native-color-picker';
import { ColorPicker as ColorPicker2 } from 'react-native-color-picker';

import ColorPickerSVG from '../assets/icons/calendar.svg';

import CustomText from './CustomText';
import Slider from '@react-native-community/slider';

type ColorPickerProps = {
  defaultValue?: string;
  placeholder: string;
  isError?: boolean;
  errorMessage?: string;
  onColorChange?: (color: string) => void;
};

const ColorPicker: React.FC<ColorPickerProps> = ({
  defaultValue,
  placeholder,
  isError = false,
  errorMessage,
  onColorChange,
}) => {
  const [color, setColor] = useState<string>(
    defaultValue ? defaultValue : '#00FF00',
  );
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const showColorPicker = () => {
    setIsVisible(true);
  };

  const hideColorPicker = () => {
    setIsVisible(false);
  };

  const handleColorChange = useCallback(
    (color: string) => {
      setColor(fromHsv(color));
      onColorChange?.(toHsv(color));
    },
    [onColorChange],
  );

  const drawCircle = () => {
    return (
      <View
        style={{
          backgroundColor: color,
          width: 20,
          height: 20,
          borderRadius: 25,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          right: 15,
          borderWidth: 0.3,
        }}
      />
    );
  };

  useEffect(() => {
    handleColorChange(color);
  }, [handleColorChange, color]);

  return (
    <View
      style={[
        styles.container,
        isError ? { marginBottom: 30 } : { marginBottom: 15 },
      ]}>
      <Pressable
        style={[styles.input, isError ? styles.error : null]}
        onPress={showColorPicker}>
        <CustomText color={color} size={16} weight="regular">
          {color}
        </CustomText>
        {drawCircle()}
      </Pressable>
      <Modal // 앨범 이름 변경
        visible={isVisible}
        animationType="slide"
        transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'blye', height: '80%' }}>
          <TriangleColorPicker
            oldColor="purple"
            color={color}
            onColorChange={handleColorChange}
            onColorSelected={hideColorPicker}
            onOldColorSelected={hideColorPicker}
            style={{ flex: 1 }}
          />
        </View>
      </Modal>
    </View>
    // <View
    //   style={[
    //     styles.container,
    //     isError ? { marginBottom: 30 } : { marginBottom: 15 },
    //   ]}>
    //   <Pressable
    //     style={[styles.input, isError ? styles.error : null]}
    //     onPress={showColorPicker}>
    //     <CustomText size={16} weight="regular">
    //       {color}
    //     </CustomText>
    //     <ColorPickerSVG style={styles.img} />
    //     <ColorPicker2
    //       isVisible={isVisible}
    //       onColorChange={handleColorChange}
    //       onDismiss={hideColorPicker}
    //       color={toHsv(color)}
    //     />
    //   </Pressable>
    //   {isError ? (
    //     <CustomText size={14} weight="regular" color="#FF6D70">
    //       {errorMessage}
    //     </CustomText>
    //   ) : null}
    // </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
  },
  input: {
    position: 'relative',
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 15,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    height: 50,
  },
  img: {
    position: 'absolute',
    right: 15,
  },
  error: {
    borderColor: '#FF6D70',
  },
});

export default ColorPicker;
