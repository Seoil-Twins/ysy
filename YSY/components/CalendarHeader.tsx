import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import SettingSvg from '../assets/icons/settings.svg';
import AddSvg from '../assets/icons/add_black.svg';

type CalendarHeaderProps = {
  openAddModal: () => void;
};

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ openAddModal }) => {
  return (
    <View style={{ flexDirection: 'row', height: 48 }}>
      <TouchableOpacity onPress={openAddModal}>
        <AddSvg style={{ marginTop: 15 }} height={20} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {}}>
        <SettingSvg style={{ marginTop: 15 }} height={20} />
      </TouchableOpacity>
    </View>
  );
};

export default CalendarHeader;
