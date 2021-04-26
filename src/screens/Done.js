import React,{useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView
  } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { i18n } from 'react-native-i18n-localize';

const Done = ({ navigation, route}) => {

  const imageCount = route.params.info_image_count;
  const [transferTime, setTransferTime] = useState(1);
  const [result, setResult] = useState(true);

  const moveBack = () => {
    setResult(route.params.result);
    setTransferTime(route.params.transferTime);
    setTimeout(() => navigation.popToTop(),5000);
  }
  useEffect(() => moveBack(),[]);

  return (
    <ScrollView>
    <View style={styles.main}>
      <View style={styles.top}>
        <Icon name="send-o" size={20} color="#126FEA" style={styles.iconSend}/>
        <Text style={styles.topText}>
          {i18n.t('sending')}: {result? i18n.t('successful') : i18n.t('failed')}
        </Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.common}>
          {i18n.t('id')}: {route.params.info_autoID}
        </Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.common}>
          {i18n.t('date')}: {route.params.info_date}
        </Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.common}>
          {i18n.t('license_plate')}: {route.params.info_licplate}
        </Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.common}>
          {i18n.t('trigger')}: {route.params.info_trigger}
        </Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.common}>
          {i18n.t('location')}: {route.params.info_location}
        </Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.common}>
          {i18n.t('gps')}: {route.params.info_gps}
        </Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.common}>
          {i18n.t('from')}: {route.params.info_time_from}
        </Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.common}>
          {i18n.t('to')}: {route.params.info_time_to}
        </Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.common}>
          {i18n.t('total')}: {imageCount} { imageCount > 1 ? i18n.t('images') : i18n.t('image')} {i18n.t('uploaded')}
        </Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.common}>
          {i18n.t('transfer_time')}: {transferTime} s
        </Text>
      </View>
    </View>
    </ScrollView>
  );
}

export default Done;


const styles = StyleSheet.create({
    main: {
      flex: 1,
      padding: 30,
      flexDirection: 'column',
      justifyContent: 'center'
    },
    common: {
      fontSize: 21
    },
    topText: {
      fontSize: 26
    },
    top: {
      marginTop: 40,
      marginBottom: 30,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center'
    },
    item: {
      borderBottomColor: 'black',
      borderBottomWidth: 0.6,
      display: 'flex',
      flexDirection: 'row',
      marginBottom: 10,
      paddingBottom: 5
    },
    iconSend: {
      marginRight: 10
    }
    
  });