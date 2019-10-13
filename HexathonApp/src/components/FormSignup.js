import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, AsyncStorage, Keyboard } from 'react-native';

//import {Actions} from 'react-native-router-flux';

export default class FormSignup extends Component {

    constructor(props){
        super(props);
        this.state={
            vehicle_no:'',
            unit_type:'',
            contact_no : '',
            password: ''
        }
    }

    saveData =async()=>{
        const {vehicle_no,unit_type,contact_no,password} = this.state;

        //save data with asyncstorage
        let loginDetails={
            vehicle_no: vehicle_no,
            unit_type:unit_type,
            contact_no:contact_no,
            password: password
        }

        if(this.props.type !== 'Login')
        {
            AsyncStorage.setItem('loginDetails', JSON.stringify(loginDetails));

            Keyboard.dismiss();
            alert("You successfully registered. Contact No.: " + contact_no + ' password: ' + password);
            this.login();
        }
        else if(this.props.type == 'Login')
        {
            try{
                let loginDetails = await AsyncStorage.getItem('loginDetails');
                let ld = JSON.parse(loginDetails);

                if (ld.email != null && ld.password != null)
                {
                    if (ld.email == email && ld.password == password)
                    {
                        alert('Go in!');
                    }
                    else
                    {
                        alert('Email and Password does not exist!');
                    }
                }

            }catch(error)
            {
                alert(error);
            }
        }
    }

    showData = async()=>{
        let loginDetails = await AsyncStorage.getItem('loginDetails');
        let ld = JSON.parse(loginDetails);
        alert('email: '+ ld.email + ' ' + 'password: ' + ld.password);
    }

    render() {
        return(
            <View style={styles.container}>

                <TextInput style={styles.inputBox}
                onChangeText={(vehicle_no) => this.setState({vehicle_no})}
                underlineColorAndroid='rgba(0,0,0,0)' 
                placeholder="Vehicle Number"
                placeholderTextColor = "#002f6c"
                selectionColor="#fff"
              //  keyboardType="email-address"
                onSubmitEditing={()=> this.password.focus()}/> 

                <TextInput style={styles.inputBox}
                onChangeText={(unit_type) => this.setState({unit_type})}
                underlineColorAndroid='rgba(0,0,0,0)' 
                placeholder="Unit Type"
                placeholderTextColor = "#002f6c"
                selectionColor="#fff"
              //  keyboardType="email-address"
                onSubmitEditing={()=> this.password.focus()}/> 

                <TextInput style={styles.inputBox}
                onChangeText={(contact_no) => this.setState({contact_no})}
                underlineColorAndroid='rgba(0,0,0,0)' 
                placeholder="Contact number"
                placeholderTextColor = "#002f6c"
                selectionColor="#fff"
              //  keyboardType="email-address"
                onSubmitEditing={()=> this.password.focus()}/>

                <TextInput style={styles.inputBox}
                onChangeText={(password) => this.setState({password})} 
                underlineColorAndroid='rgba(0,0,0,0)' 
                placeholder="Password"
                secureTextEntry={true}
                placeholderTextColor = "#002f6c"
                ref={(input) => this.password = input}
                />

                <TouchableOpacity style={styles.button}> 
                    <Text style={styles.buttonText} onPress={this.saveData}>{this.props.type}</Text>
                </TouchableOpacity>
            </View>
            
        )
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputBox: {
        width: 300,
        backgroundColor: '#eeeeee', 
        borderRadius: 25,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#002f6c',
        marginVertical: 10
    },
    button: {
        width: 300,
        backgroundColor: '#4f83cc',
        borderRadius: 25,
        marginVertical: 10,
        paddingVertical: 12
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ffffff',
        textAlign: 'center'
    }
});