'use strict'
import React, {
  StyleSheet,
  Text,
  View,
  ListView,
  Button,
  Navigator,
  Alert,
  TouchableHighlight,
  AsyncStorage
} from 'react-native';
var Config = require('../../config');
var Icon = require('react-native-vector-icons/FontAwesome');
var NavigationBar = require('react-native-navbar');
var yinStyles = require('../../style/style');
var Constants = require('../../constants');
var store = require('../store')

module.exports = React.createClass({
  getInitialState: function () {
    return {
      user: {name: ''}
    }
  },
  componentDidMount: function () {
    var _this = this
    AsyncStorage.getItem(Constants.STORAGE_USER_KEY).then(function (res) {
      _this.setState({
        user: JSON.parse(res)
      })
    }).done();
  },
  render: function () {
    return (
      <View style={{flex: 1}}>
        <NavigationBar
          title={{title: '设置'}}
          rightButton={{title: ''}} />
        <View>
          <View style={yinStyles.menuItem}>
            <Text>Hello {this.state.user.name}</Text>
          </View>
          <TouchableHighlight onPress={this.logout} underlayColor='#eee' style={yinStyles.menuItem}>
            <Text><Icon name="sign-out" size={16}/> 退出当前账号</Text>
          </TouchableHighlight>
        </View>
      </View>
    )
  },
  logout: function () {
    var _this = this;
    var _logout = function () {
      AsyncStorage.removeItem(Constants.STORAGE_USER_KEY, (error, res) => {
        if (error) {
          Alert.alert('提示', '退出失败')
        } else {
          console.log('退出成功');
          store.dispatch({
            type: 'CLEAR_DATA'
          });
        }
      })
    };
    Alert.alert('提示', '确定退出?',
    [
      {text: '确定', onPress: () => _logout()},
      {text: '取消'}
    ]
    )
  }
});
