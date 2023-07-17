import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomText from './CustomText';

type InputTitleProps = {
  title: string;
  descriptions: string[];
};

const InputTitle: React.FC<InputTitleProps> = (props: InputTitleProps) => {
  return (
    <View style={styles.container}>
      <CustomText size={26} weight="medium" style={styles.title}>
        {props.title}
      </CustomText>
      {props.descriptions.map((description, i) => (
        <CustomText size={16} weight="regular" color="#999999" key={i}>
          {description}
        </CustomText>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    marginBottom: 40,
  },
  title: {
    marginBottom: 15,
  },
});

export default InputTitle;
