import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ListView
} from 'react-native';

import MapView, { MAP_TYPES, Polygon, ProviderPropType } from 'react-native-maps';
import * as constants from './getLocation';

let id = 0;


class PolygonCreator extends React.Component {
  constructor(props) {
    super(props);
    //this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    // this.playlists = [];
    this.state = {
      region: {
        latitude: constants.LATITUDE,
        longitude: constants.LONGITUDE,
        latitudeDelta: constants.LATITUDE_DELTA,
        longitudeDelta: constants.LONGITUDE_DELTA,
      },
      polygons: [],
      editing: null,
      creatingHole: false,
      mapView: true,
      selectedID : null,
      playlists: [],
      item: null
      //dataSource: this.ds.cloneWithRows(this.playlists)
    };
  }

  finish() {
    const { polygons, editing } = this.state;
    this.setState({
      polygons: [...polygons, editing],
      editing: null,
      creatingHole: false,
    });
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



  chooseMusic(id){
    var item1 = "test";
    fetch('http://httpbin.org/get', {method: "GET"}).then((response) => response.json())
    .then((responseJson) => {
      item1 = "not test";
    })
     // for(var i = 0; i < items.length; i += 1){
     //   this.setState({ playlists: playlists.push(items[i]["name"])});
     // }
    this.setState({item : item1});
    //this.setState({dataSource: this.ds.cloneWithRows(this.playlists)});
    this.setState({ mapView: false });
    this.setState({selectedID: id });
  }

  onPress(e) {
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
          initialRegion={this.state.region}
          onPress={e => this.onPress(e)}
          {...mapOptions}
        >
          {this.state.polygons.map(polygon => (
            <Polygon
              key={polygon.id}
              coordinates={polygon.coordinates}
              holes={polygon.holes}
              strokeColor="#F00"
              fillColor="rgba(255,0,0,0.5)"
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
              fillColor="rgba(255,0,0,0.5)"
              strokeWidth={1}
            />
          )}
        </MapView>
        <View style={styles.buttonContainer}>
          {this.state.editing && (
            <TouchableOpacity
              onPress={() => this.createHole()}
              style={[styles.bubble, styles.button]}
            >
              <Text>{this.state.creatingHole ? 'Finish Hole' : 'Create Hole'}</Text>
            </TouchableOpacity>
          )}
          {this.state.editing && (
            <TouchableOpacity
              onPress={() => this.finish()}
              style={[styles.bubble, styles.button]}
            >
              <Text>Finish</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  else {
    return(
      <View>
      <Text>
        {this.state.item}
      </Text>
      </View>
    //   <ListView
    //    dataSource={this.state.dataSource}
    //    renderRow={(rowData) =>
    //    <TouchableHighlight underlayColor = '#E9F7FD'>
    //      <View>
    //        <Text>
    //          {rowData}
    //        </Text>
    //      </View>
    //    </TouchableHighlight>
    //      }
    //    renderSeparator={(sectionId, rowId) => <View key={rowId} />}
    // />
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
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
});

export default PolygonCreator;
