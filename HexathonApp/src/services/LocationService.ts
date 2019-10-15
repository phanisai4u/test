import Geocoder from 'react-native-geocoder';
import Geolocation from 'react-native-geolocation-service'

const defaultOptions = { enableHighAccuracy: true, timeout: 20000 };

/**
 * Model for returned address from native platform geocode service
 */
export interface GeoLocationAddress {
    position: { lat: number, lng: number },
    formattedAddress: string
    feature: string | null
    streetNumber: string | null,
    streetName: string | null,
    postalCode: string | null,
    locality: string | null,
    country: string,
    countryCode: string,
    adminArea: string | null
    subAdminArea: string | null,
    subLocality: string | null
}

/**
 * contains success status and address from the native platform geocode service * 
 */
export interface GeoServiceResponse {
    isSuccess: boolean,
    address?: GeoLocationAddress,
    error: any
}

/**
 * Below interfaces are taken from navigator.geolocation interfaces.
 */

/**
 * Applicable options
 */
export interface GeoOptions {
    timeout?: number;
    maximumAge?: number;
    enableHighAccuracy?: boolean;
};

/**
 * Model of position object.
 */
export interface GeoPosition {
    coords: {
        latitude: number;
        longitude: number;
        altitude: number | null;
        accuracy: number | null;
        altitudeAccuracy: number | null;
        heading: number | null;
        speed: number | null;
    };
    timestamp: number;
};

/**
 * Error format.
 */
export interface GeolocationError {
    code: number;
    message: string;
};

/**
* Fetches current Position
*  @param {GeoOptions} options object of GeoOptions
* @returns {Promise<any>} It returns Promise, GeoPosition on success or GeolocationError on failure
*/
const getCurrentPosition = async (options?: GeoOptions): Promise<any> => {
    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition((position: any) => {
            resolve(position);
        }, (error: GeolocationError) => {
            reject(error);
        }, (options ? options : defaultOptions));
    });
}

/**
 * Fetches current Positions's Address
 * @param {GeoOptions } options
 * @returns {Promise<GeoServiceResponse>} It returns Promise of GeoServiceResponse.
 * GeoServiceResponse.address not null, then GeoServiceResponse.isSuccess=true and GeoServiceResponse.error is null
 * GeoServiceResponse.address is null, then GeoServiceResponse.isSuccess=false and GeoServiceResponse.error is not null
 */
const getCurrentLocation = async (options?: GeoOptions): Promise<GeoServiceResponse> => {
    let serviceResponse = { isSuccess: false, address: undefined, error: undefined } as GeoServiceResponse;
    await getCurrentPosition(options).then(async (position: GeoPosition) => {
        serviceResponse = await getLocationFromPosition(position);
    }).catch((error: GeolocationError) => {
        serviceResponse.error = error;
    });

    return serviceResponse;
}

/**
 * Fetches address for given GeoPosition.
 * It performs reverse geo-code on platform level and returns the address for given input.
 * @param {GeoPosition } position
 * @returns {Promise<GeoServiceResponse>} It returns Promise of GeoServiceResponse.
 * GeoServiceResponse.address not null, then GeoServiceResponse.isSuccess=true and GeoServiceResponse.error is null
 * GeoServiceResponse.address is null, then GeoServiceResponse.isSuccess=false and GeoServiceResponse.error is not null
 */
const getLocationFromPosition = async (position: GeoPosition): Promise<GeoServiceResponse> => {
    let serviceResponse = { isSuccess: false, address: undefined, error: undefined } as GeoServiceResponse;
    if (!position || !position.coords || !position.coords.latitude || !position.coords.longitude) {
        serviceResponse.error = "invalid position: {latitude, longitude} required";
    } else {
        var pos = { lat: position.coords.latitude, lng: position.coords.longitude };
        await Geocoder.geocodePosition(pos).then((address: any) => {
            if (address && address.length > 0) {
                serviceResponse.isSuccess = true;
                serviceResponse.address = address[0] as GeoLocationAddress;
            } else {
                serviceResponse.error = "Address not found";
            }
        }).catch((error: any) => {
            serviceResponse.error = error;
        });
    }

    return serviceResponse;
}

export { getCurrentPosition, getCurrentLocation, getLocationFromPosition }