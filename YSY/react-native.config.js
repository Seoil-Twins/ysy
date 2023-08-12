module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts'],
  dependencies: {
    '@react-native-community/geolocation': {
      platforms: {
        android: {
          sourceDir: path.resolve(geolocationFolder, 'android'),
          folder: geolocationFolder,
          packageImportPath: 'import com.reactnativecommunity.geolocation.GeolocationPackage;',
          packageInstance: 'new GeolocationPackage()',
          buildTypes: [],
        },
      },
    },
  },
};
