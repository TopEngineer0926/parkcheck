import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  Platform,
  Alert,
  PermissionsAndroid
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { Input } from 'react-native-elements'
import Geolocation from '@react-native-community/geolocation';
import MyDatePicker from '../components/mDatePicker';
import MyTimePicker from '../components/mTimePicker';
import MPicker from '../components/mPicker';
import Overlay from 'react-native-modal-overlay';
import Icon from 'react-native-vector-icons/FontAwesome';
import EIcon from 'react-native-vector-icons/Entypo'
import LinearGradient from 'react-native-linear-gradient';
import { i18n } from 'react-native-i18n-localize';
import RNFS from 'react-native-fs';
import Marker from 'react-native-image-marker'
import { BubblesLoader } from 'react-native-indicator';
import DefaultImg from '../assets/images/default.png';
import { MyFetch } from '../fetch';

var startTime;

const CreateViolation = ({ navigation, route }) => {


  let pictureDefault = { uri: Image.resolveAssetSource(DefaultImg).uri };
  let pictureInitData = [pictureDefault, pictureDefault, pictureDefault];
  let exist_init = [false, false, false];

  const [autoID, setID] = useState('');
  const [selected_date, onDatechange] = useState('');
  const [selected_time_from, onTimeChangeFrom] = useState('');
  const [selected_time_to, onTimeChangeTo] = useState('');
  const [selected_trigger, onTriggerChange] = useState('');
  const [selected_location, onLocationChange] = useState('');
  const [selected_licplate, setLicPlate] = useState('');
  const [gpsInfo, setGpsInfo] = useState(''); //gps

  const [picture_data, setPictureData] = useState(pictureInitData);
  const moment = require('moment');
  const [loading, setLoading] = useState(false);
  const [index_photo, setIndexPhoto] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [photo_exist, setPhotoExist] = useState(exist_init);
  const [photo_delete, setPhotoDelete] = useState(exist_init);
  const [alpr_image, setAlprImage] = useState('empty');//ios-diff
  const [triggerName, setTriggerName] = useState('');//ios-diff-2
  const [locationName, setLocationName] = useState('');
  const [arr_trigger, setTriggers] = useState(null);
  const [arr_location, setLocations] = useState(null);


  const licList = [
    'ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL', 'ZG', 'FR', 'SO', 'BS', 'BL', 'SH', 'AR', 'AI', 'SG', 'GR', 'AG', 'TG', 'TI', 'VD', 'VS', 'NE', 'GE', 'JU'
  ];  //ios-diff


  const getImageCount = () => {
    let count = 0;
    photo_exist.map(item => {
      if (item == true)
        count++;
    })
    return count;
  }

  const gotoDone = (data) => {
    setLoading(false);
    if (data.result == "success") {
      moveToDone(data, true);
    }
    else {
      moveToDone(data, false);
    }

  }

  const failedConnect = () => {
    setLoading(false);

    Alert.alert(
      i18n.t('warn'),
      i18n.t('not_connect_server'),
      [{ text: i18n.t('ok'), },]
    );
  }

  const moveToDone = (data, result) => {

    let endTime = new Date().getTime();
    let period = Math.round((endTime - startTime) / 1000);
    let locationLabel;
    let triggerLabel;
    if(route.params.type == 'create'){//ios-diff-2
      arr_location.map(item => {
        if (item.value == selected_location)
          locationLabel = item.label;
      });
      arr_trigger.map(item => {
        if (item.value == selected_trigger)
          triggerLabel = item.label;
      });
    }
    if(route.params.type == 'update'){//ios-diff-2
          locationLabel = locationName;
          triggerLabel = triggerName;  

          
    }
    
    navigation.navigate('Done', {
      info_autoID: data.username,
      info_date: selected_date,
      info_licplate: selected_licplate,
      info_trigger: triggerLabel,
      info_location: locationLabel,
      info_gps: gpsInfo,
      info_time_from: selected_time_from,
      info_time_to: selected_time_to,
      info_image_count: getImageCount() + (alpr_image == 'empty' ? 0 : 1),//ios-diff-2
      headerTitle: i18n.t('result'),
      result: result,
      transferTime: period,
      customerID: route.params.customerID,
      clerk: route.params.clerk
    })
  }

  const sendPrev = () => {

    if (!selected_licplate)
      Alert.alert(
        i18n.t('warn'),
        i18n.t('fill_licplate'),
        [{ text: i18n.t('ok'), },]
      );
    else {
      let uppercase = selected_licplate.toUpperCase();
      let minus = uppercase.split("-").join("");
      let cutted = minus.split(" ").join("");

      let exist = false;//ios-diff
      licList.map(item => {
        if (cutted.indexOf(item) >= 0)
          exist = true;
      });

      let regex = /[A-Z]{2}[ ]{0,1}[-]{0,1}[1-9]{1}[0-9]{0,6}/g;
      let found = cutted.match(regex);
      if (found != null && found[0] == cutted && exist) {
        send(found[0]);
      }
      else {
        Alert.alert(
          i18n.t('warn'),
          i18n.t('wrong_type') + ' ' + i18n.t('lic_example'),
          [{ text: i18n.t('ok'), },]
        );
      }

    }
  }

  const send = (licPlate) => {

    startTime = new Date().getTime();

    const formData = new FormData();


    formData.append('makeTime', moment().format('YYYY-MM-DD HH:mm:ss'));
    formData.append('customerID', route.params.customerID);
    formData.append('clerk', route.params.clerk);
    formData.append('type', 'send');
    formData.append('info_autoID', autoID);
    formData.append('info_date', selected_date.split('.').reverse().join(''));
    formData.append('info_licplate', licPlate);
    formData.append('info_trigger', selected_trigger);
    formData.append('info_location', selected_location);
    formData.append('info_gps', gpsInfo);
    formData.append('info_time_from', selected_time_from);
    formData.append('info_time_to', selected_time_to);
    formData.append('info_image_count', getImageCount() + (alpr_image == 'empty' ? 0 : 1));//ios-diff


    let imgIndex = 0;
    photo_exist.map((item, index) => {
      if (item == true) {

        //getting image extension
        let filename = picture_data[index].path;
        let ext = filename.split('.').pop();
        //add photo

        formData.append('photo' + imgIndex, {
          uri: Platform.OS === 'android' ? 'file://' + picture_data[index].path : picture_data[index].path,
          name: licPlate + '_' + imgIndex + '_' + selected_date + '.' + ext,
          type: picture_data[index].type
        });

        imgIndex++;
      }

    });
    console.log('alpr image ==   ', alpr_image);
    //ios-diff
    if (alpr_image != 'empty') {
      let filename = alpr_image;
      let ext = filename.split('.').pop();

      formData.append('photo' + getImageCount(), {
        uri: alpr_image,
        name: licPlate + '_' + getImageCount() + '_' + selected_date + '.' + ext,
        type: 'image/' + ext
      });
    }

    console.log('giant    ', formData);
    console.log('alpr image ==   ', alpr_image);

    ///////////////////////////////////////////////
    let api_url;
    if (route.params.type == 'create')
      api_url = 'http://150.95.129.109/wp-json/violation/upload-create';
    else if (route.params.type == 'update') {
      api_url = 'http://150.95.129.109/wp-json/violation/upload-update';
    }

    setLoading(true);

    MyFetch(60, fetch(api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData
    }))
      .then((response) => response.json())
      .then((json) => { gotoDone(json); })
      .catch((error) => {
        console.log(error);
        failedConnect();
      })

  }

  const alpr = () => {
    navigation.navigate('Alpr', { gpsText: gpsInfo });//ios-diff
  }

  const findCoordinates = () => {
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


        const result = latitude + la_direction + ' ' + longitude + lo_direction
        setGpsInfo(result);
      },
      error => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const launchCamera = (index) => {
    let options = {
      storageOptions: {
        skipBackup: false,
        path: 'violations',
      },
      maxWidth: 700,//ios-diff
      maxHeight: 1500,
      quality: 1.0
    };
    ImagePicker.launchCamera(options, (response) => {

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
        alert(response.customButton);
      } else {
        
        let newImageName = `${moment().format('DD.MM.YYYY HH:mm:ss')}`;
        Marker.markText({
          src: (Platform.OS === 'android' ? 'file://' + response.path : response.path),
          text: newImageName + '  ' + gpsInfo,
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
          let temp = picture_data;
          temp[index] = response;
          setPictureData([...temp]);
          let exist = photo_exist;
          exist[index] = true;
          setPhotoExist([...exist]);

          let deleteItems = photo_delete;
          deleteItems[index] = false;
          setPhotoDelete([...deleteItems]);

          RNFS.moveFile((Platform.OS === 'android' ? 'file://' + res : res), (Platform.OS === 'android' ? 'file://' + response.path : response.path));

        }).catch((err) => {
          console.log(err)
        })
      }
    });

  }

  const launchImageLibrary = (index) => {
    let options = {
      storageOptions: {
        skipBackup: true,
        path: 'violations',
      },
      maxWidth: 700,//ios-diff
      maxHeight: 1500,
      quality: 1.0
    };
    ImagePicker.launchImageLibrary(options, (response) => {

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
        alert(response.customButton);
      } else {
        let temp = picture_data;
        temp[index] = response;
        setPictureData([...temp]);

        let exist = photo_exist;
        exist[index] = true;
        setPhotoExist([...exist]);

        let deleteItems = photo_delete;
        deleteItems[index] = true;
        setPhotoDelete([...deleteItems]);

      }
    });

  }

  const removePicture = (index) => {
    let temp = picture_data;
    temp[index] = pictureDefault;
    setPictureData([...temp]);
    let exist = photo_exist;
    exist[index] = false;
    setPhotoExist([...exist]);
    let deleteItems = photo_delete;
    deleteItems[index] = false;
    setPhotoDelete([...deleteItems]);
  }

  const addIcon = (index) => <EIcon onPress={() => { setModalOpen(true); setIndexPhoto(index) }} name="circle-with-plus" size={28} color="black" style={{ borderRadius: 14, backgroundColor: 'white', position: 'absolute', right: -13, top: -13 }} />;

  const crossIcon = (index) => <EIcon onPress={() => removePicture(index)} name="circle-with-cross" size={28} color="black" style={{ position: 'absolute', right: -13, top: -13 }} />;

  useEffect(() => {
    findCoordinates();
    setID(route.params.autoID);
    if (route.params.type == "create") {
      setTriggers(route.params.triggers[route.params.locations[0].value.toString()]);//ios-diff-2
      setLocations(route.params.locations);
    }
    if (route.params.type == "update") {
      setTriggerName(route.params.triggerName);
      setLocationName(route.params.locationName);
    }
    setAlprImage('empty');//ios-diff
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
  }, []);

  useEffect(
    () => navigation.addListener('focus', () => {
      setLicPlate(route.params.scanned_licplate);
      setID(route.params.autoID);
      setAlprImage(route.params.alprImage != undefined ? route.params.alprImage : 'empty');//ios-diff
    }
    ),
  );

  return (
    <ScrollView style={{ paddingBottom: 0 }}>
      <View style={styles.main}>
        {autoID != '' &&
          <View style={styles.item}>
            <Text style={[styles.common, styles.autoID]}>
              {autoID}
            </Text>
            <Text style={[styles.common, styles.autoID]}>
              {" ("}
              { i18n.t('id')}
              {")"}
            </Text>
          </View>
        }
        <View style={styles.item_calendar}>
          <Icon name="calendar" size={23} color="#126FEA" style={styles.iconCalendar} />
          <View style={{ width: "100%" }}>
            <MyDatePicker onSelectDate={onDatechange} width='100%' />
          </View>
        </View>
        <View style={styles.item_lic}>
          <Input
            placeholder={i18n.t('license_plate')}
            value={selected_licplate}
            onChangeText={text => setLicPlate(text)}
            leftIcon={{ type: 'font-awesome', name: 'camera', size: 23, marginBottom: 0, color: '#126FEA', onPress: () => alpr() }}
            leftIconContainerStyle={{ paddingTop: 10 }}
            inputContainerStyle={{
              borderBottomColor: 'grey',
              borderBottomWidth: 1,
              width: '100%',
            }}
            containerStyle={{
              width: '100%',
              paddingLeft: 0,
              paddingRight: 0,
              paddingBottom: 0,
              height: 55,
            }}
            inputStyle={{
              fontSize: 23,
              paddingBottom: 2,
              paddingLeft: 10
            }}
          />
        </View>
        {route.params.type == 'create' &&
          <View style={styles.picker}>
            <MPicker
              onSelectItem={
                (val) => {
                  onLocationChange(val);
                  setTriggers(route.params.triggers[val.toString()]);//ios-diff-2
                }
              } items={arr_location && arr_location} />
          </View>
        }
        {route.params.type == 'create' &&
          <View style={styles.picker}>
            <MPicker onSelectItem={onTriggerChange} items={arr_trigger && arr_trigger} />
          </View>
        }
        {route.params.type == 'update' &&
          <View style={styles.itemOdd}>
            <Text style={[styles.common, styles.autoID]}>
              {locationName}
            </Text>
          </View>
        }
        {route.params.type == 'update' &&
          <View style={styles.item}>
            <Text style={[styles.common, styles.autoID]}>
              {triggerName}
            </Text>
          </View>
        }
        <View style={styles.itemGps}>
          <Icon name="map-marker" size={23} color="#126FEA" style={styles.iconCalendar} />
          <Text style={styles.gpsStyle}>
            {gpsInfo}
          </Text>
        </View>
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>
            {i18n.t('from')}:
          </Text>
          <MyTimePicker onSelectTime={onTimeChangeFrom} order='from' />
        </View>
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>
            {i18n.t('to')}:
          </Text>
          <MyTimePicker onSelectTime={onTimeChangeTo} order='to' />
        </View>
        <View style={styles.pictures}>
          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              activeOpacity={.5}
              onPress={() => { setModalOpen(true); setIndexPhoto(0) }}
            >
              <Image source={{ uri: picture_data[0].uri }} style={styles.picture} />
            </TouchableOpacity>
            {photo_exist[0] == true ? crossIcon(0) : addIcon(0)}

          </View>
          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              activeOpacity={.5}
              onPress={() => { setModalOpen(true); setIndexPhoto(1) }}
            >
              <Image source={{ uri: picture_data[1].uri }} style={styles.picture} />
            </TouchableOpacity>
            {photo_exist[1] == true ? crossIcon(1) : addIcon(1)}
          </View>
          <View>
            <TouchableOpacity
              activeOpacity={.5}
              onPress={() => { setModalOpen(true); setIndexPhoto(2) }}
            >
              <Image source={{ uri: picture_data[2].uri }} style={styles.picture} />
            </TouchableOpacity>
            {photo_exist[2] == true ? crossIcon(2) : addIcon(2)}
          </View>
        </View>
        <View style={styles.last}>
          <TouchableOpacity
            activeOpacity={.5}
            style={styles.submittouch}
            onPress={() => sendPrev()}
          >
            <LinearGradient start={{ x: 0, y: 0.75 }} end={{ x: 1, y: 0.25 }} colors={['#2974FA', '#2974FA', '#2974FA']} style={styles.gradient}>
              <Text style={styles.submit}>{i18n.t('send')}</Text>
            </LinearGradient>

          </TouchableOpacity>
        </View>

        <Overlay
          visible={modalOpen}
          onClose={() => setModalOpen(false)}
          closeOnTouchOutside
          animationType="fadeIn"
          containerStyle={{ backgroundColor: 'rgba(27, 27, 27, 0.78)' }}
          childrenWrapperStyle={{ backgroundColor: '#eee', borderRadius: 10 }}
          animationDuration={500}>
          <TouchableOpacity
            activeOpacity={.5}
            style={{ padding: 10 }}
            onPress={() => {
              setModalOpen(false);
              launchCamera(index_photo);
            }}
          >
            <Text style={{ fontSize: 22 }}>{i18n.t('use_camera')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={.5}
            style={{ padding: 10 }}
            onPress={() => {
              setModalOpen(false);
              launchImageLibrary(index_photo);
            }}
          >
            <Text style={{ fontSize: 22 }}>{i18n.t('picture_from_gallery')}</Text>
          </TouchableOpacity>
        </Overlay>
        {loading &&
          <View style={styles.loading}>
            <BubblesLoader />
          </View>
        }
      </View>


    </ScrollView>
  );
}

export default CreateViolation;


const styles = StyleSheet.create({
  main: {
    flex: 1,
    padding: 20,
    paddingLeft: 30,
    paddingRight: 30,
    flexDirection: 'column',
    marginBottom: 0,
    height: '100%',
    minHeight: Dimensions.get('window').height - 50 //ios-diff
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    marginTop: 10,
    // justifyContent: 'space-between'
  },
  itemOdd: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    marginTop: 15,
  },
  itemGps: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 5,
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    marginTop: 13,
  },
  picker: {
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
    marginBottom: 5,
  },
  common: {
    fontSize: 23,
    paddingLeft: 5
  },
  gpsStyle: {
    fontSize: 21,
    paddingLeft: 5,
    paddingBottom: 5
  },
  item_calendar: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 10,
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
    marginBottom: 5,
  },
  item_lic: {
    paddingBottom: 0,
    marginBottom: 0,
    display: 'flex',
  },
  pictures: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 35,
  },
  timeItem: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 12,
  },
  picture: {
    width: Dimensions.get('window').width / 4,
    height: Dimensions.get('window').width / 6,
  },
  last: {
    marginTop: 40,
    display: 'flex',
    alignItems: 'center',
    marginBottom: 30,
  },
  submit: {
    fontSize: 25,
    color: 'white',
    textAlign: 'center'
  },
  submittouch: {
    width: '80%',
  },
  gradient: {
    borderRadius: 5,
    height: 45,
    display: 'flex',
    justifyContent: 'center'
  },
  iconCalendar: {
    alignSelf: 'flex-end',
    paddingBottom: 7,
    paddingRight: 6
  },
  timeLabel: {
    fontSize: 23,
    width: '30%',
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(97, 97, 97, 0.2)',
  },
  autoID: {
    color: 'grey',
  }

});