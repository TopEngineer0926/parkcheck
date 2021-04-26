import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  Dimensions
} from 'react-native';
import { DotsLoader } from 'react-native-indicator';
import { i18n } from 'react-native-i18n-localize';
import img from '../assets/images/logo.png';
import carImg from '../assets/images/carlogo.png'
import RNExitApp from 'react-native-exit-app';
import { MyFetch } from '../fetch';


const Landing = ({ navigation }) => {

  const [loaderFlag, setLoaderFlag] = useState(true);

  const moveToLogin = (data) => {
  
    setLoaderFlag(false);
    // if (data.server == "live")
      navigation.replace('LogIn', { headerTitle: i18n.t('parkcheck')+' '+i18n.t('switzerland') });
  }

  const failedConnect = () => {
    setLoaderFlag(false);
    Alert.alert( 
      i18n.t('warn'),
      i18n.t('not_connect_server'),
      [{text: i18n.t('ok'), },]
    );
    setTimeout(() => RNExitApp.exitApp(),2000);
  }

  const checkServer = () => {

    MyFetch(10, fetch('http://150.95.129.109/wp-json/violation/live',{
      method: 'POST'
    }))
    .then((response) => response.json())
    .then((json) => { 
      moveToLogin(json); })
    .catch((error) => {
      console.log(error);
      moveToLogin(json);
      // failedConnect();
    });

  }


  useEffect(() => checkServer(), []);

  return (
    <View style={styles.main}>
      <View style={styles.contain}>
        <Image style={styles.logo} source={img} />
        <Text style={styles.logotext}>{i18n.t('parkcheck')}</Text>
        <Text style={styles.logotext}>{i18n.t('switzerland')}</Text>
      </View>
      <View style={styles.containCarImg}>
        <Image style={styles.carImg} source={carImg}></Image>
      </View>
      <View style={styles.loader}>
        {loaderFlag &&
          <DotsLoader />
        }
      </View>
    </View>

  );
}

export default Landing;


const styles = StyleSheet.create({
  main: {
    flex: 1,
    padding: 30,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  contain: {
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    resizeMode: 'contain',
    width: Dimensions.get('window').width / 4,
    height: Dimensions.get('window').width / 4
  },
  logotext: {
    fontSize: 20,
  },
  carImg: {
    resizeMode: 'contain',
    width: Dimensions.get('window').width / 1.5,
    flex: 1,
    marginTop: 40,
  },
  containCarImg: {
    width: '100%',
    height: Dimensions.get('window').width / 2,
    marginTop: 30,
    alignItems: 'center'
  },
  loader: {
    marginTop: 50,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  }
});