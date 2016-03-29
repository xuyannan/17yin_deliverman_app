'use strict';
import React, {
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  AlertIOS,
  Image,
  AsyncStorage,
  Alert
} from 'react-native';

var Base64 = require('base-64');
var Config = require('../config');
var Constants = require('../constants');
var store = require('./store');

var Login = React.createClass({
  getInitialState: function() {
    return {
      mobile: '',
      password: '',
      processig: false
    }
  },
  render: function() {
    let _this = this;
    let _renderBotton = function () {
      if (_this.state.processig) {
        return (
          <TouchableHighlight style={[styles.button, styles.disabledButton]} underlayColor='#42e47e'>
            <Text style={styles.buttonText}>处理中...</Text>
          </TouchableHighlight>
        )
      } else {
        return (
          <TouchableHighlight style={[styles.button, styles.submitButton]} onPress={_this.submit} underlayColor='#42e47e'>
            <Text style={styles.buttonText}>登录</Text>
          </TouchableHighlight>
        )
      }
    };
    return (
      <View style={styles.container}>
        <Image source={require('../img/logo.png')}/>
        <TextInput style={styles.textInput}
          onChangeText={(text) => this.setState({mobile: text})}
          value={this.state.mobile}
          placeholder="请输入手机号码"
          placeholderTextColor="#ccc"
        ></TextInput>

        <TextInput style={styles.textInput}
          onChangeText={(text) => this.setState({password: text})}
          placeholder="请输入密码"
          placeholderTextColor="#ccc"
          secureTextEntry={1==1}
          value={this.state.password}
        ></TextInput>
        <View style={styles.buttonContainer}>
        {_renderBotton()}
        </View>
      </View>
    )
  },
  submit: function () {
    this.login()
  },
  login: function () {
    let token = Base64.encode(this.state.mobile + ':' + this.state.password);
    let authority = {
      deliveryman: true
    };
    this.setState({processig: true});
    fetch(Config.API_ROOT + 'login', {
      headers: {
        'Authorization': 'Basic ' + token
      }
      })
      .then((response) => (response.json()))
      .then(responseData => {
        if (typeof(responseData.data) === 'undefined') {
          Alert.alert('提示', '登录失败，请确认您的用户名和密码');
          this.setState({processig: false});
          return false;
        }
        var user = Object.assign({}, responseData.data);
        if (user && authority[user.state]) {
          user.token = token;
          this.props.onUserLogin(user);
          AsyncStorage.setItem(Constants.STORAGE_USER_KEY, JSON.stringify(user))
          store.dispatch({
            type: 'SET_USER',
            user: user
          })
        } else {
          Alert.alert('提示', 'sorry，您暂时没有访问权限');
        }
        this.setState({processig: false});
      })
      .done();
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    padding: 20
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  textInput: {
    height: 40, borderColor: 'gray', borderWidth: 1, marginTop:20,
    borderRadius: 2,
    padding: 4,
    color: '#333'
  },
  buttonContainer: {
		//  flex: 1, //1
		alignSelf: 'stretch',
		justifyContent: 'center'
	},
  button: {
    marginTop: 20,
    height: 49,
		backgroundColor: '#4cae4c',
		justifyContent: 'center',
		alignSelf: 'stretch',
    alignItems: 'center',
    borderRadius: 2
  },
  submitButton: {
		backgroundColor: '#4cae4c',
  },
  disabledButton: {
    backgroundColor: '#CCC'
  },
  buttonText: {
		fontSize: 18,
		color: '#FFF'
  }
})

module.exports = Login;
