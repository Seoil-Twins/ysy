import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useDebouncedCallback } from 'use-debounce';

import CustomText from './CustomText';

const DEBOUNCE_SEC = 500;

type InputProps = {
  maxLength?: number;
  defaultValue?: string | null;
  placeholder: string;
  editable?: boolean;
  mode?: 'text' | 'numeric' | 'tel' | 'search' | 'email';
  multipleLine?: boolean;
  isError?: boolean;
  errorMessage?: string;
  textAlignVertical?: string;
  onInputChange?: (text: string) => void;
};

const Input: React.FC<InputProps> = ({
  maxLength,
  defaultValue,
  placeholder,
  editable,
  mode,
  multipleLine = false,
  isError = false,
  errorMessage,
  textAlignVertical = 'auto',
  onInputChange,
}) => {
  const handleInputChange = useDebouncedCallback((text: string) => {
    onInputChange?.(text);
  }, DEBOUNCE_SEC);

  return (
    <View
      style={[
        multipleLine ? styles.multiplelineContainer : styles.container,
        isError ? { marginBottom: 30 } : { marginBottom: 15 },
      ]}>
      <TextInput
        style={[styles.input, isError ? styles.error : null]}
        placeholder={placeholder}
        placeholderTextColor="#999999"
        defaultValue={defaultValue ? defaultValue : ''}
        maxLength={maxLength}
        editable={!editable ? editable : true}
        inputMode={mode ? mode : 'text'}
        multiline={multipleLine}
        numberOfLines={multipleLine ? 4 : 1}
        textAlignVertical={textAlignVertical}
        onChangeText={handleInputChange}
      />
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
    height: 50,
  },
  multiplelineContainer: {
    textAlignVertical: 'top',
    maxHeight: 150,
  },
  input: {
    paddingLeft: 15,
    paddingRight: 15,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    fontSize: 16,
  },
  error: {
    borderColor: '#FF6D70',
  },
});

export default Input;
