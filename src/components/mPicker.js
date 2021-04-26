import React, {useState, useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {Picker} from '@react-native-community/picker';

const MPicker = (props) => {


    const rows = props.items && props.items.map((item, index) => <Picker.Item label={item.label} value={item.value} key={index}/>);

    const [selected, setOption] = useState();
    
    const setWhich = (itemValue) => {
        setOption(itemValue);
        props.onSelectItem(itemValue);
    }

    useEffect(() => {
        if (props.items) {
            setWhich(props.items[0].value)
        }
    },[props.items]);
    
    return(
        <Picker
            style={styles.fullwidth}
            selectedValue={selected}
            onValueChange={(itemValue, itemIndex) =>
                setWhich(itemValue)
            }>
            {
                props.items && props.items.map((item, index) => <Picker.Item label={item.label} value={item.value} key={index}/>)
            }
        </Picker>
    );    
};


export default MPicker;

const styles = StyleSheet.create({
    fullwidth:{
        width: '78%',
        transform: [
            { scaleX: 1.4 },
            { scaleY: 1.4 },
        ],
        marginLeft: '13%',
        
    }
    
});