import { Alert, Platform } from 'react-native';
import Permissions from 'react-native-permissions';
import AndroidOpenSettings from 'react-native-android-open-settings'
class PermissionsHelper {

    private static async handleIOS(response: string, permissionType: string, title: string, message: string): Promise<boolean> {
        let result: boolean = false;

        if (response === "undetermined") {
            await Permissions.request(permissionType).then((permission: string) => {
                result = (permission === "authorized");
            }).catch((error: any) => {
                result = false;
            });
        } else if (response === "denied") {
            result = false;
            Alert.alert(
                title,
                message,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Settings',
                        onPress: (() => {
                            Permissions.openSettings();
                        })
                    }
                ],
            )
        } else {
            result = true;
        }

        return result;
    }

    private static async handleAndroid(response: string, permissionType: string, title: string, message: string): Promise<boolean> {
        let result: boolean = false;

        if (response === "undetermined" || response === "denied") {
            await Permissions.request(permissionType).then((permission: string) => {
                result = (permission === "authorized");
            }).catch((error: any) => {
                result = false;
            });
        } else if (response === "restricted") {
            result = false;
            Alert.alert(
                title,
                message,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Settings',
                        onPress: (() => {
                            AndroidOpenSettings.appDetailsSettings()
                        })
                    }
                ],
            )
        } else {
            result = true;
        }

        return result;
    }

    public static async requestPermission(permissionType: string, title: string, message: string): Promise<boolean> {
        let result: boolean = false;
        await Permissions.check(permissionType)
            .then(async (response: string) => {

                if (Platform.OS === "android")
                    result = await this.handleAndroid(response, permissionType, title, message);
                else
                    result = await this.handleIOS(response, permissionType, title, message);

            }).catch((error: string) => {
                result = false;
            });

        return result;
    }

    public static async requestMultiplePermissions(permissions: { permissionType: string, title: string, message: string }[]): Promise<boolean> {
        let result: boolean = false;
        
        var permissionsLength = permissions.length;

        for(var i = 0 ;i < permissionsLength; i ++) {
            const {permissionType, title, message} = permissions[i];
            await Permissions.check(permissionType)
            .then(async (response: string) => {

                if (Platform.OS === "android")
                    result = await this.handleAndroid(response, permissionType, title, message);
                else
                    result = await this.handleIOS(response, permissionType, title, message);

            }).catch((error: string) => {
                result = false;
            });

            if(!result)
                break;
        }

        return result;
    }
}

export { PermissionsHelper };
