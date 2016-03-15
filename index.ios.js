/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  AlertIOS,
  ListView,
  NavigatorIOS
} from 'react-native';

var Login = require('./components/login');
var TaskList = require('./components/taskList/taskList.ios');

var Base64 = require('base-64');

// class delivermanApp extends Component {
var delivermanApp = React.createClass({
  getInitialState: function() {
    return {
      mobile: '18600000009',
      password: '111111',
      user: {name: '小张'},
      loaded: false,
      token: 'MTg2MDAwMDAwMDk6MTExMTEx',
      summary: {}
    }
  },
  render: function () {
    if (!this.state.user) {
      return this.renderLoginForm();
    } else {
      return (
        // <TaskList token={this.state.token}></TaskList>
        <NavigatorIOS
        style={styles.container}
        tintColor='#FF6600'
        initialRoute={{
          title: '订单列表',
          component: TaskList,
          passProps: {token: this.state.token}
        }}/>
      )
    }
  },
  onUserLogin: function(user) {
    // AlertIOS.alert('用户', user.name);
    this.setState({
      user: user,
      token: user.token
    })
  },
  renderLoginForm: function () {
    return (
      <Login onUserLogin={this.onUserLogin}></Login>
    )
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

AppRegistry.registerComponent('delivermanApp', () => delivermanApp);
