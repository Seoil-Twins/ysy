import React from 'react';
import { StyleSheet, View } from 'react-native';

import BackHeader from '../components/BackHeader';

import { globalStyles } from '../style/global';
import InputTitle from '../components/InputTitle';
import Input from '../components/Input';

const ConnectCouple = () => {
  const title = '연인 맺기';
  const descriptions = [
    'YSY 서비스를 원할하게 사용하기 위해서는',
    '연인을 등록 해야합니다!',
  ];

  return (
    <View style={[styles.container, globalStyles.mlmr20]}>
      <BackHeader />
      <InputTitle title={title} descriptions={descriptions} />
      <Input placeholder="연인 맺을 상대방의 코드 입력" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
});

export default ConnectCouple;
