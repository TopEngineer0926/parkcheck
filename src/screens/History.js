import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions
} from 'react-native';
import { i18n } from 'react-native-i18n-localize';
import MyDatePicker from '../components/mDatePicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { BubblesLoader } from 'react-native-indicator';
import { MyFetch } from '../fetch';

const History = ({ navigation, route }) => {

  const [dateFrom, onDateFromchange] = useState('');
  const [dateTo, onDateTochange] = useState('');
  const [vioList, setVioList] = useState(null);
  const [loading, setLoading] = useState(false);

  const temp = {
    violationID: '0300400903740',
    location: 'Abendweg 1004 Lausanne street cannnde',
    trigger: 'trigger temp',
    createdTime: '11.08.2020 20:21'
  }

  const loadFromServer = () => {
    setLoading(true);

    const formData = new FormData();
    formData.append('clerk', route.params.clerk);
    formData.append('fromDate', dateFrom.split(".").reverse().join("-"));
    formData.append('toDate', dateTo.split(".").reverse().join("-"));

    MyFetch(50, fetch('http://150.95.129.109/wp-json/violation/history', {
      method: 'POST',
      body: formData
    }))
    .then((response) => response.json())
    .then((json) => { showList(json); })
    .catch((error) => {
      console.log(error);
      failedConnect();
    })

  }

  const showList = (data) => {
    setLoading(false);
    if(data.vioList.length == 0)
      setVioList(null);
    else
      setVioList(data.vioList);
  }

  const failedConnect = () => {
    setLoading(false);

    Alert.alert(
      i18n.t('warn'),
      i18n.t('not_connect_server'),
      [{text: i18n.t('ok'), },]
    );
  }

  const pressLoad = () => {
    let fromD = new Date(dateFrom.split(".").reverse().join("-"));
    let toD = new Date(dateTo.split(".").reverse().join("-"));
    let diff = fromD.getTime() - toD.getTime();

    if(diff > 0)
      Alert.alert(
        i18n.t('warn'),
        i18n.t('check_date'),
        [{ text: i18n.t('ok'), },]
      );
    else{
      loadFromServer();
    }
  }


  const contentList = vioList &&
        vioList.map( (item, index) => 
        <View style={styles.item} key={index}>
          <Icon name="check-circle-o" size={50} color="#126FEA" style={styles.iconCalendar} />
          <View style={styles.infoItem}>
            <Text style={styles.itemBig}>{item.violationID}</Text>
            <Text style={styles.itemBig}>{item.licplate}</Text>
            <Text style={styles.itemBig}>{item.location}</Text>
            <Text style={styles.itemBig}>{item.trigger}</Text>
            <Text style={styles.itemSmall}>{item.createdTime}</Text>
          </View>
        </View> )

  const emptyContent = <Text style={{textAlign: 'center', fontSize: 20}}>{i18n.t('noViolation')}</Text>

  return (
    <ScrollView>
      <View style={styles.main}>
        <View style={styles.setting}>
          <View style={styles.datePick}>
            <Text style={styles.dateText}>
              {i18n.t('from')}:
            </Text >
            <View style={styles.dateContain}>
              <Icon name="calendar" size={23} color="#126FEA" style={styles.iconCalendar} />
              <MyDatePicker onSelectDate={onDateFromchange}  />
            </View>
          </View>
          <View style={styles.datePick}>
            <Text style={styles.dateText}>
              {i18n.t('to')}:
            </Text>
            <View style={styles.dateContain}>
              <Icon name="calendar" size={23} color="#126FEA" style={styles.iconCalendar} />
              <MyDatePicker onSelectDate={onDateTochange}  />
            </View>
          </View>
          <View style={styles.getListBtnContain}>
            <TouchableOpacity
             style={{width: '100%'}}
              activeOpacity={.5}
              onPress={() => pressLoad()}
            >
              <View style={styles.getButton}>
                <Text style={styles.text}>{i18n.t('load')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.divider}></View>
        <View style={styles.listContain}>
          { vioList == null ? 
            emptyContent :
            contentList}
        </View>
        {loading &&
          <View style={styles.loading}>
            <BubblesLoader />
          </View>
        }
      </View>
    </ScrollView>
  );
}

export default History;


const styles = StyleSheet.create({
  main: {
    flex: 1,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    minHeight: Dimensions.get('window').height - 50
  },
  setting: {
    width: '90%',
    marginTop: 20
  },
  datePick: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10
  },
  dateText: {
    fontSize: 23,
    width: '30%',
  },
  dateContain: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '60%',
    borderBottomWidth: 1,
    borderBottomColor: 'grey'
  },
  iconCalendar: {
    paddingTop: 3
  },
  getButton: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    height: 50,
    backgroundColor: '#2974FA',
    marginTop: 20,
    width: '100%',
  },
  text: {
    color: 'white',
    fontSize: 23
  },
  divider: {
    backgroundColor: 'grey',
    height: 1,
    width: '100%',
    marginBottom: 20,
    marginTop: 20
  },
  listContain: {
    width: '100%'
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#ccc',
    padding: 5,
    marginBottom: 10
  },
  infoItem: {
    paddingLeft: 10,
    display: 'flex',
    flexDirection: 'column',
    width: ( Dimensions.get('window').width - 100 ),
  },
  itemBig: {
    fontSize: 18,
  },
  itemSmall: {
    fontSize: 15,
    marginTop: 8
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(97, 97, 97, 0.2)',
    paddingTop: Dimensions.get('window').height/2
  },
});


