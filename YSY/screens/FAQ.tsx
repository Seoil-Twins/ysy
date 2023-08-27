import React from 'react';
import { StyleSheet, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { SettingsNavType } from '../navigation/NavTypes';

import RenderHtml from '../components/RenderHtml';

import { globalStyles } from '../style/global';
import { FAQ as FAQType } from '../types/faq';

import BackHeader from '../components/BackHeader';
import CustomText from '../components/CustomText';

const FAQ = () => {
  const faq: FAQType =
    useRoute<RouteProp<SettingsNavType, 'FAQ'>>().params.info;

  return (
    <View style={globalStyles.mlmr20}>
      <BackHeader style={styles.container} />
      <CustomText size={26} weight="medium" style={styles.title}>
        {faq.title}
      </CustomText>
      <RenderHtml html={faq.contents} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
  },
  title: {
    marginBottom: 20,
  },
});

export default FAQ;
