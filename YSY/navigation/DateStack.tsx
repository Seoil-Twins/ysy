import React from 'react';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';

import DateSearch from '../screens/DateSearch';
import Date from '../screens/Date';

const Stack = createStackNavigator();

export type DateNavTypes = {
  Date: {
    detailId: string;
    title?: string;
  };
  Search: undefined;
};

const DateStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Date"
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}>
      <Stack.Screen
        name="Date"
        component={Date}
        initialParams={{ detailId: '-1' }}
      />
      <Stack.Screen name="Search" component={DateSearch} />
      {/* 설정, 디테일 필요하면 그것도 */}
    </Stack.Navigator>
  );
};

export default DateStack;
