import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Picker } from 'react-native';
import { getCurrentLocation } from '../services/LocationService';
import { PermissionsHelper } from '../services/Functions/PermissionHelper';
import axios from 'axios';

export default class FormLogin extends Component {

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            loginType: 'default'
        }
    }

    navigateToSignUp = () => {
        const { navigate } = this.props.navigation;
        navigate("SignUp", {
            onGoBack: () => {
            }
        });
    }
    saveData = async () => {
        const { username, password, loginType } = this.state;
        console.log("Username:", username, "Password::", password, "LoginType::", loginType);
        if (username == "" || password == "" || loginType == "default") {
            Alert.alert("Login Failed", "Please check your username, password and select proper login type");
        } else {
            // find your origin and destination point coordinates and pass it to our method.
            // I am using Bursa,TR -> Istanbul,TR for this example
            const permission = await PermissionsHelper.requestPermission("location", "Enable Location Services", "Please go to settings and enable location services");
            if (permission) {
                getCurrentLocation().then((currentLocation) => {
                    console.log("current location:::", currentLocation);

                    let url = "https://us-central1-ems-4-bce4c.cloudfunctions.net/webApi/api/v1/login";
                    let body = {
                        type: this.state.loginType,
                        username: this.state.username,
                        password: this.state.password,
                        location: {
                            latitude:currentLocation.address.position.lat,
                            longitude:currentLocation.address.position.lng
                        }
                    }

                    let headers = {
                        "Content-Type": "application/json"
                    }

                    axios.post(url, body, { headers: headers }).then((response) => {
                        console.log("Login successful::", response);
                    }).catch((error) => {
                        console.log("Login failed::", error);
                    });

                }).catch((error) => {
                    console.log("Failed to fetch location", error);
                })
            } else {
                Alert.alert("Failed to fetch location. Please try again");
            }
        }


    }

    updateLoginType = (loginType) => {
        this.setState({ loginType: loginType })
    }

    render() {
        return (
            <View style={styles.container}>
                <TextInput style={styles.inputBox}
                    onChangeText={(username) => this.setState({ username })}
                    underlineColorAndroid='rgba(0,0,0,0)'
                    placeholder="Username"
                    placeholderTextColor="#002f6c"
                    selectionColor="#fff" />

                <TextInput style={styles.inputBox}
                    onChangeText={(password) => this.setState({ password })}
                    underlineColorAndroid='rgba(0,0,0,0)'
                    placeholder="Password"
                    secureTextEntry={true}
                    placeholderTextColor="#002f6c"
                    ref={(input) => this.password = input}
                />

                <View style={{ width: 300, borderColor: '#000', borderWidth: 1, borderRadius: 25, marginVertical: 10 }}>
                    <Picker style={{ width: "100%" }} selectedValue={this.state.loginType} onValueChange={this.updateLoginType}>
                        <Picker.Item label="Select Login Type" value="default" />
                        <Picker.Item label="Unit" value="unit" />
                        <Picker.Item label="User" value="user" />
                    </Picker>
                </View>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText} onPress={this.saveData}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.signup}>
                    <Text style={styles.haveText} onPress={this.navigateToSignUp}>Already have account?.</Text>
                </TouchableOpacity>
            </View>

        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputBox: {
        width: 300,
        borderColor: '#000', borderWidth: 1,
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
    signup: {
        width: 300,
        marginVertical: 10,
        paddingVertical: 12
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ffffff',
        textAlign: 'center'
    },
    haveText: {
        fontSize: 14,
        fontWeight: '300',
        color: '#4f83cc',
        textAlign: 'center'
    }
});