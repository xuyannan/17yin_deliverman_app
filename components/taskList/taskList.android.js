'use strict';
import React, {
  StyleSheet,
  Text,
  View,
  ListView,
  Button,
  AlertIOS,
  Navigator,
  TouchableHighlight
} from 'react-native';
var Config = require('../../config');
var Order = require('../order/order.android');
var Icon = require('react-native-vector-icons/FontAwesome');
var NavigationBar = require('react-native-navbar');
var ModalBox  = require('react-native-modalbox');
var OrderProcess = require('../orderProcessForm/orderProcessForm.android')
var store = require('../store')
var yinStyles = require('../../style/style');

module.exports = React.createClass({
  getInitialState: function () {
    return {
      tasks: [],
      summary: {},
      loading: true,
      showOrderListConfig: {},
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      orderDataSource: {}
    }
  },
  componentDidMount: function () {
    let _this = this
    this.loadTasks(this.props.token);
    store.subscribe(function() {
      _this.setState({
        tasks: store.getState().tasks
      })
    });
  },
  render: function() {
    let _this = this
    let taskNaviRenderScene = function (route, navigator) {
      switch (route.id) {
        case 'taskList':
          return _this.renderTasks()
          break;
        case 'orderProcess':
          return (
            <OrderProcess order={route.order} optType={route.optType} navigator={navigator} token={route.token}/>
          )
          break;
        default:

      }
    };
    if (this.state.loading) {
      return (
        <View ref="container" style={{flex: 1}}>
          <NavigationBar
            title={{title: '待送订单'}}
            rightButton={{title: ''}} />
          <View style={yinStyles.centered}><Text><Icon name="refresh" size={16}/> 加载中，请稍候</Text></View>
        </View>

      )
    } else if (!this.state.tasks || this.state.tasks.length == 0) {
      return (
        <View ref="container" style={{flex: 1}}>
          <NavigationBar
            title={{title: '待送订单'}}
            rightButton={{title: ''}} />
          <View style={yinStyles.centered}>
            <Text><Icon name="coffee" size={16}/> 没有订单，休息一会吧</Text>
            <View style={{marginTop: 8}}>
            <Icon.Button  name="refresh" backgroundColor="#ccc" onPress={() => _this.loadTasks(_this.props.token)}>
              刷新
            </Icon.Button>
            </View>
          </View>
        </View>
      )
    } else {
      return (
        <Navigator ref="navigator"
          initialRoute={{id: 'taskList', index: 0}}
          renderScene={(route, navigator) => taskNaviRenderScene(route, navigator)}
        />
      )
    }

  },
  loadTasks: function (token) {
    var _this = this;
    _this.setState({
      loading: true
    })
    fetch(Config.API_ROOT + 'deliveryman/orders', {
      headers: {
        'Authorization': 'Basic ' + token
      }
      })
      .then((response) => (response.json()))
      .then(responseData => {
        // 默认不显示订单列表
        var _config = {}
        _this.setState({
          loading: false
        })
        if (typeof(responseData.data.tasks) === 'undefined') {
          Alert.alert('提示', '获取订单失败');
        } else {
          responseData.data.tasks.map(function (task) {
            _config[task.merchant.id] = false
          });
          this.setState({
            // tasks: responseData.data.tasks, // this.state.tasks.cloneWithRows(responseData.data.tasks),
            summary: responseData.data.summary,
            showOrderListConfig: _config
          });
          store.dispatch({
            type: 'SET_TASKS',
            tasks: responseData.data.tasks
          })
        }

      })
      .done();
  },
  renderTasks: function() {
    // AlertIOS.alert('task count', this.state.tasks)
    var dataSource = new ListView.DataSource({

      rowHasChanged: (row1, row2) => {row1 !== row2}
    });
    this.state.dataSource = dataSource.cloneWithRows(this.state.tasks)
    return (
      <View ref="container" style={{flex: 1}}>
        <NavigationBar
          title={{title: '待送订单'}}
          rightButton={{title: ''}} />
        <View ref={"view"} style={styles.container}>
          <ListView
          dataSource={this.state.dataSource}
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
  toggleOrderList: function (merchantid) {
    var _config = this.state.showOrderListConfig;
    _config[merchantid] = !_config[merchantid];
    this.setState({
      showOrderListConfig: _config
    })
  },
  renderTask: function (task) {
    var orders = new ListView.DataSource({
      rowHasChanged: (row1, row2) => {row1 !== row2;}
    });
    orders = orders.cloneWithRows(task.orders);
    var _this = this

    var renderMerchant = function () {
      return (
        <View style={styles.merchant}>
          <View style={styles.merchantTitle}>
            <View style={styles.merchateTitleLeft}>
              <Text style={styles.merchantName}>{task.merchant.name}</Text>
              <Text><Icon name="mobile" size={16}/> {task.merchant.mobile}</Text>
            </View>
            <Text style={styles.price}>{`${task.orders.length}单 ${task.payment}元`}</Text>
          </View>
          <Text><Icon name="map-marker" size={16}/> {task.merchant.address}</Text>
          <View style={{flexDirection: "row",justifyContent: "flex-end"}}>
            <TouchableHighlight onPress={()=>_this.toggleOrderList(task.merchant.id)} underlayColor='#eee'>
              <Text style={styles.buttonText}>{_this.state.showOrderListConfig[task.merchant.id] ? '收起': '展开'}</Text>
            </TouchableHighlight>
          </View>
        </View>
      )
    };
    // console.log('2222', this.state.orderDataSource[task.merchant.id]);
    // return (<View>
    //   {renderMerchant()}
    //   {task.orders.map(function(order) {
    //     console.log(order.id);
    //     return _this.renderOrder(order)
    //   })}
    // </View>
    // )
    if (_this.state.showOrderListConfig[task.merchant.id]) {
      return (<View>
        {renderMerchant()}
        <ListView
        dataSource={orders}
        renderRow={this.renderOrder}
        style={styles.listView}/>
      </View>
      )
    } else {
      return (<View>
        {renderMerchant()}
        <ListView
        dataSource={new ListView.DataSource({
          rowHasChanged: (row1, row2) => {console.log(row1, row2); row1 !== row2}
        })}
        renderRow={this.renderOrder}
        style={styles.listView}/>
      </View>
      )
    }
  },
  renderOrder: function(order) {
    let _this = this
    return (
      <View key={order.id} ref={"modal"+order.id}>
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
  merchant: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
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
  },
  notice: {flex: 1, justifyContent: 'center',alignItems: 'center'}
});
