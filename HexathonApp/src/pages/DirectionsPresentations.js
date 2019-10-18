
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native';

import MapView, { Marker } from 'react-native-maps';
import Polyline from '@mapbox/polyline';
import {getCurrentLocation} from '../services/LocationService';
import { PermissionsHelper } from '../services/Functions/PermissionHelper';
import firebase from 'react-native-firebase'


export default class DirectionsScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            coords: [],
            source: { latitude: 17.3850, longitude: 78.4867 },
            destination: { latitude: 17.1883, longitude: 79.2000 },
        }
    }

    async componentDidMount() {
        // find your origin and destination point coordinates and pass it to our method.
        // I am using Bursa,TR -> Istanbul,TR for this example
        const permission = await PermissionsHelper.requestPermission("location", "Enable Location Services", "Please go to settings and enable location services");
        if (permission) {
            getCurrentLocation().then((currentLocation) => {
                console.log("current location:::", currentLocation);
                this.getDirections("17.3850, 78.4867", "17.1883,79.2000");
            }).catch((error) => {
                console.log("Failed to fetch location", error);
            })
        } else {
            Alert.alert("Failed to fetch location. Please try again");
        }
    }

     save = async () => {
        const event = {
            "createdBy" : "test_user2",
            "currentLocation" : {
              "latitude" : "",
              "longitude" : ""
            },
            "destination" : {
              "location" : {
                "latitude" : "",
                "longitude" : ""
              },
              "name" : "d1"
            },
            "source" : {
              "location" : {
                "latitude" : "",
                "longitude" : ""
              },
              "name" : "s1"
            },
            "status" : "RUNNING",
            "unit" : "unit2"
          }
    
         firebase.database().ref('events').push(event).then(value => {
            console.log(value)

        }).catch(error => {
            console.log(error)
        })
      }

    async getDirections(startLoc, destinationLoc) {
        try {
            let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=AIzaSyAsDx3DB19GW8GnFdCMcDQXzWhya1yiYAo`)//`https://maps.googleapis.com/maps/api/directions/json?origin=${ startLoc }&destination=${ destinationLoc }`)
            let respJson = await resp.json();
            let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
            let coords = points.map((point, index) => {
                return {
                    latitude: point[0],
                    longitude: point[1]
                }
            })
            this.setState({ coords: coords })
            return coords
        } catch (error) {
            alert(error)
            return error
        }
    }

    onSourceLocationPressed = () => {
        const { navigate } = this.props.navigation;
        navigate("LocationSeachPage", {
            onGoBack: (locationInfo) => {
                console.log("Source Location updated to state::", locationInfo);
                this.setState({
                    destination: { latitude: locationInfo.latitude, longitude: locationInfo.longitude },
                    sourceLocationInput: locationInfo.locationString
                })
            }
        });
    }

    onDestinationLocationPressed = () => {
        const { navigate } = this.props.navigation;
        navigate("LocationSeachPage", {
            onGoBack: (locationInfo) => {
                console.log("Destination Location updated to state::", locationInfo);
                this.setState({
                    source: { latitude: locationInfo.latitude, longitude: locationInfo.longitude },
                    destinationLocationInput: locationInfo.locationString
                })
            }
        });
    }

    render() {
        let source = this.state.source || { latitude: 17.3850, longitude: 78.4867 }
        let destination = this.state.destination || { latitude: 17.1883, longitude: 79.2000 }
        return (
            <View style={styles.overallViewContainer}>

                <MapView
                    style={styles.container}
                    initialRegion={{
                        latitude: 17.3850,
                        longitude: 78.4867,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421
                    }}
                    region={this.state.locationCoordinates}
                    zoomEnabled={true}
                    scrollEnabled={true}
                >
                    <Marker
                        coordinate={source}
                        title={"Source"}
                        description={"hoeeo"}
                    />
                    <Marker
                        coordinate={destination}
                        title={"Destination"}
                        description={"hoeeo"}
                    />
                    <MapView.Polyline
                        coordinates={this.state.coords}
                        strokeWidth={3}
                        strokeColor="red" />

                </MapView>
                <View style={styles.allNonMapThings}>
                    <View style={styles.inputContainer}>
                        <TouchableOpacity onPress={this.onSourceLocationPressed}>
                            <TextInput
                                placeholder="From"
                                style={styles.source}
                                onChangeText={this.handleLocationInput}
                                value={this.state.sourceLocationInput}
                                editable={false}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.onDestinationLocationPressed}>
                            <TextInput
                                placeholder="Where to go?."
                                style={styles.destination}
                                onChangeText={this.handleLocationInput}
                                value={this.state.destinationLocationInput}
                                editable={false}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.button} >
                        <TouchableOpacity onPress={this.save}>
                            <Text style={styles.buttonText} >
                                Start
              </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    overallViewContainer: {
        position: 'absolute',
        height: '100%',
        width: '100%',
    },
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    destination: {
        color: "#000",
        elevation: 1,
        width: '99%',
        height: 45,
        backgroundColor: 'white',
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 'auto',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    source: {
        color: "#000",
        elevation: 1,
        width: '99%',
        height: 45,
        borderRadius: 10,
        backgroundColor: 'white',
        marginTop: 'auto',
        marginBottom: 'auto',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    allNonMapThings: {
        alignItems: 'center',
        height: '100%',
        width: '100%'
    },
    inputContainer: {
        elevation: 1,
        backgroundColor: 'transparent',
        width: '90%',
        height: 80,
        top: 20,
    },
    button: {
        elevation: 1,
        position: 'absolute',
        bottom: 25,
        backgroundColor: '#ff6600',
        borderRadius: 10,
        width: '60%',
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOpacity: 0.75,
        shadowRadius: 1,
        shadowColor: 'gray',
        shadowOffset: { height: 0, width: 0 }
    },
    buttonText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',

    },
    wrapper: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    }



});
