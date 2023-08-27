import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ImageOrVideo } from 'react-native-image-crop-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import ConfirmHeader from '../components/ConfirmHeader';
import InputTitle from '../components/InputTitle';
import Input from '../components/Input';
import ImagePicker from '../components/ImagePicker';

import { globalStyles } from '../style/global';
import { SettingsNavType } from '../navigation/NavTypes';

const descriptions = [
  '불편하신 또는 버그 등을',
  '저희에게 알려주시면 빠르게 처리 해드리겠습니다.',
];

const fetchAddInquiry = async (
  title: string,
  description: string,
  images: ImageOrVideo | ImageOrVideo[] | null,
) => {
  console.log(title, description);
  console.log(images);

  const response = {
    statusCode: 201,
  };

  return response;
};

const Inquiry = () => {
  const navigation = useNavigation<StackNavigationProp<SettingsNavType>>();

  const [addable, setAddable] = useState<boolean>(false);

  const [title, setTitle] = useState<string>('');
  const [isErrorTitle, setIsErrorTitle] = useState<boolean>(false);
  const [errorMsgTitle, setErrorMsgTitle] = useState<string>('');

  const [description, setDescription] = useState<string>('');
  const [isErrorDescription, setIsErrorDescription] = useState<boolean>(false);
  const [errorMsgDescription, setErrorMsgDescription] = useState<string>('');

  const [images, setImages] = useState<ImageOrVideo | ImageOrVideo[] | null>(
    null,
  );
  const [isErrorImages, setIsErrorImages] = useState<boolean>(false);
  const [errorMsgImages, setErrorMsgImages] = useState<string>('');

  const changeTitle = useCallback((text: string) => {
    setTitle(text);
  }, []);

  const changeDescription = useCallback((text: string) => {
    setDescription(text.trim());
  }, []);

  const changeImages = useCallback((images: ImageOrVideo | ImageOrVideo[]) => {
    setImages(images);
  }, []);

  const validation = useCallback(() => {
    let isVaild: boolean = true;

    if (title !== '' && title.length < 3) {
      setIsErrorTitle(true);
      setErrorMsgTitle('3자 이상 입력해주세요.');
      isVaild = false;
    } else {
      setIsErrorTitle(false);
      setErrorMsgTitle('');
    }
    if (description !== '' && description.length < 20) {
      setIsErrorDescription(true);
      setErrorMsgDescription('20자 이상 입력해주세요.');
      isVaild = false;
    } else {
      setIsErrorDescription(false);
      setErrorMsgDescription('');
    }
    if (images && Array.isArray(images) && images.length > 5) {
      setIsErrorImages(true);
      setErrorMsgImages('최대 이미지 개수는 5개입니다.');
      isVaild = false;
    } else {
      setIsErrorImages(false);
      setErrorMsgImages('');
    }

    if (!title || !description) {
      setAddable(false);
      return;
    } else if (!isVaild) {
      setAddable(false);
      return;
    }

    setAddable(true);
  }, [title, description, images]);

  const onPressAdd = async () => {
    if (!addable) {
      return;
    }

    const response = await fetchAddInquiry(title, description, images);

    if (response.statusCode === 201) {
      navigation.replace('InquiryHistory');
    }
  };

  useEffect(() => {
    if (title || description || images) {
      validation();
    }
  }, [title, description, images, validation]);

  return (
    <View style={styles.container}>
      <ConfirmHeader btnText="추가" isEnable={addable} onPress={onPressAdd} />
      <View style={globalStyles.plpr20}>
        <InputTitle title="문의하기" descriptions={descriptions} />
        <Input
          placeholder="3자 이상의 제목을 입력해주세요."
          onInputChange={changeTitle}
          isError={isErrorTitle}
          errorMessage={errorMsgTitle}
        />
        <Input
          placeholder="20자 이상의 설명을 입력해주세요."
          onInputChange={changeDescription}
          multipleLine={true}
          isError={isErrorDescription}
          errorMessage={errorMsgDescription}
        />
        <ImagePicker
          placeholder="5개 이내의 사진"
          cropping={false}
          multiple={true}
          onInputChange={changeImages}
          isError={isErrorImages}
          errorMessage={errorMsgImages}
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
  content: {},
});

export default Inquiry;
