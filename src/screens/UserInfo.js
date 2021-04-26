import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from '@react-native-community/geolocation';
import { i18n } from 'react-native-i18n-localize';
import { BubblesLoader } from 'react-native-indicator';
import Icon from 'react-native-vector-icons/FontAwesome';
import { MyFetch } from '../fetch';

const UserInfo = ({ navigation, route }) => {


  const [gps_status_lati, setGpsStatusLati] = useState('');
  const [gps_status_long, setGpsStatusLong] = useState('');
  const [loading, setLoading] = useState(false);

  const gpsTest = () => {

    Geolocation.getCurrentPosition(
      position => {
        const location = position;

        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        let la_direction, lo_direction;
        let degree, minute, second;
        if (latitude > 0)
          la_direction = 'N'
        else {
          la_direction = 'S';
          latitude = -latitude;
        }

        if (longitude > 0)
          lo_direction = 'E'
        else {
          lo_direction = 'W'
          longitude = -longitude;
        }

        degree = Math.floor(latitude);
        latitude = (latitude - degree) * 60;
        minute = Math.floor(latitude);
        second = Math.floor((latitude - minute) * 60000) / 1000;
        latitude = degree + "°" + minute + "'" + second + '"';

        degree = Math.floor(longitude);
        longitude = (longitude - degree) * 60;
        minute = Math.floor(longitude);
        second = Math.floor((longitude - minute) * 60000) / 1000;
        longitude = degree + "°" + minute + "'" + second + '"';

        const result = latitude + la_direction + '\n' + longitude + lo_direction;
        setGpsStatusLati(latitude + la_direction);
        setGpsStatusLong(longitude + lo_direction);

      },
      error => {setGpsStatusLati(i18n.t('no_connect_gps'));setGpsStatusLong('')},
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 1000 }
    );
  }

  const gotoCreate = (data) => {
    setLoading(false);
    navigation.navigate('CreateViolation',
      {
        headerTitle: i18n.t('create_violation'),
        type: 'create',
        autoID: data.autoID,
        triggers: data.triggers,
        locations: data.locations,
        customerID: route.params.customerID,
        clerk: route.params.clerk
      }
    );
  }

  const gotoScan = () => {
    navigation.navigate('Scanscreen',
      {
        customerID: route.params.customerID,
        clerk: route.params.clerk
      })
  }

  const failedConnect = () => {
    setLoading(false);

    Alert.alert(
      i18n.t('warn'),
      i18n.t('not_connect_server'),
      [{ text: i18n.t('ok'), },]
    );
  }

  const CreateViolation = () => {

    setLoading(true);

    const formData = new FormData();
    formData.append('customerID', route.params.customerID);
    formData.append('clerk', route.params.clerk);

    MyFetch(25, fetch('http://150.95.129.109/wp-json/violation/create', {
      method: 'POST',
      body: formData
    })).then((response) => response.json())
      .then((json) => { gotoCreate(json); })
      .catch((error) => {
        console.log(error);
        failedConnect();
      })

  }

  useEffect(() => gpsTest());

  return (
    <View style={styles.main}>
      <View style={styles.topPart}>
        <View style={styles.title}>
          <Text style={styles.maintitle}>
            {i18n.t('parkcheck')}{' '}{i18n.t('switzerland')}
          </Text>
          <Text style={styles.maintitle}>
            {i18n.t('parking_administration')}
          </Text>
        </View>
        <View style={styles.userinfo}>
          <View style={styles.infoitem}>
            <Text style={styles.infoTitle}>
              {i18n.t('customer_id')}:
              </Text>
            <Text style={styles.infotext}>
              {route.params.customerID}
            </Text>
          </View>
          <View style={styles.infoitem}>
            <Text style={styles.infoTitle}>
              {i18n.t('cleark')}:
              </Text>
            <Text style={styles.infotext}>
              {route.params.clerk}
            </Text>
          </View>
          <View style={styles.infoitem}>
            <Text style={styles.infoTitle}>
              {i18n.t('gps')}:
              </Text>
            <View>
              <Text style={styles.gpsText}>{gps_status_lati}</Text>
              <Text style={styles.gpsText}>{gps_status_long}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.button_item_create}
          activeOpacity={.5}
          onPress={() => CreateViolation()}>
          <LinearGradient start={{ x: 0, y: 0.75 }} end={{ x: 1, y: 0.25 }} colors={['#2974FA', '#2974FA', '#2974FA']} style={styles.gradient}>
            <Text style={styles.text}>{i18n.t('create_violation')}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button_item_create}
          activeOpacity={.5}
          onPress={() => gotoScan()}
        >
          <LinearGradient start={{ x: 0, y: 0.75 }} end={{ x: 1, y: 0.25 }} colors={['#2974FA', '#2974FA', '#2974FA']} style={styles.gradient}>
            <Text style={styles.text}>{i18n.t('qr_code_scan')}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button_item_create}
          activeOpacity={.5}
          onPress={() => navigation.navigate('History', { headerTitle: i18n.t('history'), clerk: route.params.clerk })}
        >
          <LinearGradient start={{ x: 0, y: 0.75 }} end={{ x: 1, y: 0.25 }} colors={['#2974FA', '#2974FA', '#2974FA']} style={styles.gradient}>
            <Text style={styles.text}>{i18n.t('vio_history')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      {loading &&
        <View style={styles.loading}>
          <BubblesLoader />
        </View>
      }
    </View>
  );
}

export default UserInfo;


const styles = StyleSheet.create({
  main: {
    flex: 1,
    padding: 30,
    flexDirection: 'column',
    justifyContent: 'center'
  },
  topPart: {
    flex: 3,
    position: 'relative'
  },
  buttonGroup: {
    flex: 1.7,
    alignItems: 'center'
  },
  button_item_create: {
    height: 50,
    width: '90%',
    shadowColor: '#ccc',
    marginBottom: 15
  },
  button_item_out: {
    height: 50,
    width: '50%',
    shadowColor: '#ccc',
    marginBottom: 10
  },
  text: {
    color: 'white',
    fontSize: 23
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    height: '100%'
  },
  title: {
    alignItems: 'center',
    marginTop: 15
  },
  maintitle: {
    fontSize: 25
  },
  userinfo: {
    marginTop: 50
  },
  infoitem: {
    display: 'flex',
    flexDirection: 'row'
  },
  infotext: {
    fontSize: 20,
    width: '55%'
  },
  gpsText: {
    fontSize: 20,
    textAlign: 'right'
  },  
  infoTitle: {
    width: '45%',
    fontSize: 20
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
  },
  iconHistory: {
    position: 'absolute',
    right: 0,
    top: 0
  }

});


