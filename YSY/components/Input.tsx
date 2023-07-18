import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

type InputProps = {
  maxLength?: number;
  defaultValue?: string;
  placeholder: string;
  onInputChange?: (text: string) => void;
};

const Input: React.FC<InputProps> = ({
  maxLength,
  defaultValue,
  placeholder,
  onInputChange,
}) => {
  const handleInputChange = (text: string) => {
    onInputChange?.(text);
  };

  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#999999"
      defaultValue={defaultValue}
      maxLength={maxLength}
      onChangeText={handleInputChange}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 50,
    marginBottom: 15,
    paddingLeft: 15,
    paddingRight: 15,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    fontSize: 16,
  },
});

export default Input;
