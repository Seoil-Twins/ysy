import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

import { globalStyles } from '../style/global';

import InputTitle from '../components/InputTitle';
import BackHeader from '../components/BackHeader';
import CustomText from '../components/CustomText';
import Input from '../components/Input';

import { TutorialTypes } from '../navigation/TutorialTypes';

const AdditionalInformation = () => {
  const { info } =
    useRoute<RouteProp<TutorialTypes, 'AdditionalInformation'>>().params;
  const title = '추가 정보 입력';
  const descriptions = [
    'YSY의 원할한 회원가입을 위해',
    '필요한 정보를 추가로 입력 해야합니다.',
  ];

  const [name, setName] = useState(info.name);
  const [isErrorName, setIsErrorName] = useState(false);
  const [errorMsgName, setErrorMsgName] = useState('');

  const [email, setEmail] = useState(info.email);
  const [isErrorEmail, setIsErrorEmail] = useState(false);
  const [errorMsgEmail, setErrorMsgEmail] = useState('');

  const [phone, setPhone] = useState(info.phone);
  const [isErrorPhone, setIsErrorPhone] = useState(false);
  const [errorMsgPhone, setErrorMsgPhone] = useState('');

  const [birthday, setBirthday] = useState(info.birthday);
  const [isErrorBirthday, setIsErrorBirthday] = useState(false);
  const [errorMsgBirthday, setErrorMsgBirthday] = useState('');

  const changeName = (name: string) => {
    setName(name);
  };

  const changeEmail = (email: string) => {
    setEmail(email);
  };

  const changePhone = (phone: string) => {
    setPhone(phone);
  };

  const changeBirthday = (birthday: string) => {
    setBirthday(String(birthday));
  };

  const isVaildEmail = (email: string) => {
    let pattern =
      /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
    return pattern.test(email);
  };

  const isVaildPhone = (phone: string) => {
    const pattern = /^010\d{8}$/;
    return pattern.test(phone);
  };

  const vaildation = () => {
    let isVaild: boolean = true;

    if (!name || name.length <= 1) {
      setIsErrorName(true);
      setErrorMsgName('2자리 이상 입력해주세요.');
      isVaild = false;
    } else {
      setIsErrorName(false);
      setErrorMsgName('');
    }
    if (!email || !isVaildEmail(email)) {
      setIsErrorEmail(true);
      setErrorMsgEmail('유효하지 않은 이메일입니다.');
      isVaild = false;
    } else {
      setIsErrorEmail(false);
      setErrorMsgEmail('');
    }
    if (!phone || !isVaildPhone(phone)) {
      setIsErrorPhone(true);
      setErrorMsgPhone('유효하지 않은 번호입니다.');
      isVaild = false;
    } else {
      setIsErrorPhone(false);
      setErrorMsgPhone('');
    }
    if (!birthday || birthday.length !== 8) {
      setIsErrorBirthday(true);
      setErrorMsgBirthday('유효하지 않은 생일입니다.');
      isVaild = false;
    } else if (
      Number(birthday.substring(0, 4)) < 1960 ||
      Number(birthday.substring(0, 4)) > 2020
    ) {
      setIsErrorBirthday(true);
      setErrorMsgBirthday('1960 ~ 2020년생까지만 가능합니다.');
      isVaild = false;
    } else {
      setIsErrorBirthday(false);
      setErrorMsgBirthday('');
    }

    if (!isVaild) {
      return;
    }

    console.log('good');
  };

  return (
    <View style={[styles.container, globalStyles.mlmr20]}>
      <BackHeader />
      <View style={styles.contentBox}>
        <InputTitle title={title} descriptions={descriptions} />
        {info.name ? (
          <Input placeholder="이름" defaultValue={info.name} editable={false} />
        ) : (
          <Input
            placeholder="이름"
            onInputChange={changeName}
            isError={isErrorName}
            errorMessage={errorMsgName}
          />
        )}
        {info.email ? (
          <Input
            placeholder="이메일"
            defaultValue={info.email}
            editable={false}
          />
        ) : (
          <Input
            placeholder="이메일"
            onInputChange={changeEmail}
            mode="email"
            isError={isErrorEmail}
            errorMessage={errorMsgEmail}
          />
        )}
        {info.phone ? (
          <Input
            placeholder="-를 제외한 휴대폰 번호"
            defaultValue={info.phone}
            editable={false}
          />
        ) : (
          <Input
            placeholder="-를 제외한 휴대폰 번호"
            onInputChange={changePhone}
            mode="tel"
            isError={isErrorPhone}
            errorMessage={errorMsgPhone}
            maxLength={11}
          />
        )}
        {info.birthday ? (
          <Input
            placeholder="8자리 생년월일"
            defaultValue={String(info.birthday)}
            editable={false}
          />
        ) : (
          <Input
            placeholder="8자리 생년월일"
            onInputChange={changeBirthday}
            mode="numeric"
            isError={isErrorBirthday}
            errorMessage={errorMsgBirthday}
            maxLength={8}
          />
        )}
      </View>
      <View style={styles.btnBox}>
        <Pressable style={styles.btn} onPress={vaildation}>
          <CustomText size={20} weight="medium" color="#FFFFFF">
            로그인
          </CustomText>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  contentBox: {
    flex: 3,
  },
  btnBox: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 48,
  },
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#5A8FFF',
    backgroundColor: '#5A8FFF',
  },
});

export default AdditionalInformation;
