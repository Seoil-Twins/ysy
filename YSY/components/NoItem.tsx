import React from 'react';
import { StyleSheet, View } from 'react-native';

import CustomText from './CustomText';
import { SvgProps } from 'react-native-svg';

type NoItemProps = {
  icon: React.FC<SvgProps>;
  descriptions: string[];
  width?: number;
  height?: number;
};

const NoItem: React.FC<NoItemProps> = ({
  icon: IconComponent,
  descriptions,
  width = 60,
  height = 60,
}) => {
  return (
    <View style={styles.container}>
      <IconComponent
        width={width}
        height={height}
        style={{ marginBottom: 15 }}
      />
      {descriptions.map((text: string, index: number) => (
        <CustomText key={index} size={18} weight="regular" color="#BBBBBB">
          {text}
        </CustomText>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NoItem;
