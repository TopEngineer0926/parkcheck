import React, {useState, useEffect} from 'react';
import {View, TouchableOpacity, Platform, StyleSheet, Text} from 'react-native';
import {Input} from 'react-native-elements'
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';

const MyTimePicker = (props) => {

    const today = new Date();
    
    const [date, setDate] = useState(props.order == 'from' ? new Date(today.getTime() - 10 * 60000) : today);
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);
  
    const onChange = (event, selectedDate) => {
      const currentDate = selectedDate || date;
      setShow(Platform.OS === 'ios');
      setDate(currentDate);
      props.onSelectTime(("0" + currentDate.getHours()).slice(-2) + ':' + ("0" + currentDate.getMinutes()).slice(-2));
      
    };
  
    const showMode = currentMode => {
      setShow(true);
      setMode(currentMode);
    };
  
    const showTimepicker = () => {
      showMode('time');
    };

    useEffect(() => {
      onChange();
    },[]);
  
    return (
      <View style={styles.container}>
        {/* <View>
          <Button style={styles.item} onPress={showTimepicker} title={date.getHours() + ':' + date.getMinutes()} />
        </View> */}
        <TouchableOpacity 
            style={styles.touchableContain}
            activeOpacity={.5} 
            onPress={showTimepicker}>
                    <Icon name="clock-o" size={23} color="#126FEA" /> 
                    <Text style={styles.item}>{("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2)}</Text>
        </TouchableOpacity>
        {show && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode={mode}
            is24Hour={true}
            display="default"
            onChange={onChange}
          />
        )}
      </View>
    );
};

export default MyTimePicker;

const styles = StyleSheet.create({
    container: {
        width: "60%"
    },
    item: {
      fontSize: 23,
      textAlign: 'center',
      color: 'black',
      marginLeft: 20
    },
    touchableContain: {
      display: 'flex',
      flexDirection: 'row',
      textAlign: 'center',
      color: 'black',
      borderBottomWidth: 0.8,
      borderBottomColor: 'grey',
      alignItems: 'center',
      paddingLeft: '10%'
    }
});