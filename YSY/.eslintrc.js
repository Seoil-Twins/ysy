module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    'react/no-unstable-nested-components': 'off',
    'react-native/no-inline-styles': 'off',
  },
};