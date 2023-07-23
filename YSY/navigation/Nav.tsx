import React, { useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Home from '../screens/Home';
import Album, {handleDownloadAlbums, handleDeleteAlbums, handleMergeAlbums} from '../screens/Album';
import Calendar from '../screens/Calendar';
import Date from '../screens/Date';
import More from '../screens/More';

import HomeNoneSVG from '../assets/icons/home_none.svg';
import HomeActiveSVG from '../assets/icons/home_active.svg';
import AlbumNoneSVG from '../assets/icons/album_none.svg';
import AlbumActiveSVG from '../assets/icons/album_active.svg';
import CalendarNoneSVG from '../assets/icons/calendar_none.svg';
import CalendarActiveSVG from '../assets/icons/calendar_active.svg';
import DateNoneSVG from '../assets/icons/date_none.svg';
import DateActiveSVG from '../assets/icons/date_active.svg';
import MoreNoneSVG from '../assets/icons/more_none.svg';
import MoreActiveSVG from '../assets/icons/more_active.svg';
import DownloadSvg from '../assets/icons/download.svg';
import MergeSvg from '../assets/icons/merge.svg';
import DeleteSvg from '../assets/icons/delete.svg';

import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

const Tab = createBottomTabNavigator();
const screenWidth = wp('100%');

const Nav = () => {
  const [activeTab, setActiveTab] = useState('Default');

  return (
    <NavigationContainer>
      {activeTab.includes('AlbumModal') ? (
        <Tab.Navigator
          initialRouteName="Home"
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
                    onPress={() => {setActiveTab('AlbumModalMerge');}}>
                    <MergeSvg width={30} height={25} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ width: screenWidth * 0.3, alignItems: 'center' }}
                    onPress={() => {setActiveTab('AlbumModalDownload');}}>
                    <DownloadSvg width={26} height={26} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      width: screenWidth * 0.2,
                      marginRight: screenWidth * 0.1,
                      alignItems: 'flex-end',
                    }}
                    onPress={() => {setActiveTab('AlbumModalDelete');}}>
                    <DeleteSvg width={25} height={27} />
                  </TouchableOpacity>
                </View>
              );
            },
          })}>
          <Tab.Screen name="Album">
            {() => <Album setActiveTab={setActiveTab} activeTab={activeTab} />}
          </Tab.Screen>
        </Tab.Navigator>
      ) : (
        <Tab.Navigator
          initialRouteName="Home"
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: { height: 48, alignItems: 'center' },
            tabBarIcon: ({ focused }) => {
              let IconComponent: React.FC<SvgProps>;

              if (route.name === 'Home') {
                IconComponent = focused ? HomeActiveSVG : HomeNoneSVG;
              } else if (route.name === 'Album') {
                IconComponent = focused ? AlbumActiveSVG : AlbumNoneSVG;
              } else if (route.name === 'Calendar') {
                IconComponent = focused ? CalendarActiveSVG : CalendarNoneSVG;
              } else if (route.name === 'Date') {
                IconComponent = focused ? DateActiveSVG : DateNoneSVG;
              } else if (route.name === 'More') {
                IconComponent = focused ? MoreActiveSVG : MoreNoneSVG;
              } else {
                IconComponent = HomeActiveSVG;
              }
              return <IconComponent style={styles.imgBox} />;
            },
          })}>
          <Tab.Screen name="Home" component={Home} />
          <Tab.Screen name="Album">
            {() => <Album setActiveTab={setActiveTab} activeTab={activeTab} />}
          </Tab.Screen>
          <Tab.Screen name="Calendar" component={Calendar} />
          <Tab.Screen name="Date" component={Date} />
          <Tab.Screen name="More" component={More} />
        </Tab.Navigator>
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  imgBox: {
    width: 34,
    height: 34,
  },
  iconBox: {
    width: 111,
    height: 68,
  },
});

export default Nav;
