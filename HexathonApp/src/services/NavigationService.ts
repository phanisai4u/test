import { NavigationActions, DrawerActions, NavigationContainerComponent, NavigationNavigateActionPayload } from 'react-navigation';
import { Keyboard } from 'react-native';

let _navigator:NavigationContainerComponent;

function setTopLevelNavigator(navigatorRef:NavigationContainerComponent) {
  _navigator = navigatorRef;
}

function navigate(routeName:string, params:any) {
  var navigationActionPayload : NavigationNavigateActionPayload = {
    routeName,
    params
  }
  _navigator.dispatch(
    NavigationActions.navigate(navigationActionPayload)
  );
}

function toggleDrawer() {
  Keyboard.dismiss();
  _navigator.dispatch(DrawerActions.toggleDrawer());
}

function closeDrawer() {
  _navigator.dispatch(DrawerActions.closeDrawer());
}

function goBack() {
  _navigator.dispatch(NavigationActions.back());
}

// add other navigation functions that you need and export them

export default {
  navigate,
  setTopLevelNavigator,
  toggleDrawer,
  closeDrawer,
  goBack
};