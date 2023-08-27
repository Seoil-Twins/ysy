import React from 'react';
import { Dimensions } from 'react-native';
import {
  RenderHTML,
  // defaultSystemFonts,
  StylesConfig,
} from 'react-native-render-html';

const { width } = Dimensions.get('window');
// const systemFonts = [...defaultSystemFonts, 'NotoSansKR-Regular'];
const styles: StylesConfig = {
  tagsStyles: {
    html: {
      margin: 0,
      padding: 0,
      borderWidth: 0,
    },
    body: {
      margin: 0,
      padding: 0,
      borderWidth: 0,
    },
    div: {
      margin: 0,
      padding: 0,
      borderWidth: 0,
    },
    p: {
      margin: 0,
      padding: 0,
      borderWidth: 0,
    },
  },
};

type RenderHTMLProps = {
  html: string;
};

const RenderHtml: React.FC<RenderHTMLProps> = ({ html }) => {
  return (
    <RenderHTML
      contentWidth={width}
      source={{ html }}
      // baseStyle={{ fontFamily: 'NotoSansKR-Regular' }}
      // systemFonts={systemFonts}
      tagsStyles={styles.tagsStyles}
      enableCSSInlineProcessing={true}
    />
  );
};

export default RenderHtml;
