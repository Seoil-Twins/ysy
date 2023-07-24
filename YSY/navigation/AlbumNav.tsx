import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import MergeSvg from '../assets/icons/merge.svg';
import DeleteSvg from '../assets/icons/delete.svg';
import DownloadSvg from '../assets/icons/download.svg';

const Tab = createBottomTabNavigator();

const AlbumNav = () => {
  return (
    <View>
      <Tab.Navigator
        initialRouteName="Merge"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: { height: 48, alignItems: 'center' },
          tabBarIcon: () => {
            let IconComponent: React.FC<SvgProps>;

            if (route.name === 'Merge') {
              IconComponent = MergeSvg;
            } else if (route.name === 'Download') {
              IconComponent = DownloadSvg;
            } else if (route.name === 'Delete') {
              IconComponent = DeleteSvg;
            } else {
              IconComponent = MergeSvg;
            }

            return <IconComponent style={styles.imgBox} />;
          },
        })}>
        <Text>dasdas</Text>
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  imgBox: {
    width: 34,
    height: 34,
  },
});

export default AlbumNav;
