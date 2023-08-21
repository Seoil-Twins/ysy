import React, { useRef, useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Animated, Pressable } from 'react-native';
import { useDebouncedCallback } from 'use-debounce';

import CustomText from './CustomText';

const DEBOUNCE_SEC = 300;

type ToggleButtonProps = {
  title: string;
  explain: string;
  isActive?: boolean;
  width?: number;
  height?: number;
  onChangeToggle?: (isToggle: boolean) => void;
};

const ToggleButton: React.FC<ToggleButtonProps> = ({
  title,
  explain,
  isActive = false,
  width = 55,
  height = 30,
  onChangeToggle,
}) => {
  const toggleItemSize: number = (height / 12) * 10;
  const btnPadding = 4;

  const [isToggle, setIsToggle] = useState<boolean>(isActive);
  const translateAnim = useRef(new Animated.Value(0)).current;

  // btnPadding * 2 = 양 옆 padding
  const moveTranslate = translateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width - (toggleItemSize + btnPadding * 2)],
  });

  const onToggle = useDebouncedCallback(() => {
    onChangeToggle?.(!isToggle);
    setIsToggle(!isToggle);
  }, DEBOUNCE_SEC);

  const toggleOn = useCallback(() => {
    Animated.timing(translateAnim, {
      toValue: 1,
      duration: DEBOUNCE_SEC,
      useNativeDriver: true,
    }).start();
  }, [translateAnim]);

  const toggleOff = useCallback(() => {
    Animated.timing(translateAnim, {
      toValue: 0,
      duration: DEBOUNCE_SEC,
      useNativeDriver: true,
    }).start();
  }, [translateAnim]);

  useEffect(() => {
    if (isToggle) {
      toggleOn();
    } else {
      toggleOff();
    }
  }, [isToggle, onChangeToggle, toggleOff, toggleOn]);

  return (
    <View style={styles.container}>
      <View style={styles.leftBox}>
        <CustomText size={16} weight="regular">
          {title}
        </CustomText>
        <CustomText size={14} weight="regular" color="#BBBBBB">
          {explain}
        </CustomText>
      </View>
      <Pressable
        onPress={onToggle}
        style={[
          {
            justifyContent: 'center',
            padding: btnPadding,
            width: width,
            height: height,
            borderRadius: width / 2,
          },
          isToggle ? styles.activeBox : styles.noneBox,
        ]}>
        <Animated.View
          style={[
            styles.toggleItem,
            {
              transform: [{ translateX: moveTranslate }],
              width: toggleItemSize,
              height: toggleItemSize,
              borderRadius: toggleItemSize / 2,
            },
          ]}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  leftBox: {
    flex: 1,
    marginRight: 5,
  },
  activeBox: {
    backgroundColor: '#5A8FFF',
  },
  noneBox: {
    backgroundColor: '#E4EAF6',
  },
  toggleItem: {
    backgroundColor: '#FFFFFF',
  },
});

export default ToggleButton;
