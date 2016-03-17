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
var Login = require('./components/login');
var TaskList = require('./components/taskList/taskList.android');
var Constants = require('./constants')
var Icon = require('react-native-vector-icons/FontAwesome');
var moment = require('moment')
// var TabNavigator = require('react-native-tab-navigator').default;
import TabNavigator from 'react-native-tab-navigator';
var Balance = require('./components/balance/balance.android');
import { connect } from 'react-redux';

var _navigator;
// class delivermanApp extends Component {
var delivermanApp = React.createClass({
  componentDidMount: function () {
    var _this = this
    AsyncStorage.getItem(Constants.STORAGE_USER_KEY).then(function (res) {
      _this.setState({
        user: JSON.parse(res)
      })
    }).done();
  },
  getInitialState: function (){
    return {
      user: null,
      loaded: false,
      selectedTab: 'tasks'
    }
  },
  render: function() {
    if (!this.state.user) {
      return this.renderLoginForm();
    } else {
      var renderTaskList = function () {
        return (<TaskList navigator={navigator} token={this.state.user.token}></TaskList>)
      };
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
            selected={this.state.selectedTab === 'balance'}
            title="对账"
            renderIcon={() => <Icon name="check-circle-o" size={16}/>}
            renderSelectedIcon={() => <Icon name="check-circle-o" size={16} color="#1182fe"/>}
            badgeText=""
            onPress={() => this.setState({ selectedTab: 'balance' })}>
            <Balance date={moment().format('YYYY-MM-DD')} token={this.state.user.token} navigator={navigator}></Balance>
          </TabNavigator.Item>

          <TabNavigator.Item
            selected={this.state.selectedTab === 'map'}
            title="地图"
            renderIcon={() => <Icon name="map" size={16}/>}
            renderSelectedIcon={() => <Icon name="map" size={16} color="#1182fe"/>}
            badgeText=""
            onPress={() => this.setState({ selectedTab: 'map' })}>
            <View><Text>map</Text></View>
          </TabNavigator.Item>

          <TabNavigator.Item
            selected={this.state.selectedTab === 'account'}
            title="个人"
            renderIcon={() => <Icon name="user" size={16}/>}
            renderSelectedIcon={() => <Icon name="user" size={16} color="#1182fe"/>}
            badgeText=""
            onPress={() => this.setState({ selectedTab: 'account' })}>
            <View><Text>account</Text></View>
          </TabNavigator.Item>
        </TabNavigator>
      )
    }
  },
  navigatorRenderScene: function(route, navigator){
    _navigator = navigator;
    switch (route.id) {
      case 'TaskList':
        return (<TaskList title={route.title} navigator={navigator} token={this.state.user.token}></TaskList>);
      // case 'Post':
      //   return (<Post navigator={navigator}
      //                 title={route.title}
      //                 post={route.post}/>);
      // case 'Web':
      //     return (
      //       <View style={{flex: 1}}>
      //           <ToolbarAndroid style={styles.toolbar}
      //                           title={route.title}
      //                           navIcon={{uri: "ic_arrow_back_white_24dp", isStatic: true}}
      //                           onIconClicked={navigator.pop}
      //                           titleColor={'#FFFFFF'}/>
      //           <WebView source={{uri: route.url}}
      //                    javaScriptEnabled={true}/>
      //       </View>
      //     );
    }
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
      token: user.token
    })
  }
});

var styles = StyleSheet.create({
  container: {
    // flex: 1
  },
  navigationBar: {backgroundColor: '#F00', height: 20}
});

AppRegistry.registerComponent('delivermanApp', () => delivermanApp);
