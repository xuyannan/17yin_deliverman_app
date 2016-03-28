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
  View,
  Navigator,
  Image,
  AsyncStorage
} from 'react-native';
var Login = require('../components/login');
var TaskList = require('../components/taskList/taskList.android');
var Constants = require('../constants')
var Icon = require('react-native-vector-icons/FontAwesome');
var moment = require('moment')
// var TabNavigator = require('react-native-tab-navigator').default;
import TabNavigator from 'react-native-tab-navigator';
var Balance = require('../components/balance/balance.android');
var History = require('../components/history/history.android');
var Setting = require('../components/setting/setting.android');
var MerchantMap = require('../components/merchants/merchant.map.android');
import { connect } from 'react-redux';
var store = require('../components/store');

var _navigator;
// class delivermanApp extends Component {
module.exports = React.createClass({
  componentDidMount: function () {
    var _this = this
    AsyncStorage.getItem(Constants.STORAGE_USER_KEY).then(function (res) {
      _this.setState({
        user: JSON.parse(res)
      })
    }).done();
    store.subscribe(function () {
      if (store.getState().user === null) {
        try {
          _this.setState({
            user: null
          })
        } catch(e) {}
      }
    });
  },
  getInitialState: function (){
    return {
      user: null,
      loaded: false,
      selectedTab: 'tasks'
    }
  },
  render: function() {
    let _this = this;
    var _renderApp = function () {
      if (!this.state.user) {
        return this.renderLoginForm();
      } else {
        return (
          <TabNavigator ref="tabbar">
            <TabNavigator.Item
              selected={this.state.selectedTab === 'tasks'}
              title="待送订单"
              renderIcon={() => <Icon name="tasks" size={16}/>}
              renderSelectedIcon={() => <Icon name="tasks" size={16} color="#1182fe"/>}
              badgeText=""
              onPress={() => this.setState({ selectedTab: 'tasks' })}>
              <TaskList token={this.state.user.token}></TaskList>
            </TabNavigator.Item>

            <TabNavigator.Item
              selected={this.state.selectedTab === 'history'}
              title="配送历史"
              renderIcon={() => <Icon name="history" size={16}/>}
              renderSelectedIcon={() => <Icon name="history" size={16} color="#1182fe"/>}
              badgeText=""
              onPress={() => this.setState({ selectedTab: 'history' })}>
              <History token={this.state.user.token}/>
            </TabNavigator.Item>

            <TabNavigator.Item
              selected={this.state.selectedTab === 'balance'}
              title="对账"
              renderIcon={() => <Icon name="check-circle-o" size={16}/>}
              renderSelectedIcon={() => <Icon name="check-circle-o" size={16} color="#1182fe"/>}
              badgeText=""
              onPress={() => this.setState({ selectedTab: 'balance' })}>
              <Balance date={moment().format('YYYY-MM-DD')} token={this.state.user.token}></Balance>
            </TabNavigator.Item>

            <TabNavigator.Item
              selected={this.state.selectedTab === 'account'}
              title="设置"
              renderIcon={() => <Icon name="cogs" size={16}/>}
              renderSelectedIcon={() => <Icon name="cogs" size={16} color="#1182fe"/>}
              badgeText=""
              onPress={() => this.setState({ selectedTab: 'account' })}>
              <Setting navigator={_this.refs.navigator}/>
            </TabNavigator.Item>
          </TabNavigator>
        )
      }
    };
    let naviRenderScene = function(route, navigator) {
      switch (route.id) {
        case 'app':
          return _renderApp.bind(_this)();
          break;
        default:

      }
    };
    return (
      <Navigator ref="navigator"
        initialRoute={{id: 'app', index: 0}}
        renderScene={(route, navigator) => naviRenderScene(route, navigator)}
      />
    );

  },

  renderLoginForm: function () {
    return (
      <Login onUserLogin={this.onUserLogin}></Login>
    )
  },

  onUserLogin: function(user) {
    // AlertIOS.alert('用户', user.name);
    console.log(user.name);
    this.setState({
      user: user,
      token: user.token,
      selectedTab: 'tasks'
    })
  }
});

var styles = StyleSheet.create({
  container: {
    // flex: 1
  },
  navigationBar: {backgroundColor: '#F00', height: 20}
});
