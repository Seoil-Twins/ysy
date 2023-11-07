import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { User } from '../types/user';
import { SettingsNavType } from '../navigation/NavTypes';

import CustomText from '../components/CustomText';
import { globalStyles } from '../style/global';
import ConfirmHeader from '../components/ConfirmHeader';
import InputTitle from '../components/InputTitle';
import Input from '../components/Input';
import DatePicker from '../components/DatePicker';

import { isVaildEmail, isVaildPhone } from '../util/validation';
import { userAPI } from '../apis/userAPI';

const fetchUpdateUser = async (
  name: string,
  birthday: string,
  phone: string,
  email: string,
  user: User,
) => {
  const data = { name: name, birthday: birthday, phone: phone, email: email };
  userAPI.patchUser(user.userId, data);

  return { statusCode: 204 };
};

const EditProfile = () => {
  const navigation = useNavigation<StackNavigationProp<SettingsNavType>>();
  const { params } = useRoute<RouteProp<SettingsNavType, 'Profile'>>();
  const descriptions = ['사용자의 정보를 수정합니다.'];

  const [user] = useState<User>(params.user);
  const [editable, setEditable] = useState<boolean>(false);

  const [name, setName] = useState<string>(user.name);
  const [isErrorName, setIsErrorName] = useState(false);
  const [errorMsgName, setErrorMsgName] = useState('');

  const [email, setEmail] = useState<string>(user.email);
  const [isErrorEmail, setIsErrorEmail] = useState(false);
  const [errorMsgEmail, setErrorMsgEmail] = useState('');

  const [phone, setPhone] = useState<string>(user.phone);
  const [isErrorPhone, setIsErrorPhone] = useState(false);
  const [errorMsgPhone, setErrorMsgPhone] = useState('');

  const [birthday, setBirthday] = useState<string>(user.birthday);
  const [isErrorBirthday, setIsErrorBirthday] = useState(false);
  const [errorMsgBirthday, setErrorMsgBirthday] = useState('');

  const nameRef = useRef(name);
  const birthdayRef = useRef(birthday);
  const phoneRef = useRef(phone);
  const emailRef = useRef(email);

  const onChangeName = useCallback((name: string) => {
    setName(name);
  }, []);

  const onChangeBirthday = useCallback((birthday: string) => {
    setBirthday(String(birthday));
  }, []);

  const onChangePhone = useCallback((phone: string) => {
    setPhone(phone);
  }, []);

  const onChangeEmail = useCallback((email: string) => {
    setEmail(email);
  }, []);

  const vaildation = useCallback(() => {
    let isEdit: boolean = false;
    let isVaild: boolean = true;

    if (name !== nameRef.current) {
      isEdit = true;
    } else if (birthday !== birthdayRef.current) {
      isEdit = true;
    } else if (phone !== phoneRef.current) {
      isEdit = true;
    } else if (email !== emailRef.current) {
      isEdit = true;
    }

    if (isEdit) {
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
      if (!birthday || birthday.split('-').length !== 3) {
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
    }

    if (!isEdit || !isVaild) {
      setEditable(false);
      return;
    }

    setEditable(true);
  }, [name, birthday, phone, email]);

  const onPressEdit = async () => {
    if (!editable) {
      return;
    }

    const response = await fetchUpdateUser(name, birthday, phone, email, user);

    if (response.statusCode === 204) {
      const newUser = { ...user };
      newUser.name = name;
      newUser.birthday = birthday;
      newUser.phone = phone;
      newUser.email = email;

      navigation.navigate('Profile', {
        user: newUser,
      });
    }
  };

  useEffect(() => {
    vaildation();
  }, [name, birthday, phone, email, vaildation]);

  return (
    <View style={styles.container}>
      <ConfirmHeader btnText="수정" onPress={onPressEdit} isEnable={editable} />
      <View style={globalStyles.plpr20}>
        <InputTitle title="사용자 정보 수정" descriptions={descriptions} />
        <CustomText size={14} weight="medium" style={styles.title}>
          이름
        </CustomText>
        <Input
          placeholder="이름"
          defaultValue={user.name}
          onInputChange={onChangeName}
          isError={isErrorName}
          errorMessage={errorMsgName}
        />
        <CustomText size={14} weight="medium" style={styles.title}>
          생년월일
        </CustomText>
        <DatePicker
          placeholder="생년월일"
          mode="date"
          defaultValue={user.birthday}
          onInputChange={onChangeBirthday}
          isError={isErrorBirthday}
          errorMessage={errorMsgBirthday}
        />
        <CustomText size={14} weight="medium" style={styles.title}>
          휴대폰 번호
        </CustomText>
        <Input
          placeholder="-를 제외한 휴대폰 번호"
          defaultValue={user.phone}
          mode="tel"
          onInputChange={onChangePhone}
          isError={isErrorPhone}
          errorMessage={errorMsgPhone}
        />
        <CustomText size={14} weight="medium" style={styles.title}>
          이메일
        </CustomText>
        <Input
          placeholder="이메일"
          defaultValue={user.email}
          mode="email"
          onInputChange={onChangeEmail}
          isError={isErrorEmail}
          errorMessage={errorMsgEmail}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  title: {
    marginBottom: 5,
  },
});

export default EditProfile;
