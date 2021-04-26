import { Platform } from 'react-native';
const RNFS = require('react-native-fs');

export const dirHome = Platform.select({
  ios: `${RNFS.DocumentDirectoryPath}/Pictures/violations`,
  android: `${RNFS.ExternalStorageDirectoryPath}/Pictures/violations`
});

export const dirPictures = `${dirHome}`;
export const dirAudio = `${dirHome}/Audio`;