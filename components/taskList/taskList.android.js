'use strict';
import React, {
  StyleSheet,
  Text,
  View,
  ListView,
  Button,
  Alert,
  Navigator,
  TouchableHighlight,
  TouchableOpacity,
  TouchableNativeFeedback,
  Clipboard
} from 'react-native';
var Config = require('../../config');
var Order = require('../order/order.android');
var Icon = require('react-native-vector-icons/FontAwesome');
var NavigationBar = require('react-native-navbar');
var ModalBox  = require('react-native-modalbox');
var OrderProcess = require('../orderProcessForm/orderProcessForm.android')
var store = require('../store')
var yinStyles = require('../../style/style');
var Communications = require('react-native-communications');
var Map = require('../map/map.android');
// var Interceptor = require('../interceptor');

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
  renderNaviHeader: function () {
    // var _this = this;
    // var rightButtonConfig = {
    //   title: '刷新',
    //   handler: function onNext() {
    //     _this.loadTasks(_this.props.token)
    //   }
    // };
    return (
      <NavigationBar
        title={{title: '待送订单'}}
        rightButton={{title: '刷新', handler: ()=> this.loadTasks(this.props.token)}}
      />
    )
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
          case 'map':
            return (
              <Map merchant={route.merchant} markers={route.markers} token={route.token} navigator={navigator}/>
            )
            break;
        default:

      }
    };
    if (this.state.loading) {
      return (
        <View ref="container" style={{flex: 1}}>
          {this.renderNaviHeader()}
          <View style={yinStyles.centered}><Text><Icon name="refresh" size={16}/> 加载中，请稍候</Text></View>
        </View>

      )
    } else if (!this.state.tasks || this.state.tasks.length == 0) {
      return (
        <View ref="container" style={{flex: 1}}>
          {this.renderNaviHeader()}
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
  openMap: function(merchant) {
    var navigator = this.refs.navigator;
    var markers = [];
    this.state.tasks.map(function (task) {
      console.log(task.merchant.name);
      if (task.merchant.coordinate) {
        markers.push({
          coordinate: {
            lat: task.merchant.coordinate.lat,
            lng: task.merchant.coordinate.lng
          },
          info: task.merchant.name,
          merchantId: task.merchant.id,
          draggable: false,
          selected: task.merchant.id === merchant.id
        });
      }
    });
    // 如果没有座标，初始化一个
    console.log('merchant.coordinate', merchant.coordinate === null);
    if (merchant.coordinate === null) {
      markers.push({
        coordinate: 'null',
        merchantId: merchant.id,
        info: merchant.name,
        draggable: false,
        selected: true
      })
    }
    // console.log('merchant.coordinate', markers, merchant.coordinate);
    console.log('all markers', markers);
    navigator.push({
      id: 'map',
      merchant: merchant,
      markers: markers,
      token: this.props.token,
      navigator: navigator
    })
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
        if (typeof(responseData.data) === 'undefined') {
          Alert.alert('提示', '出现错误，请确认您有访问权限')
          return false
        }
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
        {this.renderNaviHeader()}
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
  async _setClipboardContent(str){
    Clipboard.setString(str);
    Alert.alert('提示','内容已复制到剪贴板');
  },
  renderTask: function (task) {
    var orders = new ListView.DataSource({
      rowHasChanged: (row1, row2) => {row1 !== row2;}
    });
    orders = orders.cloneWithRows(task.orders);
    var _this = this
    // task.merchant.coordinate = null;

    var renderMerchant = function () {
      return (
        <View style={styles.merchant}>
          <View style={styles.merchantTitle}>
            <View style={styles.merchateTitleLeft}>
              <TouchableHighlight onLongPress={()=> _this._setClipboardContent(task.merchant.name)} onPress={()=> _this.openMap(task.merchant)} underlayColor='#ccc'>
                <View style={{flexDirection: 'row'}}><Text style={[styles.merchantName, {color: '#22a1c4'}]}>{task.merchant.fake_name}</Text><Text style={styles.merchantName}>{task.merchant.name}</Text></View>
              </TouchableHighlight>
            </View>
            <Text style={styles.price}>{`${task.orders.length}单 ${task.payment}元`}</Text>
          </View>
          <TouchableOpacity onPress={() => Communications.phonecall(task.merchant.mobile, true)}>
            <Text><Icon name="mobile" size={16}/> {task.merchant.mobile}</Text>
          </TouchableOpacity>
          <TouchableHighlight onLongPress={()=> _this._setClipboardContent(task.merchant.address)} onPress={()=> _this.openMap(task.merchant)} underlayColor='#ccc'><View><Text style={{fontSize: 18}}><Icon name={task.merchant.coordinate ? "map-marker" : "question-circle"} size={16}/> {task.merchant.address}</Text></View></TouchableHighlight>
          <View style={{flexDirection: "row",justifyContent: "flex-end"}}>
            <TouchableHighlight onPress={()=>_this.toggleOrderList(task.merchant.id)} underlayColor='#eee' style={{borderWidth: 1, borderColor: "#eee", borderRadius: 2, padding: 2}}>
              <Text>{_this.state.showOrderListConfig[task.merchant.id] ? '- 收起': '+ 展开'}</Text>
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
    borderBottomColor: '#eee',
    paddingBottom:4
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
    marginRight: 8,
    fontWeight: "bold"
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
