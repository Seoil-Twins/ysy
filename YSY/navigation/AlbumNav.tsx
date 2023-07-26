import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import MergeSvg from '../assets/icons/merge.svg';
import DeleteSvg from '../assets/icons/delete.svg';
import DownloadSvg from '../assets/icons/download.svg';

import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Album from '../screens/Album';

const Tab = createBottomTabNavigator();
const screenWidth = wp('100%');

const AlbumNav = () => {
  return (
    <Tab.Navigator
      initialRouteName="Album"
      screenOptions={({}) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { height: 48, alignItems: 'center' },
        tabBarIcon: ({}) => {
          return (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <TouchableOpacity
                style={{
                  width: screenWidth * 0.2,
                  marginLeft: screenWidth * 0.1,
                }}
                onPress={() => {
                  console.log('MERGE');
                }}>
                <MergeSvg width={30} height={25} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ width: screenWidth * 0.3, alignItems: 'center' }}
                onPress={() => {
                  console.log('DOWNLOAD');
                }}>
                <DownloadSvg width={26} height={26} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: screenWidth * 0.2,
                  marginRight: screenWidth * 0.1,
                  alignItems: 'flex-end',
                }}
                onPress={() => {
                  console.log('DELETE');
                }}>
                <DeleteSvg width={25} height={27} />
              </TouchableOpacity>
            </View>
          );
        },
      })}>
      <Tab.Screen name="Album" component={Album} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  imgBox: {
    width: 34,
    height: 34,
  },
});

export default AlbumNav;
