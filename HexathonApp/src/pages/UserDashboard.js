
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform,
    Image,
    AsyncStorage

} from 'react-native';


import axios from 'axios';
import MapView, { Marker } from 'react-native-maps';
import Polyline from '@mapbox/polyline';
import { getCurrentLocation } from '../services/LocationService';
import { PermissionsHelper } from '../services/Functions/PermissionHelper';
import firebase from 'react-native-firebase'
import RNLocation from "react-native-location";
import Sound from 'react-native-sound';
// const screen = Dimensions.get('window');

// const ASPECT_RATIO = screen.width / screen.height;
// const LATITUDE_DELTA = 0.0922;
// const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
let counter = 0


export default class UserDashboardScreen extends Component {

    constructor(props) {
        super(props)
        this.state = {
            coords: [],
            source: undefined,
            destination: undefined,
            unitCoordinate:undefined,
            eventId: undefined
        }
    }
    notificationListener = () => {};
    async componentDidMount() {
        // find your origin and destination point coordinates and pass it to our method.
        // I am using Bursa,TR -> Istanbul,TR for this example
        /*
    * Triggered when a particular notification has been received in foreground
    * */
    this.notificationListener = firebase.notifications().onNotification(async(notification) => {
        console.log("Inside onNotification in UserDashboard::", notification);
          const { title, body } = notification;
       let loginType = await AsyncStorage.getItem('loginType');
       if (loginType == "user") {
         var whoosh = new Sound('buzzer.mp3', Sound.MAIN_BUNDLE, (error) => {
           if (error) {
             console.log('failed to load the sound', error);
             return;
           }
 
 
           whoosh.play((success) => {
             if (success) {
               console.log('successfully finished playing');
             } else {
               console.log('playback failed due to audio decoding errors');
             }
           });
         });
         whoosh.setNumberOfLoops(-1);
         whoosh.stop(() => {
           // Note: If you want to play a sound after stopping and rewinding it,
           // it is important to call play() in a callback.
           whoosh.play();
         });
         whoosh.release();
 
         Alert.alert(title, body, [{text:'OK', onPress:()=>{
            let obj = JSON.parse(body)
             let source = obj && obj.source && obj.source.location
             let destination = obj && obj.destination && obj.destination.location
             let unit = obj && obj.currentLocation
             if (source && destination && unit) {
            this.setState({
                source:source,
                destination:destination,
                unitCoordinate:unit
            },()=>{
                console.log("1111111")
                this.getNewDirectionOnTapNotifications()
            }) }else{
                console.log("It not a trip notification")
            }
            
         }}]);
       }
 
     });

        const permission = await PermissionsHelper.requestPermission("location", "Enable Location Services", "Please go to settings and enable location services");
        if (permission) {
            getCurrentLocation().then((currentLocation) => {
                console.log("current location:::", currentLocation);
                // this.setState({
                //     unitCoordinate:currentLocation
                // })
                // /this.getDirections("17.3850, 78.4867", "17.1883,79.2000");
            }).catch((error) => {
                console.log("Failed to fetch location", error);
            })
        } else {
            Alert.alert("Failed to fetch location. Please try again");
        }

        RNLocation.configure({
            distanceFilter: 5.0
          }).then(() => RNLocation.requestPermission({
            ios: "whenInUse",
            android: {
              detail: "fine",
              rationale: {
                title: "Location permission",
                message: "We use your location to demo the project",
                buttonPositive: "OK",
                buttonNegative: "Cancel"
              }
            }
          })).then(granted => {
            if (granted) {
              //this._startUpdatingLocation();
            }
          });
    }
    

    
      _startUpdatingLocation = () => {
        this.locationSubscription = RNLocation.subscribeToLocationUpdates(
          locations => {
              let loc = {
                latitude:locations[0].latitude,
                longitude:locations[0].longitude
            }
            this.setState({ unitCoordinate: loc });
          }
        );
      };
    
      _stopUpdatingLocation = () => {
        this.locationSubscription && this.locationSubscription();
        this.setState({ location: null });
      };
    

    
    async getDirections(startLoc, destinationLoc) {
        console.log("getDirections:::")
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
            console.log(error);
            return error
        }
    }


    getNewDirectionOnTapNotifications = () => {
   
        if (this.state.source && this.state.destination) {
            let src = `${this.state.source.latitude}, ${this.state.source.longitude}`;
            let dest = `${this.state.destination.latitude}, ${this.state.destination.longitude}`;
            this.getDirections(src,dest);
        }else{
            console.log("source or destination missing");
        }
    }


    getUnitLocation = async (loc) => {

        console.log("getUnitLocation")
        let username = await AsyncStorage.getItem('username');
        let url = "https://us-central1-ems-4-bce4c.cloudfunctions.net/webApi/api/v1/getUnitLocation";
            let body = {
                unitId: username,
            }

            let headers = {
                "Content-Type": "application/json"
            }

            axios.post(url, body, { headers: headers }).then(async(response) => {
                console.log("location updated::", response);
            }).catch((error) => {
                console.log("getUnitLocation failed::", error);
                Alert.alert("getUnitLocation Failed","getUnitLocation Failed. Please try again");
            });

    } 


    performLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?",[
            {text: 'YES', onPress: async() => {
                let username = await AsyncStorage.getItem('username');
                let loginType = await AsyncStorage.getItem('loginType');
                let url = "https://us-central1-ems-4-bce4c.cloudfunctions.net/webApi/api/v1/logout";
                    let body = {
                        username: username,
                        type: loginType
                    }

                    let headers = {
                        "Content-Type": "application/json"
                    }

                    axios.post(url, body, { headers: headers }).then(async(response) => {
                        console.log("Logout successful::", response);
                        this.props.navigation.goBack();
                    }).catch((error) => {
                        console.log("Logout failed::", error);
                        Alert.alert("Logout Failed","Logout Failed. Please try again");
                    });
            }}, {text: 'NO', onPress: () => {

            }
        }
        ],{cancelable: false}  );
    }
    render() {
        let source = this.state.source 
        let destination = this.state.destination 
        let unit = this.state.unitCoordinate 
        console.log(unit)
        return (
            <View style={styles.overallViewContainer}>

                <MapView
                    style={styles.container}
                    initialRegion={{
                        latitude: unit && unit.latitude || 17.3850,
                        longitude: unit && unit.longitude || 78.4867,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421
                    }}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    zoomEnabled={true}
                    scrollEnabled={true}
                >
                  {source &&  <Marker
                        coordinate={source}
                        title={"Source"}
                        description={"hoeeo"}
                  /> }
                   {destination && <Marker
                        coordinate={destination}
                        title={"Destination"}
                        description={"hoeeo"}
                    />}
                    {unit && <Marker
                        ref={marker => {
                            this.marker = marker;
                          }}              
                        title={"Unit"}
                        description={"hoeeo"}
                        image={require('./ems.png')}
                        coordinate={unit}
                    /> }
                    <MapView.Polyline
                        coordinates={this.state.coords}
                        strokeWidth={3}
                        strokeColor="red" />
                </MapView>
                <View style={styles.allNonMapThings}>
                    <TouchableOpacity style={{width:"100%",justifyContent:'flex-end'}} onPress={this.performLogout}>
                        <Image style={{ width: 40, height: 40,margin:5,backgroundColor:'#EDF2F2', alignSelf:'flex-end' }}
                            source={require('../images/logout.png')} />
                    </TouchableOpacity>
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
