'use strict'
import React, {
  StyleSheet,
  View,
  Alert,
  WebView
} from 'react-native';
var Config = require('../../config')

module.exports = React.createClass({
  render: function () {
    let merchant = this.props.merchant;
    let url = `${Config.MAP_URL}${merchant.id}/?lng=${merchant.coordinate.lng}&lat=${merchant.coordinate.lat}&name=${merchant.name}&address=${merchant.address}`;
    console.log(url);
    return (
      <View style={{flex: 1}}>
        <WebView
          ref="map-container"
          automaticallyAdjustContentInsets={false}
          style={{width: 700}}
          url={url}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          decelerationRate="normal"
          scalesPageToFit={false}
        />
      </View>
    )
  }
});
