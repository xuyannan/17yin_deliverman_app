'use strict';
import React, {
  StyleSheet,
  Text,
  View,
  ListView,
  Alert,
  Modal,
  TextInput,
  TouchableHighlight,
  Platform
} from 'react-native';
var Config = require('../../config');
var Icon = require('react-native-vector-icons/FontAwesome');
var tweenState = require('react-tween-state');
var store  = require('../store')

module.exports = React.createClass({
  mixins: [tweenState.Mixin],
  getInitialState: function () {
    return {
      order: this.props['source'],
      modalVisible: false,
      optType: 'not_arrived', // 订单操作类型
      reason: '',
      showTracelogList: false
    }
  },
  componentDidMount: function () {

  },
  renderProcessButtons: function() {
    switch (this.state.order.workflow_state) {
      case 'deadline':
        return (
          <Text></Text>
        )
        break;
      case 'ready_to_ship':
        var order = this.state.order.id
        return (
          <View style={styles.buttons}>
            <View style={styles.buttonContainer}>
              <Icon.Button style={styles.button} name="rocket" backgroundColor="#337ab7" onPress={() => this.processOrder(this.state.order.id, 'ship')}>
                配送中
              </Icon.Button>
            </View>
            <View style={styles.buttonContainer}>
              <Icon.Button style={styles.button} name="warning" backgroundColor="#d9534f" onPress={() => this.openModal('not_arrived')}>
                未能接货
              </Icon.Button>
            </View>
          </View>
        )
        break;
      case 'shipping':
        return (
          <View style={styles.buttons}>
            <View style={styles.buttonContainer}>
              <Icon.Button style={styles.button} name="check" backgroundColor="#5cb85c" onPress={() => this.processOrder(this.state.order.id, 'finish')}>
                配送完成
              </Icon.Button>
            </View>
            <View style={styles.buttonContainer}>
              <Icon.Button style={styles.button} name="warning" backgroundColor="#f0ad4e" onPress={() => this.openModal('finish_with_exception')}>
                配送异常
              </Icon.Button>
            </View>
          </View>
        )
        break;
      default:
    }
  },
  submitOrder: function(orderid, action, memo) {
    var _this = this;
    var url = 'deliveryman/orders/' + orderid + '/procedure/' + action

    fetch(Config.API_ROOT + url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + _this.props['token'],
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
        ,
        body: JSON.stringify({
          extra: !!memo ? memo : ''
        })
      })
      .then((response) => (response.json()))
      .then(responseData => {
        if (responseData.message) {
          Alert.alert('提示', responseData.message)
        } else {
          store.dispatch({
            type: 'DELETE_ORDER',
            orderid: orderid
          })
          _this.closeModal()
        }
      })
      .catch((error) => {
        console.log(error)
      })
      .done();
  },
  processOrder: function(orderid, action, memo) {
    var _this = this;
    Alert.alert('提示', '是否确认进行此操作?', [
      {
        text: '确认',
        onPress: function() {
          _this.submitOrder(orderid, action, memo)
        }
      },
      {
        text: '取消',
        style: 'cancel'
      }
    ])

  },
  renderOrderState: function () {
    switch (this.state.order.workflow_state) {
      case 'deadline':
        return (
          <Text style={styles.state}><Icon name="tasks" size={16}/> 印刷中</Text>
        )
        break;
      case 'ready_to_ship':
        return (
          <Text style={styles.state}><Icon name="truck" size={16}/> 出库中</Text>
        )
        break;
      case 'delay_to_ship':
        return (
          <Text style={styles.state}><Icon name="tasks" size={16}/> 出库中(延迟)</Text>
        )
        break;
      case 'finished':
        return (
          <Text style={styles.state}><Icon name="check" size={16}/> 已完成</Text>
        )
        break;
      case 'shipping':
        return (
          <Text style={styles.state}><Icon name="rocket" size={16}/> 配送中</Text>
        )
        break;
      default:

    }
  },
  render: function () {
    var _this = this
    var toggleTracelogList = function () {
      _this.setState({
        showTracelogList: !_this.state.showTracelogList
      })
    }
    var _this = this;
    var desc = this.state.order.description_list;
    var renderTraceLogHeader = function() {
      return(<View style={styles.logsHeader}><Text onPress={toggleTracelogList}>历史记录</Text></View>)
    };
    var renderTraceLogs = function() {
      var dataSource = new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      });
      dataSource = dataSource.cloneWithRows(_this.state.order.trace_logs)
      if (_this.state.showTracelogList) {
        return (
          <View ref="tracelogList">
            <ListView
              style={styles.listView}
              dataSource={dataSource}
              renderRow={function(log) { return (
                <View style={styles.log}><Text style={[styles.fontColorGray]}>{log.content}</Text></View>
              )}}
            >
            </ListView>
          </View>
        );
      } else {
        return (<Text></Text>)
      }

    };
    return (
      <View style={[styles.order, (this.state.order.workflow_state === 'finished') && styles.orderFinished]}>
        <View style={styles.title}>
          <Text style={[styles.fontSize18, styles.fontWeightBold, styles.fontColorBlue]}>{this.state.order.product_name}</Text>
          <Text style={[styles.fontSize18, styles.fontColorBlue]}>{this.state.order.price}</Text>
        </View>
        <View style={styles.idAndState}>
          <Text style={styles.id}>{this.state.order.id}</Text>
          {this.renderOrderState()}
        </View>
        <View style={styles.content}>
          {Object.keys(desc).map(function(key, i){
            return (
              <Text key={i}>{key}: {desc[key]}</Text>
            )
          })}
        </View>
        <View>
          {this.renderProcessButtons()}
        </View>
        {renderTraceLogHeader()}
        {renderTraceLogs()}
      </View>
    )
  },
  closeModal: function() {
    if (Platform.OS === 'ios') {
      this.setState({
        modalVisible: false
      })
    }
  },
  openModal: function(optType) {
    let _this = this
    if (Platform.OS === 'ios') {
      this.setState({
        modalVisible: true,
        optType: optType
      })
    } else {
      let navigator = this.props['navigator'];
      navigator.push({
        id: 'orderProcess',
        navigator: navigator,
        order: this.state.order,
        optType: optType,
        token: _this.props['token']
      })
    }

  }
});

var styles = StyleSheet.create({
  order: {
    flex: 1,
    borderWidth: 1,
    borderTopWidth: 4,
    borderColor: '#1b809e',
    padding: 8,
    borderRadius: 2,
    marginTop: 10
  },
  orderFinished: {
    borderColor: '#ccc'
  },
  text: {
    // flex: 1
  },
  title: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  idAndState: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4
  },
  id: {
    fontSize: 16
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  buttonContainer: {
    marginLeft: 8
  },
  button: {
  },
  state: {
    color: 'green'
  },
  price: {marginTop: 6},
  fontSize18: {fontSize: 18},
  fontColorBlue: {color: '#1b809e'},
  fontWeightBold: {fontWeight: 'bold'},
  fontColorGray: {color: '#ccc'},
  content: {
    marginTop: 6
  },
  modal: {flex: 1},
  innerModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, .7)',
    justifyContent: 'flex-end'
  },
  textInput: {
    height: 40, borderWidth: 1, marginTop:20, marginBottom: 20,
    borderColor: '#ccc',
    borderRadius: 2,
    padding: 4,
    color: '#333'
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 18
  },
  reasonButtons: {
    flexDirection: 'row'
  },
  reasonButton: {
    borderWidth: 1,
    paddingTop: 4,
    paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 4,
    marginRight: 8,
    borderRadius: 2,
    borderColor: '#333'
  },
  formTitle: {
    color: "#42b983",
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom:6
  },
  logsHeader: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    backgroundColor: '#f5f5f5'
  },
  listView: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopWidth: 0
  },
  log: {
    borderColor: '#ddd',
    padding: 4,
    borderBottomWidth: 1
  }
});
