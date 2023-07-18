import React, { ReactNode } from 'react';
import { Text, StyleProp, TextStyle } from 'react-native';

type CustomTextProps = {
  weight: 'regular' | 'medium';
  size: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  numberOfLine?: number;
  children: ReactNode;
};

const CustomText: React.FC<CustomTextProps> = (props: CustomTextProps) => {
  const { style, children } = props;

  return (
    <>
      {props.numberOfLine ? (
        <Text
          style={[
            {
              fontFamily:
                props.weight === 'medium'
                  ? 'NotoSansKR-Medium'
                  : 'NotoSansKR-Regular',
              fontSize: props.size,
              color: props.color ? props.color : '#222222',
              includeFontPadding: false,
            },
            style,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {children}
        </Text>
      ) : (
        <Text
          style={[
            {
              fontFamily:
                props.weight === 'medium'
                  ? 'NotoSansKR-Medium'
                  : 'NotoSansKR-Regular',
              fontSize: props.size,
              color: props.color ? props.color : '#222222',
              includeFontPadding: false,
            },
            style,
          ]}>
          {children}
        </Text>
      )}
    </>
  );
};

export default CustomText;
