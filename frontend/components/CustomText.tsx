import React, { ReactNode } from "react";
import { Text, StyleProp, TextStyle } from "react-native";

type CustomTextProps = {
  weight: "regular" | "medium";
  size: number;
  color?: string;
  children: ReactNode;
  style?: StyleProp<TextStyle>;
};

const CustomText: React.FC<CustomTextProps> = (props: CustomTextProps) => {
  const { style, children } = props;

  return (
    <Text
      style={[
        {
          fontFamily: props.weight === "medium" ? "notosans-medium" : "notosans-regular",
          fontSize: props.size,
          color: props.color ? props.color : "#222222",
          includeFontPadding: false
        },
        style
      ]}
    >
      {children}
    </Text>
  );
};

export default CustomText;
