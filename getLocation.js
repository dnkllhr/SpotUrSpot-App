import React from 'react';
import MapView, { MAP_TYPES, Polygon, ProviderPropType } from 'react-native-maps';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, ListView, Alert} from 'react-native';

export const { width, height } = Dimensions.get('window');
export const ASPECT_RATIO = width / height;
export const LATITUDE = 37.78825;
export const LONGITUDE = -122.4324;
export const LATITUDE_DELTA = 0.0922;
export const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

class getLocation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            myPosition: {
              latitude: LATITUDE,
              longitude: LONGITUDE,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            },

            markerPosition:{
                latitude: LATITUDE,
                longitude: LONGITUDE,
            }
        };
    }

    watchID: ?number = null

    componentDidMount(){
        navigator.geolocation.getCurrentPosition((position)=>{
            var lat = parseFloat(position.coords.latitude)
            var long = parseFloat(position.coords.longitude)
            var newPosition = {
                latitude: lat,
                longitude: long,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA
            }

            this.setState({myPosition: newPosition})
            this.setState({markerPosition: newPosition})
        },
        (error) => alert(JSON.stringify(error)),
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000})
        this.watchID = navigator.geolocation.watchPosition((position) => {
            var lat = parseFloat(position.coords.latitude)
            var long = parseFloat(position.coords.longitude)

            var newPosition = {
                latitude: lat,
                longitude: long,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA
            }

            if(this.state.myPosition.latitude - newPosition.latitude > 1){
                Alert.alert(
                    'Position Changed',
                )
            }

            this.setState({myPosition: newPosition})
            this.setState({markerPosition: newPosition})
        })
    }

    componentWillUnmount(){
        navigator.geolocation.clearWatch(this.watchID)
    }
    render(){
        return(
        <View style={styles.container}>
            <MapView style={styles.map}
            region={this.state.myPosition}>
                <MapView.Marker coordinate={this.state.markerPosition}>
                    <View style={styles.radius}>
                        <View style={styles.marker}/>
                    </View>
                </MapView.Marker>
            </MapView>
        </View>
        );
    }

}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },

    map:{
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        position: 'absolute',
    },

    radius:{
        height: 50,
        width: 50,
        borderRadius: 50/2,
        overflow: 'hidden',
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(0, 112, 255, 0.3)',
        alignItems: 'center',
        justifyContent: 'center'
    },

    marker:{
        height: 20,
        width: 20,
        borderWidth: 3,
        borderColor: 'white',
        borderRadius: 20/2,
        overflow: 'hidden',
        backgroundColor: '#007AFF'
    }
})

export default getLocation;
