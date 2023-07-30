import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';

import SearchSVG from '../assets/icons/search.svg';
import SettingSVG from '../assets/icons/settings.svg';

type SearchHeaderProps = {
  onPress: () => void;
};

const SearchHeader: React.FC<SearchHeaderProps> = ({ onPress }) => {
  const clickSearch = () => {
    onPress();
  };

  const clickSettings = () => {
    console.log('move settings');
  };

  return (
    <View style={styles.container}>
      <Pressable style={[styles.item, styles.mr15]} onPress={clickSearch}>
        <SearchSVG width={22} height={22} />
      </Pressable>
      <Pressable style={styles.item} onPress={clickSettings}>
        <SettingSVG width={25} height={25} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 48,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  item: {
    alignItems: 'center',
  },
  mr15: {
    marginRight: 15,
  },
});

export default SearchHeader;
