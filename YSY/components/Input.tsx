import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import CustomText from './CustomText';

type InputProps = {
  maxLength?: number;
  defaultValue?: string | null;
  placeholder: string;
  editable?: boolean;
  mode?: 'text' | 'numeric' | 'tel' | 'search' | 'email';
  isError?: boolean;
  errorMessage?: string;
  onInputChange?: (text: string) => void;
};

const Input: React.FC<InputProps> = ({
  maxLength,
  defaultValue,
  placeholder,
  editable,
  mode,
  isError = false,
  errorMessage,
  onInputChange,
}) => {
  const handleInputChange = (text: string) => {
    onInputChange?.(text);
  };

  return (
    <View
      style={[
        styles.container,
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
