import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  TextInput
} from 'react-native';
import { Picker } from '@react-native-community/picker';
import { CheckBox } from 'react-native-elements'
import LinearGradient from 'react-native-linear-gradient';
import { I18nLocalize, i18n } from 'react-native-i18n-localize';
import { Input } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import img from '../assets/images/logo.png';
import Icon from 'react-native-vector-icons/FontAwesome';
import { BubblesLoader } from 'react-native-indicator';
import Overlay from 'react-native-modal-overlay';
import { ScrollView } from 'react-native-gesture-handler';
import { MyFetch } from '../fetch';

const LogIn = ({ navigation, route }) => {

  const [language, selectLang] = useState("de");// language set
  const [username, setUserName] = useState("");
  const [password, setPassWord] = useState("");
  const [remember, setRemember] = useState();
  const [selectedValue, setSelectedValue] = useState("de");// flag set
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const isMountedRef = useRef(null);  //ios-diff



  const [accountList, setAccountList] = useState(null);

  const setSelectedAccount = (index) => {
    let info = accountList[index];
    setUserName(info.username);
    setPassWord(info.password);
  }

  const accountListView = isMountedRef.current && accountList && accountList.map((item, index) =>
    <View key={index} style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%'
    }}>
      <TouchableOpacity
        activeOpacity={.5}
        style={{ padding: 10, width: '85%' }}
        onPress={() => {
          setModalOpen(false);
          setSelectedAccount(index);
        }}
      >
        <Text style={{ fontSize: 22, textAlign: 'center' }}>{item.username}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => trashAccount(index)}>
        <Icon name='trash' size={22} color="#126FEA" />
      </TouchableOpacity>
    </View>
  )

  const setTick = () => {
    if (remember == true) {
      setRemember(false);
    }
    else {
      setRemember(true);
    }
  }

  const changeLanguage = (lang) => {
    selectLang(lang);
    I18nLocalize.setLanguage(lang);
    storeInitLangData(lang);
  }

  const failedConnect = () => {
    setLoading(false);

    Alert.alert(
      i18n.t('warn'),
      i18n.t('not_connect_server'),
      [{ text: i18n.t('ok'), },]
    );
  }

  const handleLogin = (data) => {
    setLoading(false);
    if (data.pass == "getin") {
      if (remember) {
        storeInitLoginData(username, password);
      }

      setTimeout(() => {
        navigation.replace('UserInfo', {

          headerTitle: i18n.t('welcome') + ' ' + username,
          customerID: data.customerID,
          clerk: data.clerk
        });
      }, 500);

    }
    else if (data.pass == "invalid") {
      Alert.alert(
        i18n.t('warn'),
        i18n.t('wrong_user'),
        [{ text: i18n.t('ok'), },]
      );
    }
  }

  const pressLogIn = () => {

    const formData = new FormData();

    formData.append('userId', username);
    formData.append('passWord', password);

    setLoading(true);

    MyFetch(25, fetch('http://150.95.129.109/wp-json/violation/login', {
      method: 'POST',
      body: formData
    }))
      .then((response) => response.json())
      .then((json) => { handleLogin(json); })
      .catch((error) => {
        console.log(error);
        failedConnect();
      })

  };

  const storeInitLangData = async (lang) => {
    try {
      await AsyncStorage.setItem('initialLang', lang)
    } catch (e) {
      
    }
  }

  const getInitLangData = async () => {
    try {
      const value = await AsyncStorage.getItem('initialLang')
      if (value !== null && isMountedRef.current) {   //ios-diff
        selectLang(value);
        setSelectedValue(value);
      }
    } catch (e) {
      // error reading value
    }
  }

  const getInitLoginData = async () => {
    try {

      const acc_arr = await AsyncStorage.getItem('accountList');

      if (acc_arr !== null && isMountedRef.current) {  //ios-diff
        setAccountList(JSON.parse(acc_arr));
        let info = JSON.parse(acc_arr);     //ios-diff-2
        setUserName(info[0].username);
        setPassWord(info[0].password);
      }
    } catch (e) {
    }
  }

  const storeInitLoginData = async (user_id, user_pass) => {
    try {

      let temp = accountList;
      let exist = false;

      if (temp) {
        temp.map((item, index) => {
          if (item.username == user_id)
            exist = true;
        })
      }

      if (!exist) {
        if (temp)
          temp = [...temp, {
            username: user_id,
            password: user_pass
          }];
        else
          temp = [{
            username: user_id,
            password: user_pass
          }]
      }

      setAccountList(temp);

      await AsyncStorage.setItem('accountList', JSON.stringify(temp));

    } catch (e) {
      // saving error
    }
  }

  const trashAccount = async (index) => {

    let temp = accountList;
    temp.splice(index, 1);
    setAccountList(temp);
    setModalOpen(false);
    storeAccounts(temp);

  }

  const storeAccounts = async (temp) => {
    try {
      await AsyncStorage.setItem('accountList', JSON.stringify(temp));
    } catch (e) { }
  }

  useEffect(() => {
    isMountedRef.current = true; //ios-diff

    getInitLangData();
    getInitLoginData();

    return () => isMountedRef.current = false; //ios-diff

  }, [])


  return (
    <View style={styles.main}>
      <Picker
        selectedValue={selectedValue}
        style={styles.flags}
        onValueChange={(itemValue, itemIndex) => { setSelectedValue(itemValue); changeLanguage(itemValue) }}>
        <Picker.Item label="🇩🇪  Deutsch" value="de" />
        <Picker.Item label="🇬🇧  English" value="en" />
        <Picker.Item label="🇫🇷  Français" value="fr" />
        <Picker.Item label="🇮🇹  Italiano" value="it" />
      </Picker>
      <View style={styles.contain}>
        <Image style={styles.logo} source={img} />

        <View style={styles.itemInput}>
          <TouchableOpacity
            activeOpacity={.5}
            onPress={() => { if (accountList && accountList.length > 0) setModalOpen(true) }}
          >
            <Icon name='user' size={23} color="#126FEA" />
          </TouchableOpacity>
          <TextInput
            onChangeText={text => setUserName(text)}
            autoCapitalize='none'
            value={username}
            placeholder={i18n.t('user_name')}
            style={{ width: '90%', fontSize: 20, paddingLeft: 10 }}
          />
        </View>
        <View style={styles.itemInput}>
          <Icon name='lock' size={23} color="#126FEA" />
          <TextInput
            onChangeText={text => setPassWord(text)}
            autoCapitalize='none'
            value={password}
            secureTextEntry={true}
            placeholder={i18n.t('password')}
            style={{ width: '90%', fontSize: 20, paddingLeft: 10 }}
          />
        </View>

        <CheckBox
          title={i18n.t('remember_me')}
          iconType='font-awesome'
          checkedIcon='check'
          checked={remember}
          onIconPress={setTick}
          textStyle={{ fontSize: 18 }}
          containerStyle={{ alignSelf: "flex-start", paddingLeft: 0, backgroundColor: "white", borderColor: "white" }}
        />
        <TouchableOpacity
          style={styles.loginbutton}
          activeOpacity={.5}
          onPress={pressLogIn}
        >
          <LinearGradient start={{ x: 0, y: 0.75 }} end={{ x: 1, y: 0.25 }} colors={['#2974FA', '#2974FA', '#2974FA']} style={styles.gradient}>
            <Text style={styles.text}>{i18n.t('sign_in')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      {loading &&
        <View style={styles.loading}>
          <BubblesLoader />
        </View>
      }
      {accountList && accountList.length > 0 &&
        <Overlay
          visible={modalOpen}
          onClose={() => setModalOpen(false)}
          closeOnTouchOutside
          animationType="fadeIn"
          containerStyle={{ backgroundColor: 'rgba(27, 27, 27, 0.78)' }}
          childrenWrapperStyle={{ backgroundColor: '#eee', borderRadius: 10, paddingLeft: 0, paddingRight: 0 }}
          animationDuration={500}>
          <ScrollView>
            <View style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10
            }}>
              <Icon name='user-circle' size={22} color="#126FEA" />
              <Text style={{ fontSize: 22, paddingLeft: 5 }}>{i18n.t('choose_account')}</Text>
            </View>
            {
              accountListView
            }
          </ScrollView>
        </Overlay>
      }
    </View>
  );
}

export default LogIn;


const styles = StyleSheet.create({
  main: {
    flex: 1,
    padding: 30,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: 'white',
    position: 'relative'
  },
  contain: {
    alignItems: 'center',
  },
  title: {
    marginBottom: 20,
    fontSize: 25,
    textAlign: 'center'
  },
  itemInput: {
    width: '95%',
    borderBottomColor: 'grey',
    borderBottomWidth: 0.6,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    marginBottom: 10
  },
  loginbutton: {
    width: '90%',
    height: 50,
    marginTop: 45
  },
  qrbutton: {
    width: '90%',
    height: 50,
    marginTop: 25
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    height: '100%'
  },
  text: {
    color: 'white',
    fontSize: 23
  },
  logo: {
    resizeMode: 'contain',
    width: 100,
    height: 100,
    marginBottom: 70
  },
  loginText: {
    fontSize: 30,
    textAlign: 'left',
    marginBottom: 50
  },
  flags: {
    height: 50,
    width: 160,
    position: "absolute",
    top: 0,
    right: -40,
    backgroundColor: 'white'
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
});