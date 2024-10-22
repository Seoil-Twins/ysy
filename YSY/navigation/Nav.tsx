import React from 'react';
import { StyleSheet } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import Home from '../screens/Home';
import Album from '../screens/Album';
import Calendar from '../screens/Calendar';
import Date from '../screens/Date';
import More from '../screens/More';
import AlbumDetail from '../screens/AlbumDetail';

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
import { QueryClient, QueryClientProvider } from 'react-query';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const Nav = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: { height: 48, alignItems: 'center' },
          tabBarIcon: ({ focused }) => {
            let IconComponent: React.FC<SvgProps> | null;

            if (route.name === 'Home') {
              IconComponent = focused ? HomeActiveSVG : HomeNoneSVG;
            } else if (route.name === 'AlbumStack') {
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

            return IconComponent ? (
              <IconComponent style={styles.imgBox} />
            ) : null;
          },
        })}>
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="AlbumStack" component={AlbumStack} />
        <Tab.Screen name="Calendar" component={Calendar} />
        <Tab.Screen name="Date" component={Date} />
        <Tab.Screen name="More" component={More} />
      </Tab.Navigator>
    </QueryClientProvider>
  );
};

const AlbumStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Album" component={Album} />
      <Stack.Screen name="AlbumDetail" component={AlbumDetail} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  imgBox: {
    width: 34,
    height: 34,
  },
});

export default Nav;
