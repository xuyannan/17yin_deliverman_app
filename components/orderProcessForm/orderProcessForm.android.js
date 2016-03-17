'use strict';
import React, {
  StyleSheet,
  Text,
  View,
  Alert,
  TextInput,
  TouchableHighlight,
  Platform
} from 'react-native';
var Icon = require('react-native-vector-icons/FontAwesome');
var NavigationBar = require('react-native-navbar');
var Config = require('../../config');
var store = require('../store');
module.exports = React.createClass({
  getInitialState: function () {
    return {
      order: this.props['order'],
      optType: this.props['optType'],
      reason: ''
    }
  },
  render: function() {
    var orderStatus = {
      'not_arrived': {
        title: '未能接货',
        reasons: ['物流未送达', '未生产', '其他'],
        option: 'not_arrived'
      },
      'finish_with_exception': {
        title: '配送异常',
        reasons: ['偏色', '印错', '其他'],
        option: 'finish'
      }
    };
    let _this = this;

    let reasons = orderStatus[this.props['optType']].reasons;
    let event = orderStatus[this.props['optType']].option

    return (
      <View style={{flex: 1}}>
        <NavigationBar
          title={{title: '订单处理'}}
          leftButton={{title: '返回', handler: ()=> _this.props.navigator.pop()}} />
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>订单处理</Text>
          <Text>{this.state.order.id}</Text>
          <View style={styles.reasonButtons}>
          {Object.keys(reasons).map(function(key, i){
            return (
              <TouchableHighlight key={i} style={styles.reasonButton} onPress={() => _this.setState({reason : reasons[key]})} underlayColor='#ccc'>
                <Text style={styles.buttonText}>{reasons[key]}</Text>
              </TouchableHighlight>
            )
          })}
          </View>
          <TextInput style={styles.textInput}
            onChangeText={(text) => this.setState({reason: text})}
            placeholderText="请输入原因"
            placeholderTextColor="#ccc"
            value={_this.state.reason}
          ></TextInput>
          <View style={styles.buttons}>
            <View style={styles.buttonContainer}>
              <Icon.Button style={styles.button} name="check" backgroundColor="#5cb85c" onPress={() => _this.submitOrder(_this.props.order.id, event, this.state.reason)}>
                确认
              </Icon.Button>
            </View>
            <View style={styles.buttonContainer}>
              <Icon.Button style={styles.button} name="ban" backgroundColor="#d9534f" onPress={_this.closeModal}>
                取消
              </Icon.Button>
            </View>
          </View>
        </View>
      </View>
    )
  },
  closeModal: function () {
    this.props.navigator.pop();
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
          // _this.setState({
          //   order: responseData.data,
          //   modalVisible: false
          // });
          store.dispatch({
            type: 'DELETE_ORDER',
            orderid: orderid
          });
          _this.closeModal();
        }
      })
      .catch((error) => {
        console.log(error)
      })
      .done();
  }
});

var styles = StyleSheet.create({
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
