import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useAppSelector } from '../redux/hooks';
import { RootState } from '../redux/store';

import SettingSvg from '../assets/icons/settings.svg';
import SortSvg from '../assets/icons/sort.svg';
import BCheckSvg from '../assets/icons/check.svg';
import UCheckSvg from '../assets/icons/un-check.svg';

type RenderAlbumHeaderProps = {
  selectedAlbums: string[];
  handleSelectAll: () => void;
  openSortModal: () => void;
};

const RenderAlbumHeader: React.FC<RenderAlbumHeaderProps> = ({
  selectedAlbums,
  handleSelectAll,
  openSortModal,
}) => {
    const isAlbum = useAppSelector(
        (state: RootState) => state.albumStatus.isAlbum,
      );

if (isAlbum) {
    const numSelected = selectedAlbums.length;
    return (
        <View>
        <TouchableOpacity onPress={handleSelectAll}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {numSelected > 0 ? (
                <BCheckSvg style={{ marginRight: 5 }} />
            ) : (
                <UCheckSvg style={{ marginRight: 5 }} />
            )}
            <Text
                style={{
                color: numSelected > 0 ? '#3675FB' : '#999999',
                marginRight: 15,
                }}>
                {numSelected > 0 ? '선택 해제' : '모두 선택'}
            </Text>
            </View>
        </TouchableOpacity>
        </View>
    );
    } else {
    return (
        <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
            onPress={() => {
            openSortModal();
            }}>
            <SortSvg style={styles.imgBox} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
            <SettingSvg style={styles.imgBox} />
        </TouchableOpacity>
        </View>
    );
}   
};

const styles = StyleSheet.create({
  imgBox: {
    width: 48,
    height: 48,
    marginTop: 25,
  },
});

export default RenderAlbumHeader;
