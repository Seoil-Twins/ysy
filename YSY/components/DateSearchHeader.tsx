import React from 'react';
import { StyleSheet, View, Pressable, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import BackSVG from '../assets/icons/back.svg';
import { DateNavType } from '../navigation/NavTypes';
import { StackNavigationProp } from '@react-navigation/stack';

type DateSearchHeaderProps = {
  onChangeText: (text: string) => void;
  onSubmit: () => void;
};

const DateSearchHeader: React.FC<DateSearchHeaderProps> = ({
  onChangeText,
  onSubmit,
}) => {
  const navigation = useNavigation<StackNavigationProp<DateNavType>>();

  const moveBack = () => {
    navigation.goBack();
  };

  const emitChangeText = (text: string) => {
    onChangeText(text);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.img} onPress={moveBack}>
        <BackSVG />
      </Pressable>
      <TextInput
        style={styles.input}
        placeholder="데이트 장소를 입력해주세요."
        inputMode="search"
        onChangeText={emitChangeText}
        onSubmitEditing={onSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    paddingVertical: 10,
  },
  img: {
    marginRight: 20,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 15,
    backgroundColor: '#F5F8FF',
    fontSize: 16,
  },
});

export default DateSearchHeader;
