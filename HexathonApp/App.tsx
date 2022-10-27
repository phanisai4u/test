/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */


//Added for sample git commit
import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Alert,
  AsyncStorage,
} from 'react-native';
import Sound from 'react-native-sound';
import firebase from 'react-native-firebase';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import FormLogin from './src/components/FormLogin';
import FormSignup from './src/components/FormSignup';
import DirectionsScreen from './src/pages/DirectionsPresentations'
import LocationSeachPage from "./src/components/LocationSearchPage";
import UserDashboardScreen from "./src/pages/UserDashboard"


const MainNavigator = createStackNavigator({
  Login: {
    screen: FormLogin,
    navigationOptions: {
      title: 'Login',
      headerTitleStyle: {
        textAlign: "center",
        color:"#4f83cc",
        flex: 1
      }
    }
  },
  SignUp: {
    screen: FormSignup,
    navigationOptions: {
      title: 'Signup',
      headerTitleStyle: {
        textAlign: "center",
        color:"#4f83cc",
        flex: 1
      }
    }
  },
  Dashboard: {
    screen: DirectionsScreen,
    navigationOptions: {
      title: 'Dashboard',
      headerTitleStyle: {
        textAlign: "center",
        color:"#4f83cc",
        flex: 1
      },
      headerLeft: null
    }
  },
  LocationSeachPage: {
    screen: LocationSeachPage,
    navigationOptions: {
      title: 'Search location',
      headerTitleStyle: {
        textAlign: "center",
        color:"#4f83cc",
        flex: 1
      }
    }
  },
  UserDashboard: {
    screen: UserDashboardScreen,
    navigationOptions: {
      title: 'Dashboard',
      headerTitleStyle: {
        textAlign: "center",
        color:"#4f83cc",
        flex: 1
      },
      headerLeft: null
    }
  }
},

  {
    initialRouteName: 'Login',
  },
);



export default class App extends Component {

  checkPermission = async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    }
    else {
      this.requestPermission();
    };
  }

  //2
  requestPermission = async () => {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
      this.getToken();
    } catch (error) {
      // User has rejected permissions
      console.log('permission rejected');
    }
  }
  notificationListener: () => any;
  notificationOpenedListener: () => any;
  messageListener: () => any;

  componentDidMount() {
    this.checkPermission();
    this.createNotificationListeners();
  }

  //Remove listeners allocated in createNotificationListeners()
  componentWillUnmount() {
    this.notificationListener();
    this.notificationOpenedListener();
  }

  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        // user has a device token
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    }
    console.log("fcmToken", fcmToken);
  }

  createNotificationListeners = async () => {
    /*
    * Triggered when a particular notification has been received in foreground
    * */
    this.notificationListener = firebase.notifications().onNotification((notification) => {
       console.log("Inside onNotification::", notification);
    });

    /*
    * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
    * */
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
      console.log("Inside onNotificationOpened::", notificationOpen);
      const { title, body } = notificationOpen.notification;
      this.showAlert(title, body);
    });

    /*
    * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    * */
    const notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
      console.log("Inside onNotificationOpened::", notificationOpen);
      const { title, body } = notificationOpen.notification;
      this.showAlert(title, body);
    }
    /*
    * Triggered for data only payload in foreground
    * */
    this.messageListener = firebase.messaging().onMessage((message) => {
      console.log("Inside onNotificationOpened::", message);
      //process data message
      console.log(JSON.stringify(message));
    });
  }

  showAlert = (title, body) => {
    Alert.alert(
      title, body,
      [
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ],
      { cancelable: false },
    );
  }

  render() {

    const AppContainer = createAppContainer(MainNavigator);

    return (
      <AppContainer />
    );
  }
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: "lightgray",
  },
  body: {
    backgroundColor: "white",
  }

});
