import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  TouchableHighlight,
  ListView,
  Alert
} from 'react-native';

import MapView, { MAP_TYPES, Polygon, ProviderPropType } from 'react-native-maps';
import FAB from 'react-native-fab';
export const { width, height } = Dimensions.get('window');
export const ASPECT_RATIO = width / height;
export const LATITUDE = 41.7998046;
export const LONGITUDE = -87.5894732;
export const LATITUDE_DELTA = 0.0922;
export const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
let id = 0;

class PolygonCreator extends React.Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.playlistNames = [];
    this.playlistData = {}
    this.state = {
      spotCreated: false,
      edit: false,
      polygons: [],
      error: null,
      editing: null,
      creatingHole: false,
      mapView: true,
      selectedID : null,
      dataSource: this.ds.cloneWithRows(this.playlistNames),
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

  checkIfInSpot() {
      var spots = this.state.polygons;
      for (var i = 0; i < spots.length; i++){
        var current_location = [this.state.myPosition.latitude, this.state.myPosition.longitude]
          if(this.inside(current_location, spots[i].coordinates)){
            var postUrl = 'http://172.16.22.71:4040/api/playlists/' + spots[i].id.toString()
            fetch(postUrl, {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                }
              });
          }
      }
  }

   inside(point, vs) {
      var x = point[0], y = point[1];
      var inside = false;
      for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
          var xi = vs[i].latitude, yi = vs[i].longitude;
          var xj = vs[j].latitude, yj = vs[j].longitude;

          var intersect = ((yi > y) != (yj > y))
              && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
      }
      return inside;
};

  componentDidMount(){
    this.watchID = navigator.geolocation.watchPosition((position) => {
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
      (error) => this.setState({ error: error.message }),
      {enableHighAccuracy: true, timeout: 5000, distanceFilter: 1},
          this.checkIfInSpot()
    )
  }

  componentWillUnmount(){
      navigator.geolocation.clearWatch(this.watchID)
  }

  finish() {
    if(this.state.spotCreated){
    const { polygons, editing } = this.state;
        this.setState({
          polygons: [...polygons, editing],
          editing: null,
          creatingHole: false,
          edit: false
        });
      }
      else{
        this.setState({edit: false})
      }
      this.setState({spotCreated: false})
  }

  edit(){
    this.setState({edit: true})
  }

  createHole() {
    const { editing, creatingHole } = this.state;
    if (!creatingHole) {
      this.setState({
        creatingHole: true,
        editing: {
          ...editing,
          holes: [
            ...editing.holes,
            [],
          ],
        },
      });
    } else {
      const holes = [...editing.holes];
      if (holes[holes.length - 1].length === 0) {
        holes.pop();
        this.setState({
          editing: {
            ...editing,
            holes,
          },
        });
      }
      this.setState({ creatingHole: false });
    }
  }

  pressRow(rowData){
    var url = ""
    for (var i = 0; i < this.playlistData.items.length; i++){
      if(this.playlistData.items[i].name == rowData){
        url = this.playlistData.items[i].external_urls.spotify
      }
    }
    fetch('http://172.16.22.71:4040/api/spots/', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spotID: this.state.selectedID.toString(),
          playlistURL: url
        }),
      });
      this.setState({ mapView: true });
      this.playlistNames = []
  }

  chooseMusic(id){
    fetch('http://172.16.22.71:4040/api/playlists/', {method: "GET"})
    .then((response) => response.json())
    .then((responseJson) => {
      this.playlistData = responseJson
      for (let i = 0; i<responseJson.items.length; i++) {
             this.playlistNames.push(responseJson.items[i].name);
      }
      this.setState({dataSource: this.ds.cloneWithRows(this.playlistNames)});
      this.setState({selectedID: id });
      this.setState({ mapView: false });
    }).catch(err => {
      console.log("fuck");
    });
  }

  onRegionChange(myPosition) {
    this.setState({ myPosition });
  }

  onPress(e) {
    if(this.state.edit){
      this.setState({ spotCreated: true });
    const { editing, creatingHole } = this.state;
    if (!editing) {
      this.setState({
        editing: {
          id: id++,
          coordinates: [e.nativeEvent.coordinate],
          holes: [],
        },
      });
    } else if (!creatingHole) {
      this.setState({
        editing: {
          ...editing,
          coordinates: [
            ...editing.coordinates,
            e.nativeEvent.coordinate,
          ],
        },
      });
    } else {
      const holes = [...editing.holes];
      holes[holes.length - 1] = [
        ...holes[holes.length - 1],
        e.nativeEvent.coordinate,
      ];
      this.setState({
        editing: {
          ...editing,
          id: id++, // keep incrementing id to trigger display refresh
          coordinates: [
            ...editing.coordinates,
          ],
          holes,
        },
      });
    }
  }
  }

  renderHeader() {
    return <View style={{backgroundColor:'#81FEC4', height:60}}><Text style={{color: 'white', fontSize:20, textAlign:'center', marginTop: 20}}>Playlists</Text></View>
  }

  render() {
    const mapOptions = {
      scrollEnabled: true,
    };

    if (this.state.editing) {
      mapOptions.scrollEnabled = false;
      mapOptions.onPanDrag = e => this.onPress(e);
    }

    if(this.state.mapView){
    return (
      <View style={styles.container}>
        <MapView
          provider={this.props.provider}
          style={styles.map}
          initialRegion={this.state.myPosition}
          onPress={e => this.onPress(e)}
          onRegionChange={myPosition => this.onRegionChange(myPosition)}
          {...mapOptions}
        >
        <MapView.Marker coordinate={this.state.markerPosition}>
            <View style={styles.radius}>
                <View style={styles.marker}/>
            </View>
        </MapView.Marker>
          {this.state.polygons.map(polygon => (
            <Polygon
              key={polygon.id}
              coordinates={polygon.coordinates}
              holes={polygon.holes}
              strokeColor="#F00"
              fillColor="rgba(255,130,227,0.5)"
              strokeWidth={1}
              tappable={true}
              onPress={() => this.chooseMusic(polygon.id)}
            />
          ))}
          {this.state.editing && (
            <Polygon
              key={this.state.editing.id}
              coordinates={this.state.editing.coordinates}
              holes={this.state.editing.holes}
              strokeColor="#000"
              fillColor="rgba(255,130,227,0.5)"
              strokeWidth={1}
              tappable={true}
              onPress={() => this.chooseMusic(polygon.id)}
            />
          )}
        </MapView>
        <View style={styles.buttonContainer}>
          {!this.state.edit && (
            <FAB buttonColor="#81FEC4" iconTextColor="#FFFFFF" onClickAction={() => {this.edit()}} visible={true} />
          )}
          {this.state.edit && (
            <FAB buttonColor="#81FEC4" iconTextColor="#FFFFFF" onClickAction={() => {this.finish()}} visible={true} iconTextComponent={<Text>x</Text>}/>
          )}
        </View>
      </View>
    );
  }

  else {
    return(
      <ListView
       style={styles.listContainer}
       dataSource={this.state.dataSource}
       renderRow={(rowData) =>
       <TouchableHighlight onPress={() => this.pressRow(rowData)}>
         <View style = {styles.listRowContainer}>
           <Text style={{color: 'white', fontSize: 16, fontFamily: "Circular"}}>
             {rowData}
           </Text>
         </View>
       </TouchableHighlight>
         }
       renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator}/>}
       renderHeader={this.renderHeader}
    />
    )
  }
}

}

PolygonCreator.propTypes = {
  provider: ProviderPropType,
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -4
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  latlng: {
    width: 200,
    alignItems: 'stretch',
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 15,
    paddingHorizontal: 185,
  },
  listContainer: {    //backgroundColor: 'transparent',

    flex: 1,
  },
  listRowContainer: {
    flex: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d0f0d'
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
  },
  text: {
    marginLeft: 12,
    fontSize: 24,
  },
});

export default PolygonCreator;
