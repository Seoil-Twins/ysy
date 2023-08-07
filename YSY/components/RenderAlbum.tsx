import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image, Text } from 'react-native';
import { useAppSelector } from '../redux/hooks';
import { RootState } from '../redux/store';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

import WCheckBigSvg from '../assets/icons/white_check_big.svg';
import WCheckSvg from '../assets/icons/white_check.svg';

const screenWidth = wp('100%');

type RenderImageProps = {
  selectedAlbums : string[];
  item: string;
  handleAlbumPress: (albumName: string) => void;
  handleLongPress: () => void;
};

const RenderImage: React.FC<RenderImageProps> = ({
  selectedAlbums,
  item,
  handleAlbumPress,
  handleLongPress,
}) => {
  const isSelected = selectedAlbums.includes(item);
  const isAlbum = useAppSelector(
      (state: RootState) => state.albumStatus.isAlbum,
    );  


return (
    <View style={{ flex: 1, paddingTop: 5, alignItems: 'center' }}>
    <TouchableOpacity
        style={{ flex: 1, paddingTop: 5, alignItems: 'center' }}
        onPress={() => handleAlbumPress(item)}
        onLongPress={() => handleLongPress()}>
        <Image
        source={{ uri: item }}
        style={{ width: screenWidth, height: 200 }}
        />
        <View style={{ position: 'absolute', bottom: 0, left: 0 }}>
        <Text style={styles.albumTextLeftTitle}>앨범 이름</Text>
        <Text style={styles.albumTextLeft}>(개수)</Text>
        </View>
        <View style={{ position: 'absolute', bottom: 0, right: 0 }}>
        <Text style={styles.albumTextRight}>2023-07-18</Text>
        </View>
        {isAlbum && (
        <View
            style={
            isSelected ? styles.checkedCircle : styles.unCheckedCircle
            }>
            <Text>
            {isSelected ? <WCheckSvg style={styles.checked} /> : ''}
            </Text>
        </View>
        )}
    </TouchableOpacity>
    </View>
);
};

const styles = StyleSheet.create({
  checkedCircle: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#3675FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginRight: 20,
  },
  unCheckedCircle: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#FFFFFF99',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginRight: 20,
  },
  checked: {
    width: 48,
    height: 48,
  },
  albumTextLeftTitle: {
    color: 'white',
    fontSize: 18,
    paddingLeft: 15,
    fontWeight: 'bold',
  },

  albumTextLeft: {
    color: 'white',
    fontSize: 14,
    paddingBottom: 15,
    paddingLeft: 15,
  },

  albumTextRight: {
    color: 'white',
    fontSize: 14,
    paddingBottom: 15,
    paddingRight: 15,
  },
});

export default RenderImage;