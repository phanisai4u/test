
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
import MapView, { Marker,AnimatedRegion } from 'react-native-maps';
import Polyline from '@mapbox/polyline';
import { getCurrentLocation } from '../services/LocationService';
import { PermissionsHelper } from '../services/Functions/PermissionHelper';
import firebase from 'react-native-firebase'
// const screen = Dimensions.get('window');

// const ASPECT_RATIO = screen.width / screen.height;
// const LATITUDE_DELTA = 0.0922;
// const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
let counter = 0


export default class DirectionsScreen extends Component {

    constructor(props) {
        super(props)
        this.state = {
            coords: [],
            source: undefined,
            destination: undefined,
            uintCoordinate:undefined,
            eventId: undefined
        }
    }

    async componentDidMount() {
        // find your origin and destination point coordinates and pass it to our method.
        // I am using Bursa,TR -> Istanbul,TR for this example
        const permission = await PermissionsHelper.requestPermission("location", "Enable Location Services", "Please go to settings and enable location services");
        if (permission) {
            getCurrentLocation().then((currentLocation) => {
                console.log("current location:::", currentLocation);
                this.setState({
                    uintCoordinate:currentLocation
                })
                // /this.getDirections("17.3850, 78.4867", "17.1883,79.2000");
            }).catch((error) => {
                console.log("Failed to fetch location", error);
            })
        } else {
            Alert.alert("Failed to fetch location. Please try again");
        }
    }

    startEvent = async () => {
        let username = await AsyncStorage.getItem('username');

        const event = {
            "createdBy": username,
            "eventId":"12233444",
            "currentLocation": this.state.unitCoordinate,
            "destination": {
                "location": this.state.destination,
                "name": this.state.destinationLocationInput
            },
            "source": {
                "location": this.state.source,
                "name": this.state.sourceLocationInput
            },
            "status": "RUNNING",
            "unit": username
        }

           let url = "https://us-central1-ems-4-bce4c.cloudfunctions.net/webApi/api/v1/startTrip";
            let body = {
                ...event
            }

            let headers = {
                "Content-Type": "application/json"
            }

            axios.post(url, body, { headers: headers }).then(async(response) => {
                console.log("Trip started successful:", response);
                this.setState({
                    eventId:event.eventId
                })
                
            }).catch((error) => {
                console.log(error)
                Alert.alert("Error","event create Failed. Please try again");
            });
    }

    endEvent = async () => {
        let username = await AsyncStorage.getItem('username');

        const event = {
            "createdBy": username,
            "eventId":"12233444",
            "unit": username
        }

           let url = "https://us-central1-ems-4-bce4c.cloudfunctions.net/webApi/api/v1/startTrip";
            let body = {
                ...event
            }

            let headers = {
                "Content-Type": "application/json"
            }

            axios.post(url, body, { headers: headers }).then(async(response) => {
                console.log("Trip end successful:", response);
                this.setState({
                    eventId:undefined,
                    destination:undefined,
                    source:undefined,
                    sourceLocationInput:"",
                    destinationLocationInput:"",
                    coords:[]
                })
                
            }).catch((error) => {
                console.log(error)
                Alert.alert("Error","event end Failed. Please try again");
            });
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
                    source: { latitude: locationInfo.latitude, longitude: locationInfo.longitude },
                    sourceLocationInput: locationInfo.locationString
                },() => {
                    this.getNewDirectionOnChangeLocations();
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
                    destination: { latitude: locationInfo.latitude, longitude: locationInfo.longitude },
                    destinationLocationInput: locationInfo.locationString
                },() => {
                    this.getNewDirectionOnChangeLocations()
                })
            }
        });
    }

    getNewDirectionOnChangeLocations = () => {
   
        if (this.state.source && this.state.destination) {
            let src = `${this.state.source.latitude}, ${this.state.source.longitude}`;
            let dest = `${this.state.destination.latitude}, ${this.state.destination.longitude}`;
            this.getDirections(src,dest);
        }else{
            console.log("source or destination missing");
        }

       
    }

    mockEventChange = () => {
      console.log("mockEventChange")
        let count = this.state.coords.length - 1;
        if (count > 0 && counter >= 0 && counter <= count) {
            console.log(counter)
            console.log(count)
            setTimeout(() => {
                let point = this.state.coords[counter]
                console.log(point)
                this.setState({
                    uintCoordinate:new AnimatedRegion( {latitude: point.latitude,
                        longitude: point.longitude,
                    })
               }, () => {
                    console.log(this.state.uintCoordinate);
                   this.animate()
                   this.mockEventChange()
                })
                counter = counter + 1;
            }, 2000)
        }
    }

    animate = () => {
        const { uintCoordinate } = this.state;
        // const newCoordinate = {
        //   latitude: LATITUDE + (Math.random() - 0.5) * (LATITUDE_DELTA / 2),
        //   longitude: LONGITUDE + (Math.random() - 0.5) * (LONGITUDE_DELTA / 2),
        // };

            if (this.marker) {
                this.marker._component.animateMarkerToCoordinate(uintCoordinate, 500);
            }
       
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
        let eventId = this.state.eventId
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
                    {unit && <Marker.Animated
                        ref={marker => {
                            this.marker = marker;
                          }}              
                        title={"Unit"}
                        description={"hoeeo"}
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
                    { !eventId &&
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
                        </View> }

                      {  eventId ? <View style={styles.button} >
                        <TouchableOpacity onPress={this.endEvent}>
                            <Text style={styles.buttonText} >
                                End Event
                           </Text>
                        </TouchableOpacity>
                    </View>
                    :   <View style={styles.button} >
                    <TouchableOpacity onPress={this.startEvent}>
                        <Text style={styles.buttonText} >
                            Start Event
                       </Text>
                    </TouchableOpacity>
                    </View> }
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
