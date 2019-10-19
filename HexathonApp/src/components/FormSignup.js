import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, AsyncStorage, Keyboard, Picker } from 'react-native';
import axios from 'axios';
//import {Actions} from 'react-native-router-flux';

export default class FormSignup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            vehicleNumber: '',
            vehicleType:'',
            vehicleContactNumber: '',
            vehicleUsername:'',
            vehiclePassword:'',
            firstName: '',
            lastName:'',
            userContactNumber: '',
            userUsername:'',
            userPassword:'',
            signUpType: 'default'
        }
    }

    saveData = async () => {
        let url = "https://us-central1-ems-4-bce4c.cloudfunctions.net/webApi/api/v1/signup";
        let body = null;
        let fcmToken = await AsyncStorage.getItem('fcmToken');
        if(this.state.signUpType == "unit"){
            body = {
                type: this.state.signUpType,
                vehicleNumber: this.state.vehicleNumber,
                vehicleType:this.state.vehicleType,
                contactNumber: this.state.vehicleContactNumber,
                username:this.state.vehicleUsername,
                password:this.state.vehiclePassword,
            }
        }else{
            body = {
                type: this.state.signUpType,
                firstName: this.state.firstName,
                lastName:this.state.lastName,
                mobileNumber: this.state.userContactNumber,
                username:this.state.userUsername,
                password:this.state.userPassword,
                fcmToken:fcmToken
            }
        }

        let headers = {
            "Content-Type": "application/json" 
        }

        axios.post(url, body, {headers:headers}).then((response)=>{
            console.log("SIgnup successful::", response);
            this.navigateToLogin()

        }).catch((error)=>{
            console.log("SIgnup failed::", error);
        });
    }


    navigateToLogin = () => {
        const { navigate } = this.props.navigation;
        navigate("Login", {
            onGoBack: () => {
            }
        });
    }
    showData = async () => {
        let loginDetails = await AsyncStorage.getItem('loginDetails');
        let ld = JSON.parse(loginDetails);
        alert('email: ' + ld.email + ' ' + 'password: ' + ld.password);
    }

    updateSignUpType = (signUpType) => {
        this.setState({ signUpType: signUpType })
    }

    render() {
        const { signUpType } = this.state;
        return (
            <View style={styles.container}>

                <View style={{ width: 300, borderColor: '#000', borderWidth: 1, borderRadius: 25, marginVertical: 10 }}>
                    <Picker style={{ width: "100%" }} selectedValue={this.state.signUpType} onValueChange={this.updateSignUpType}>
                        <Picker.Item label="Select Signup Type" value="default" />
                        <Picker.Item label="Unit" value="unit" />
                        <Picker.Item label="User" value="user" />
                    </Picker>
                </View>

                {signUpType == "unit" ?
                    <View>
                        <TextInput style={styles.inputBox}
                            onChangeText={(vehicleNumber) => this.setState({ vehicleNumber })}
                            underlineColorAndroid='rgba(0,0,0,0)'
                            placeholder="Vehicle Number"
                            placeholderTextColor="#002f6c"
                            selectionColor="#fff"/>

                        <TextInput style={styles.inputBox}
                            onChangeText={(vehicleType) => this.setState({ vehicleType })}
                            underlineColorAndroid='rgba(0,0,0,0)'
                            placeholder="Vehicle Type"
                            placeholderTextColor="#002f6c"
                            selectionColor="#fff"/>

                        <TextInput style={styles.inputBox}
                            onChangeText={(vehicleContactNumber) => this.setState({ vehicleContactNumber })}
                            underlineColorAndroid='rgba(0,0,0,0)'
                            placeholder="Contact Number"
                            placeholderTextColor="#002f6c"
                            selectionColor="#fff"/>

                        <TextInput style={styles.inputBox}
                            onChangeText={(vehicleUsername) => this.setState({ vehicleUsername })}
                            underlineColorAndroid='rgba(0,0,0,0)'
                            placeholder="Username"
                            placeholderTextColor="#002f6c"
                            ref={(input) => this.password = input}
                        />

                        <TextInput style={styles.inputBox}
                            onChangeText={(vehiclePassword) => this.setState({ vehiclePassword })}
                            underlineColorAndroid='rgba(0,0,0,0)'
                            placeholder="Password"
                            secureTextEntry={true}
                            placeholderTextColor="#002f6c"
                            ref={(input) => this.password = input}
                        />
                    </View> : null}

                {signUpType == "user" ?
                    <View>
                        <TextInput style={styles.inputBox}
                            onChangeText={(firstName) => this.setState({ firstName })}
                            underlineColorAndroid='rgba(0,0,0,0)'
                            placeholder="First Name"
                            placeholderTextColor="#002f6c"
                            selectionColor="#fff"/>

                        <TextInput style={styles.inputBox}
                            onChangeText={(lastName) => this.setState({ lastName })}
                            underlineColorAndroid='rgba(0,0,0,0)'
                            placeholder="Last Name"
                            placeholderTextColor="#002f6c"
                            selectionColor="#fff"/>

                        <TextInput style={styles.inputBox}
                            onChangeText={(userContactNumber) => this.setState({ userContactNumber })}
                            underlineColorAndroid='rgba(0,0,0,0)'
                            placeholder="Contact number"
                            placeholderTextColor="#002f6c"
                            selectionColor="#fff"/>

                        <TextInput style={styles.inputBox}
                            onChangeText={(userUsername) => this.setState({ userUsername })}
                            underlineColorAndroid='rgba(0,0,0,0)'
                            placeholder="Username"
                            placeholderTextColor="#002f6c"
                            ref={(input) => this.password = input}
                        />

                        <TextInput style={styles.inputBox}
                            onChangeText={(userPassword) => this.setState({ userPassword })}
                            underlineColorAndroid='rgba(0,0,0,0)'
                            placeholder="Password"
                            secureTextEntry={true}
                            placeholderTextColor="#002f6c"
                            ref={(input) => this.password = input}
                        />
                    </View> : null}

                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText} onPress={this.saveData}>Sign Up</Text>
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
        marginVertical: 10,
        borderColor: '#000', borderWidth: 1
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