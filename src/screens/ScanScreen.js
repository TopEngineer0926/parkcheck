import React, { useState, useRef } from 'react'
import { StyleSheet, View, Alert } from 'react-native'
import { RNCamera } from 'react-native-camera'
import { useNavigationState } from '@react-navigation/native';
import { i18n } from 'react-native-i18n-localize';
import { BubblesLoader } from 'react-native-indicator';
import { MyFetch } from '../fetch';

var alertFlag = false;

const Scanscreen = ({ navigation, route }) => {


  const routesName = useNavigationState(state => state.routes[state.index].name)
  const [barcodes, setBarcodes] = useState([])
  const cameraRef = useRef(null)
  const [loading, setLoading] = useState(false);

  const barcodeRecognized = ({ barcodes }) => {
    console.log('barcodes')
    setBarcodes(barcodes)
  }

  const renderBarcodes = () => <View>{barcodes.map(renderBarcode)}</View>

  const gotoUpdate = (data) => {

    navigation.replace('CreateViolation',
      {
        headerTitle: i18n.t('update_violation'),
        type: 'update',
        autoID: data.ID,
        triggerName: data.trigger,//ios-diff-2
        locationName: data.location,
        customerID: route.params.customerID,
        clerk: route.params.clerk,
      }
    );

    alertFlag = false;
  }

  const checkExist = (data) => {
    setLoading(false);

    if (data.live == 'exist')
      gotoUpdate(data);
    else if (data.live == 'no')
      Alert.alert(
        i18n.t('warn'),
        i18n.t('not_exist'),
        [{ text: i18n.t('ok'), onPress: () => alertFlag = false },]
      );

  }

  const failedConnect = () => {
    setLoading(false);
    alertFlag = false;
    Alert.alert(
      i18n.t('warn'),
      i18n.t('not_connect_server'),
      [{ text: i18n.t('ok'), },]
    );
  }

  const checkVioInfo = (vioID) => {

    setLoading(true);

    const formData = new FormData();
    formData.append('scannedID', vioID);
    formData.append('customerID', route.params.customerID);

    MyFetch(25, fetch('http://150.95.129.109/wp-json/violation/update', {
      method: 'POST',
      body: formData
    }))
      .then((response) => response.json())
      .then((json) => { checkExist(json); })
      .catch((error) => {
        console.log(error);
        failedConnect();
      })


  }

  const renderBarcode = ( data ) => {

    if (alertFlag == false) {
      let first = data.indexOf('00000000');

      if (first > 0) {
        let vioID = data.substring(first + 7, first + 20);
        alertFlag = true;
        Alert.alert(
          i18n.t('scanned_data'),
          'ID: ' + vioID,
          [
            {
              text: i18n.t('cancel'),
              onPress: () => { alertFlag = false },
              style: 'cancel'
            },
            {
              text: i18n.t('ok'),
              onPress: () => checkVioInfo(vioID),
              style: 'cancel'
            }
          ],
          { cancelable: false }
        );
      }
     
    }
  }

  const camera = (
    <RNCamera
      ref={cameraRef}
      style={styles.scanner}
      captureAudio={false}
      onBarCodeRead={(barcode) => renderBarcode(barcode.data)}
      >
    </RNCamera>
  );

  return (
    <View style={styles.container}>
      {(routesName == "Scanscreen") && camera}
      {loading &&
        <View style={styles.loading}>
          <BubblesLoader />
        </View>
      }
    </View>
  )

}

export default Scanscreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black'
  },
  scanner: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(97, 97, 97, 0.2)'
  }
})