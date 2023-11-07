import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Pressable, View, Modal } from 'react-native';
import { TriangleColorPicker, toHsv, fromHsv } from 'react-native-color-picker';

import CustomText from './CustomText';
type ColorPickerProps = {
  defaultValue?: string;
  placeholder: string;
  isError?: boolean;
  errorMessage?: string;
  onColorChange?: (color: string) => void;
};

const ColorPicker: React.FC<ColorPickerProps> = ({
  defaultValue,
  isError = false,
  onColorChange,
}) => {
  const [color, setColor] = useState<string>(
    defaultValue ? defaultValue : '#00FF00',
  );
  const [oldColor, setOldColor] = useState<string>(
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

  const handleCancel = () => {
    hideColorPicker();
    setColor(oldColor);
  };

  const handleOk = () => {
    hideColorPicker();
    setOldColor(color);
  };

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
        <View style={{ flex: 1, height: '80%' }}>
          <TriangleColorPicker
            oldColor={oldColor}
            color={color}
            onColorChange={handleColorChange}
            onColorSelected={handleOk}
            onOldColorSelected={handleCancel}
            style={{ flex: 1 }}
          />
        </View>
      </Modal>
    </View>
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
