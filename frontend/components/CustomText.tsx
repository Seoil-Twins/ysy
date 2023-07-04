import React, { ReactNode } from "react";
import { Text } from "react-native";

type CustomTextProps = {
  weight: "regular" | "medium";
  size: number;
  children: ReactNode;
};

const CustomText = (props: CustomTextProps) => {
  return (
    <Text
      style={{
        fontFamily: props.weight === "medium" ? "notosans-medium" : "notosans-regular",
        fontSize: props.size,
        color: "#222222"
      }}
    >
      {props.children}
    </Text>
  );
};

export default CustomText;
