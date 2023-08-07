import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import SettingSvg from '../assets/icons/settings.svg';
import AddSvg from '../assets/icons/add_black.svg';

type CalendarHeaderProps = {};

const CalendarHeader: React.FC<CalendarHeaderProps> = ({}) => {
  return (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity
        onPress={() => {
          console.log('addclick');
        }}>
        <AddSvg style={styles.imgBox} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {}}>
        <SettingSvg style={styles.imgBox} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  imgBox: {
    width: 48,
    height: 48,
    marginTop: 25,
  },
});

export default CalendarHeader;
