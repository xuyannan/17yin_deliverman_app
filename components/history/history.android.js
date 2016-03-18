'use strict'
'use strict';
import React, {
  StyleSheet,
  Text,
  View,
  ListView,
  Button,
  Navigator,
  TouchableHighlight
} from 'react-native';
var Config = require('../../config');
var Order = require('../order/order.android');
var Icon = require('react-native-vector-icons/FontAwesome');
var NavigationBar = require('react-native-navbar');
var ModalBox  = require('react-native-modalbox');
var OrderProcess = require('../orderProcessForm/orderProcessForm.android');
var store = require('../store');
var yinStyles = require('../../style/style');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      tasks: [],
      loading: true
    }
  },
  componentDidMount: function () {
    this.loadHistory();
  },
  loadHistory: function () {
    var _this = this
    fetch(`${Config.API_ROOT}deliveryman/orders/history?per=10000`, {
      headers: {
        'Authorization': 'Basic ' + this.props.token
      }
    }).then((response) => (response.json()))
    .then((responseData) => {
      _this.setState({loading: false});
      if (typeof(responseData.data.tasks) === 'undefined') {
        Alert.alert('提示','加载出错')
      } else {
        _this.setState({
          tasks: responseData.data.tasks
        })
      }
    })
  },
  renderNaviHeader: function () {
    return (
    <NavigationBar
      title={{title: '配送历史'}}
      rightButton={{title: ''}} />
    )
  },
  render: function () {
    if (this.state.loading) {
      return (
        <View style={{flex: 1}}>
          {this.renderNaviHeader()}
          <View style={yinStyles.centered}><Text><Icon name="refresh" size={16}/> 加载中，请稍候</Text></View>
        </View>
      )
    } else if (this.state.tasks.length == 0) {
      return (
        <View style={{flex: 1}}>
          {this.renderNaviHeader()}
          <View style={yinStyles.centered}><Text><Icon name="coffee" size={16}/> 无历史信息</Text></View>
        </View>
      )
    } else {
      var orders = new ListView.DataSource({
        rowHasChanged: (row1, row2) => {row1 !== row2;}
      });
      orders = orders.cloneWithRows(this.state.tasks)
      console.log(this.state.tasks);
      console.log(orders);
      return  (
        <View style={{flex: 1}}>
          {this.renderNaviHeader()}
          <View style={yinStyles.container}>
            <ListView
            dataSource={orders}
            renderRow={this.renderOrder}
            />
          </View>
        </View>
      )
    }
  },
  renderOrder: function(order) {
    return (
      <View key={order.id}>
      <Order source={order} token={this.props['token']}></Order>
      </View>
    )
  }
});
