import React, {useState, useEffect } from 'react';
import {View, Text, Platform, StyleSheet} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const MyDatePicker = (props) => {

  const today = new Date();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  // const [date, setDate] = useState(new Date(today));
  const [date, setDate] = useState(today);
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);

    let fullDate = ("0" + currentDate.getDate()).slice(-2) + '.' + ("0" + (currentDate.getMonth() + 1)).slice(-2) + '.' + currentDate.getFullYear()
    props.onSelectDate(fullDate);
  };

  const showMode = currentMode => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };


  useEffect(() => onChange(today));

  return (
    // <View style={{width: "100%"}}>
    <View style={{width: props.width}}>
      <View>
        <Text onPress={showDatepicker} style={styles.common}>
            {("0" + date.getDate()).slice(-2)+'.'+ ("0" + (date.getMonth()+1)).slice(-2) +'.'+date.getFullYear()}
        </Text>
      </View>
      {/* <View>
        <Button onPress={showTimepicker} title="Show time picker!" />
      </View> */}
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

export default MyDatePicker;

const styles = StyleSheet.create({
    common: {
        fontSize: 23,
        paddingBottom: 3,
        paddingLeft: 10
    }
});