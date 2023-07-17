import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

type InputProps = {
  defaultValue?: string;
  placeholder: string;
  onInputChange?: (text: string) => void;
};

const Input: React.FC<InputProps> = ({ defaultValue, placeholder }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999999"
        defaultValue={defaultValue}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  input: {
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    fontSize: 16,
  },
});

export default Input;
