import React from 'react';
import { StyleSheet, View } from 'react-native';

import { globalStyles } from '../style/global';

import CustomText from '../components/CustomText';
import BackHeader from '../components/BackHeader';

const TermsOfUse = () => {
  return (
    <View style={globalStyles.mlmr20}>
      <BackHeader />
      <CustomText size={26} weight="medium" style={styles.title}>
        이용 약관
      </CustomText>
      <CustomText size={16} weight="medium" style={styles.subTitle}>
        제 1장 총칙
      </CustomText>
      <View style={styles.sentence}>
        <CustomText size={16} weight="medium">
          제 1조 (목적)
        </CustomText>
        <CustomText size={16} weight="regular">
          이 약관은 주식회사 YSY(이하 “회사”라 합니다)가 운영하는 보장분석서비
          스(TRD) “홈페이지”와 보플 “애플리케이션”(이하 “홈 페이지”와
          “애플리케이션”을 “APP”이라고 합니다) 의 서비스이용 및 제공에 관한 제반
          사항의 규정을 목적으로 합니다.
        </CustomText>
      </View>
      <View style={styles.sentence}>
        <View style={styles.oneLine}>
          <CustomText size={16} weight="medium">
            제 1조 (용어의 정의)
          </CustomText>
          <CustomText size={16} weight="regular">
            ① 이 약관에서 사용하는 용어의 정의는 다음과 같습니다.
          </CustomText>
        </View>
        <View style={styles.ul}>
          <View style={styles.ol}>
            <CustomText size={16} weight="regular">
              1. “서비스”라 함은 구현되는 PC, 모바일 기기를 통하여 “이용자”가
              이용할 수 있는 보장분석서비스 등 회사가 제공하는 제반 서비스를
              의미합니다.
            </CustomText>
            <CustomText size={16} weight="regular">
              2. “서비스”라 함은 구현되는 PC, 모바일 기기를 통하여 “이용자”가
              이용할 수 있는 보장분석서비스 등 회사가 제공하는 제반 서비스를
              의미합니다.
            </CustomText>
            <CustomText size={16} weight="regular">
              3. “서비스”라 함은 구현되는 PC, 모바일 기기를 통하여 “이용자”가
              이용할 수 있는 보장분석서비스 등 회사가 제공하는 제반 서비스를
              의미합니다.
            </CustomText>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    marginTop: 25,
    marginBottom: 20,
  },
  subTitle: {
    marginBottom: 10,
  },
  sentence: {
    marginBottom: 10,
  },
  oneLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ul: {
    flexDirection: 'row',
    marginLeft: 20,
  },
  ol: {},
});

export default TermsOfUse;
