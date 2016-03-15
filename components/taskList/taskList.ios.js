'use strict';
import React, {
  StyleSheet,
  Text,
  View,
  ListView,
  Button,
  AlertIOS,
  NavigatorIOS
} from 'react-native';
var Config = require('../../config');
var Order = require('../order/order.ios');
var Icon = require('react-native-vector-icons/FontAwesome');

var ModalBox  = require('react-native-modalbox');

module.exports = React.createClass({
  getInitialState: function () {
    return {
      tasks: [],
      summary: {},
      loaded: false
    }
  },
  componentDidMount: function () {
    this.loadTasks(this.props.token);
  },
  render: function() {
    return this.renderTasks()
  },
  loadTasks: function (token) {
    fetch(Config.API_ROOT + 'deliveryman/orders?date=2016-03-12', {
      headers: {
        'Authorization': 'Basic ' + token
      }
      })
      .then((response) => (response.json()))
      .then(responseData => {

        this.setState({
          tasks: responseData.data.tasks, // this.state.tasks.cloneWithRows(responseData.data.tasks),
          summary: responseData.data.summary
        });
        // AlertIOS.alert('count', this.state.summary.tasks + '')
      })
      .done();
  },
  renderTasks: function() {
    // AlertIOS.alert('task count', this.state.tasks)
    var dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    dataSource = dataSource.cloneWithRows(this.state.tasks)
    return (
      <View ref="container" style={{flex: 1}}>
        <View ref={"view"} style={styles.container}>
          <ListView
          dataSource={dataSource}
          renderRow={this.renderTask}
          renderHeader={this.renderSummary}
          style={styles.listView}/>
        </View>
      </View>
    )
  },
  renderSummary: function() {
    return (
      <Text></Text>
    )
  },
  renderTask: function (task) {
    var orders = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    orders = orders.cloneWithRows(task.orders);
    var renderMerchant = function () {
      return (
        <View>
          <View style={styles.merchantTitle}>
            <View style={styles.merchateTitleLeft}>
              <Text style={styles.merchantName}>{task.merchant.name}</Text>
              <Text><Icon name="mobile" size={16}/> {task.merchant.mobile}</Text>
            </View>
            <Text style={styles.price}>{task.payment}</Text>
          </View>
          <Text><Icon name="map-marker" size={16}/> {task.merchant.address}</Text>
        </View>
      )
    }
    return (
      <ListView
      dataSource={orders}
      renderRow={this.renderOrder}
      renderHeader={renderMerchant}
      style={styles.listView}/>
    )
  },
  renderOrder: function(order) {
    let _this = this
    return (
      <View ref={"modal"+order.id}>
      <Order source={order} navigator={_this.refs.navigator} token={this.props['token']}></Order>
      </View>
    )
  }
});
var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    padding: 8,
    paddingBottom: 0
  },
  merchantTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 4
  },
  merchateTitleLeft: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  merchantName: {
    fontSize: 20,
    marginRight: 8
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b809e'
  },
  listView: {
    paddingTop: 0
  },
  text: {
    color: '#000',
    fontSize: 18,
  }
});
