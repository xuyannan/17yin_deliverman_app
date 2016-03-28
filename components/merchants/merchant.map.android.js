'use strict'
import React, {
  StyleSheet,
  View,
  Alert,
  WebView,
  Text,
  DeviceEventEmitter,
  BackAndroid
} from 'react-native';

import BaiduMap from 'baidumapkit';
var Config = require('../../config');
var Icon = require('react-native-vector-icons/FontAwesome');
var store = require('../store.js');
var NavigationBar = require('react-native-navbar');

module.exports = React.createClass({
  getInitialState: function() {
    let markers = store.getState().tasks.map(function(task) {
      let marker = {
        coordinate: {
          lat: parseFloat(task.merchant.coordinate.lat), lng: parseFloat(task.merchant.coordinate.lng)
        },
        info: task.merchant.name,
        showInfo: true,
        draggable: false
      }
      return JSON.stringify(marker);
    });
    return {
      markers: markers
    }
  },
  render: function () {
    return (
      <View style={{flex: 1}}>
        <NavigationBar
          title={{title: '门店地图'}}
          rightButton={{title: ''}} />
        <BaiduMap
          style={{height: 400}}
          marker={this.state.markers}
          mode={1}
          locationEnabled={true}
          showZoomControls={false}
          trafficEnabled={true}
        />
      </View>
    )
  }
});
