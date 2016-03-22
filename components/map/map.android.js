'use strict'
import React, {
  StyleSheet,
  View,
  Alert,
  WebView
} from 'react-native';

import BaiduMap from 'baidumapkit';
var Config = require('../../config')

module.exports = React.createClass({
  render: function () {
    let merchant = this.props.merchant;
    let url = `${Config.MAP_URL}${merchant.id}/?lng=${merchant.coordinate.lng}&lat=${merchant.coordinate.lat}&name=${merchant.name}&address=${merchant.address}`;
    console.log(url);
    return (
      <View style={{flex: 1}}>
        <BaiduMap
          style={{flex: 1}}
          maker={[
            [39.963175, 116.440244]
          ]}
          mode={1}
        />
      </View>
    )
  }
});
