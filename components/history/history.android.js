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
var GiftedListView = require('react-native-gifted-listview');
var moment = require('moment')

module.exports = React.createClass({
  getInitialState: function() {
    return {
      tasks: [],
      loading: true,
      date: moment().format('YYYY-MM-DD'),
      switchingDate: false
    }
  },
  loadHistory: function (page = 1, callback, options) {
    var _this = this
    fetch(`${Config.API_ROOT}deliveryman/orders/history?per=20&page=${page}`, {
      headers: {
        'Authorization': 'Basic ' + this.props.token
      }
    }).then((response) => (response.json()))
    .then((responseData) => {
      _this.setState({loading: false});
      if (typeof(responseData.data.tasks) === 'undefined') {
        Alert.alert('提示','加载出错')
      } else {
        // _this.setState({
        //   tasks: responseData.data.tasks
        // })
        callback(responseData.data.tasks, {
          allLoaded: responseData.data.tasks.length == 0
        })
      }
    }).done()
  },
  renderNaviHeader: function () {
    return (
    <NavigationBar
      title={{title: '配送历史'}}
      rightButton={{title: ''}} />
    )
  },
  goToDate: function (date) {
    this.setState({
      switchingDate: true
    });
    this.setState({
      date: date,
      switchingDate: false
    });
  },
  goToNextDate: function () {
    var date = moment(this.state.date).add(1, 'day').format('YYYY-MM-DD');
    this.goToDate(date);
  },
  goToPrevDate: function () {
    var date = moment(this.state.date).add(-1, 'day').format('YYYY-MM-DD');
    this.goToDate(date);
  },
  render: function () {
    if (this.state.switchingDate) {
      return (<View></View>)
    } else {
      return (
        <View style={{flex: 1}}>
          {this.renderNaviHeader()}
          <View style={yinStyles.container}>
            <GiftedListView
            onFetch={this.loadHistory}
            rowView={this.renderOrder}
            />
          </View>
        </View>
      )
    }

    // if (this.state.loading) {
    //   return (
    //     <View style={{flex: 1}}>
    //       {this.renderNaviHeader()}
    //       <View style={yinStyles.centered}><Text><Icon name="refresh" size={16}/> 加载中，请稍候</Text></View>
    //     </View>
    //   )
    // } else if (this.state.tasks.length == 0) {
    //   return (
    //     <View style={{flex: 1}}>
    //       {this.renderNaviHeader()}
    //       <View style={yinStyles.centered}><Text><Icon name="coffee" size={16}/> 无历史信息</Text></View>
    //     </View>
    //   )
    // } else {
    //   var orders = new ListView.DataSource({
    //     rowHasChanged: (row1, row2) => {row1 !== row2;}
    //   });
    //   orders = orders.cloneWithRows(this.state.tasks)
    //   console.log(this.state.tasks);
    //   console.log(orders);
    //   return  (
    //     <View style={{flex: 1}}>
    //       {this.renderNaviHeader()}
    //       <View style={yinStyles.container}>
    //         <ListView
    //         dataSource={orders}
    //         renderRow={this.renderOrder}
    //         />
    //       </View>
    //     </View>
    //   )
    // }
  },
  renderOrder: function(order) {
    return (
      <View key={order.id}>
      <Order source={order} token={this.props['token']}></Order>
      </View>
    )
  }
});
var styles = StyleSheet.create({
  dateNavi: {
    padding: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
})
