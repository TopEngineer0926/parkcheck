import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LogIn from './src/screens/LogIn';
import UserInfo from './src/screens/UserInfo';
import CreateViolation from './src/screens/CreateViolation';
import Done from './src/screens/Done';
import Landing from './src/screens/Landing';
import Scanscreen from './src/screens/ScanScreen';
import Alpr from './src/screens/Alpr';
import History from './src/screens/History';

import {
  TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import AsyncStorage from '@react-native-community/async-storage';

import { I18nLocalize, i18n } from 'react-native-i18n-localize'
import en from './src/translate/en.json';
import de from './src/translate/de.json';
import it from './src/translate/it.json';
import fr from './src/translate/fr.json';


I18nLocalize.initialLanguage({ en, de, fr, it })

const Stack = createStackNavigator();

const App = () => {

  useEffect(() => {
    getInitData();
  })

  getInitData = async () => {
    try {
      const value = await AsyncStorage.getItem('initialLang')
      if (value !== null) {
        I18nLocalize.setLanguage(value);
      }
      else {
        I18nLocalize.setLanguage('de');
      }
    } catch (e) {
      // error reading value
    }
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Landing"
          component={Landing}
          options={{
            headerShown: false
          }} />
        <Stack.Screen
          name="Scanscreen"
          component={Scanscreen}
          options={{
            headerShown: false
          }} />
        <Stack.Screen
          name="Alpr"
          component={Alpr}
          options={{
            headerShown: false
          }} />
        <Stack.Screen
          name="LogIn"
          component={LogIn}
          options={({ route }) => ({
            title: route.params.headerTitle,
            headerStyle: {
              backgroundColor: '#2974FA',
            },
            headerTintColor: '#fff',
          })} />
        <Stack.Screen
          name="UserInfo"
          component={UserInfo}
          options={({ route, navigation }) => ({
            title: route.params.headerTitle,
            headerStyle: {
              backgroundColor: '#2974FA',
            },
            headerTintColor: '#fff',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => {navigation.replace('LogIn',{headerTitle: (i18n.t('parkcheck')+' '+i18n.t('switzerland'))})}}
                activeOpacity={.5}>
                <Icon name="sign-out" size={22} color="#fff" style={{ marginRight: 10 }} />
              </TouchableOpacity>
            )
          })}
        />
        <Stack.Screen
          name="CreateViolation"
          component={CreateViolation}
          options={({ route }) => ({
            title: route.params.headerTitle,
            headerStyle: {
              backgroundColor: '#2974FA',
            },
            headerTintColor: '#fff',
          })}
        />
        <Stack.Screen
          name="Done"
          component={Done}
          options={({ route }) => ({
            title: route.params.headerTitle,
            headerStyle: {
              backgroundColor: '#2974FA',
            },
            headerTintColor: '#fff',
          })}
        />
        <Stack.Screen
          name="History"
          component={History}
          options={({ route }) => ({
            title: route.params.headerTitle,
            headerStyle: {
              backgroundColor: '#2974FA',
            },
            headerTintColor: '#fff',
          })} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

