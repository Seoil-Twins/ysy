import React, { useState } from 'react';
import { StyleSheet, Pressable, Image } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { User } from '../types/user';
import { SettingsNavType } from '../navigation/NavTypes';

import CustomText from '../components/CustomText';

const EditProfile = () => {
  const navigation = useNavigation<StackNavigationProp<SettingsNavType>>();
  const { params } = useRoute<RouteProp<SettingsNavType, 'Profile'>>();

  const [user, setUser] = useState<User>(params.user);

  const onCLick = () => {
    const newObject = { ...user };
    newObject.name = '바뀜 ㅋ';

    navigation.navigate('Profile', {
      user: newObject,
    });
  };

  return (
    <Pressable onPress={onCLick}>
      <CustomText size={16} weight="regular">
        {user.name}
      </CustomText>
      {user && user.profile ? (
        <Image
          source={{ uri: user.profile }}
          style={{ width: 50, height: 50 }}
        />
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({});

export default EditProfile;
