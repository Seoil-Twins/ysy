import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
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
              <BCheckSvg style={{ marginRight: 7 }} />
            ) : (
              <UCheckSvg style={{ marginRight: 7 }} />
            )}
            <Text
              style={{
                color: numSelected > 0 ? '#3675FB' : '#999999',
                marginRight: 20,
                marginTop: 15,
                marginBottom: 15,
              }}>
              {numSelected > 0 ? '선택 해제' : '모두 선택'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  } else {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          onPress={() => {
            openSortModal();
          }}>
          <SortSvg
            style={{ marginTop: 40, marginBottom: 15, marginRight: 5 }}
            height={50}
            width={50}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <SettingSvg
            style={{ marginTop: 10, marginBottom: 15, marginRight: 20 }}
            width={30}
            height={30}
          />
        </TouchableOpacity>
      </View>
    );
  }
};

export default RenderAlbumHeader;
