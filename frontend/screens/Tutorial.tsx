import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import AppIntroSlider from "react-native-app-intro-slider";

import FirstTutorialSVG from "../assets/icons/tutorial_love.svg";
import SecondTutorialSVG from "../assets/icons/tutorial_album.svg";
import ThirdTutorialSVG from "../assets/icons/tutorial_place.svg";
import CustomText from "../components/CustomText";

const slides = [
  {
    key: "first",
    title: "애인과 함께",
    contents: ["YSY를 사용하여 애인과 함께", "앨범, 일정, 데이트 장소를 공유하고", "이야기 해보세요!"],
    image: FirstTutorialSVG
  },
  {
    key: "second",
    title: "앨범 공유",
    contents: ["공용 앨범 기능을 사용하여", "서로의 추억을 남기고 공유해보세요!"],
    image: SecondTutorialSVG
  },
  {
    key: "third",
    title: "데이트 장소",
    contents: ["추천 데이트 장소를 제공합니다.", "같은 데이트 장소를 가는 것보단 한 번", "둘러봐서 새로운 데이트 장소를 확인하세요!"],
    image: ThirdTutorialSVG
  }
];

type Item = (typeof slides)[0];

const Tutorial = () => {
  let slider: AppIntroSlider | undefined;

  const onPressStartBtn = () => {
    console.log("Open Modal!");
  };

  const renderItem = ({ item }: { item: Item }) => {
    return (
      <View style={styles.container}>
        <item.image style={styles.img}></item.image>
        <View>
          <CustomText size={36} weight="medium" color="#527BD2" style={[styles.title, styles.textCenter]}>
            {item.title}
          </CustomText>
          <View>
            {item.contents.map((content: string, idx: number) => (
              <CustomText size={18} weight="regular" style={styles.textCenter} key={idx}>
                {content}
              </CustomText>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderPagination = (activeIndex: number) => {
    return (
      <View>
        {activeIndex === 2 ? (
          <TouchableOpacity style={styles.startBtn} onPress={onPressStartBtn}>
            <CustomText size={24} weight="medium" color="#FFFFFF" style={{ textAlign: "center" }}>
              시작하기
            </CustomText>
          </TouchableOpacity>
        ) : (
          <View style={styles.dotBox}>
            {slides.length > 1 &&
              slides.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.dot, i === activeIndex ? styles.active : styles.noone, styles.mr15]}
                  onPress={() => slider?.goToSlide(i, true)}
                />
              ))}
          </View>
        )}
      </View>
    );
  };

  return <AppIntroSlider renderItem={renderItem} renderPagination={renderPagination} data={slides} ref={(ref) => (slider = ref!)}></AppIntroSlider>;
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  img: {
    width: 155,
    height: 155,
    marginBottom: 70
  },
  title: {
    marginBottom: 10
  },
  textCenter: {
    textAlign: "center"
  },
  dotBox: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 48,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  mr15: {
    marginRight: 15
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 14 / 2
  },
  active: {
    backgroundColor: "#5A8FFF"
  },
  noone: {
    backgroundColor: "#DDDDDD"
  },
  startBtn: {
    width: 320,
    height: 52,
    bottom: 48,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#3675FB",
    borderRadius: 10
  }
});

export default Tutorial;
