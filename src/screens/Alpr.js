import React, { useState, useRef, useEffect } from 'react'
import { i18n } from 'react-native-i18n-localize';
import { useNavigationState } from '@react-navigation/native';
import { TouchableOpacity, StyleSheet, Text, Dimensions, View, Alert, Platform,PermissionsAndroid } from 'react-native';
import { RNCamera } from 'react-native-camera';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import Marker from 'react-native-image-marker'
import { dirPictures } from '../storage/dirStorage';
const moment = require('moment');


let alertFlag = true;

const Alpr = ({ navigation, route }) => {

  const [detectedText, setDetectedText] = useState([]);
  const [hintNumber, setHintNumber] = useState('');
  const cameraRef = useRef(null);
  const routesName = useNavigationState(state => state.routes[state.index].name);

  const licList = [
    'ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL', 'ZG', 'FR', 'SO', 'BS', 'BL', 'SH', 'AR', 'AI', 'SG', 'GR', 'AG', 'TG', 'TI', 'VD', 'VS', 'NE', 'GE', 'JU'
  ];

  let count = 0;

  const failedToSaveImage = () => {
    Alert.alert(
      i18n.t('warn'),
      i18n.t('failed_save_picture'),
      [
        {
          text: i18n.t('ignore'),
          onPress: () => {
            navigation.navigate('CreateViolation', { scanned_licplate: hintNumber, alprImage: 'empty' });
            alertFlag = true;
          },
          // style: 'ignore'
        },
        {
          text: i18n.t('try_again'),
          onPress: () => { alertFlag = true; }
        }
      ]
    );
  }

  const setLicPlate = async () => {

    alertFlag = false;

    if (cameraRef) {


      if (hintNumber == '') {
        Alert.alert(
          i18n.t('warn'),
          i18n.t('no_licplate'),
          [{ text: i18n.t('ok'), },]
        );
      }
      else {

        const options = { quality: 0.5, base64: true };
        const data = await cameraRef.current.takePictureAsync(options);

        const newImageName = `${moment().format('DDMMYY_HHmmSSS')}.jpg`;
        const newFilepath = 'file://' + `${dirPictures}/${newImageName}`;

        ImageResizer.createResizedImage('data:image/jpeg;base64,' + data.base64, 1000, 1300, 'JPEG', 60, 90)
          .then(response => {

            let markText = `${moment().format('DD.MM.YYYY HH:mm:ss')}` + ' ' + route.params.gpsText;
            Marker.markText({
              src: (Platform.OS === 'android' ? 'file://' + response.path : response.path),
              text: markText,
              X: 10,
              Y: 10,
              color: '#fff',
              fontName: 'Arial-BoldItalicMT',
              fontSize: 15,
              scale: 1,
              quality: 100,
              textBackgroundStyle: {
                type: 'default',
                paddingX: 10,
                paddingY: 10,
                color: '#999'
              }
            }).then((res) => {
              
              RNFS.moveFile((Platform.OS === 'android' ? 'file://' + res : res), newFilepath);
              RNFS.scanFile(newFilepath);

              navigation.navigate('CreateViolation', { scanned_licplate: hintNumber, alprImage: newFilepath });
              alertFlag = true;
              console.log(newFilepath)
            }).catch((err) => {
              failedToSaveImage()
              console.log('error 1 ===  ',err);
            })
          })
          .catch(err => {
            failedToSaveImage()
            console.log('error 2 ===  ',err);
          });

      }

    }

  };


  const recognizeNumber = (block) => {


    count++;
    if (count == 4 && alertFlag) {
      setDetectedText(block);
      showHint();
      count = 0;
    }


  }

  const showHint = () => {
    if (detectedText != null) {


      for (let i = 0; i < detectedText.length; i++) {

        const regex = /[A-Z]{2}[ ]{0,1}[-]{0,1}[0-9]{1,7}/g;
        const found = detectedText[i].value.match(regex);

        if (found != null) {
          let tempLic = found[0].split(" ").join("");
          let Lic = tempLic.split("-").join("");

          let exist = false;
          licList.map(item => {
            if (Lic.indexOf(item) >= 0)
              exist = true;
          });

          if (exist)
            setHintNumber(Lic);
          break;
        }

      }
    }
  }


  useEffect(
    () => navigation.addListener('focus', () =>
      {alertFlag = true;
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);}
    ),
    []
  );

  const cameraContent = (
    <RNCamera
      ref={cameraRef}
      style={styles.preview}
      captureAudio={false}
      onTextRecognized={(text) => recognizeNumber(text.textBlocks)}
    >
      <View style={styles.maskOutter}>
        <View style={[{ flex: maskRowHeight }, styles.maskRow, styles.maskFrame]} />
        <View style={[{ flex: 30 }, styles.maskCenter]}>
          <View style={[{ width: maskColWidth }, styles.maskFrame]} />
          <View style={styles.maskInner} />
          <View style={[{ width: maskColWidth }, styles.maskFrame]} />
        </View>
        <View style={[{ flex: maskRowHeight }, styles.maskRow, styles.maskFrame]} />
      </View>
      <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center', backgroundColor: 'transparent' }}>
        <TouchableOpacity style={styles.capture} 
        onPress={setLicPlate}
        >
          <Text style={{ fontSize: 14 }}> {i18n.t('confirm')} </Text>
        </TouchableOpacity>
      </View>
    </RNCamera>
  );

  return (
    <View style={styles.container}>
      {(routesName == "Alpr") && cameraContent}

      <View style={styles.hintContain}>
        <Text style={styles.hint}>
          {i18n.t('scanned_data')}:  {hintNumber}
        </Text>
      </View>


    </View>
  );


}

export default Alpr;

const { height, width } = Dimensions.get('window');
const maskRowHeight = Math.round((height - 300) / 20);
const maskColWidth = (width - 300) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
    position: 'relative'
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginBottom: 30,
  },
  hint: {
    fontSize: 20,
    color: '#fff',
    width: '100%',
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    textAlign: 'center',
  },
  hintContain: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    backgroundColor: "#126FEA",
    textAlign: "center",
    display: "flex",
    height: 70,
    display: 'flex',
    alignItems: 'center',
    justifyContent: "center"
  },
  maskOutter: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  maskInner: {
    width: (width - 40),
    backgroundColor: 'transparent',
    borderColor: 'white',
    borderWidth: 1,
  },
  maskFrame: {
    backgroundColor: 'rgba(1,1,1,0.6)',
  },
  maskRow: {
    width: '100%',
  },
  maskCenter: { flexDirection: 'row' },
});