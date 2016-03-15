'use strict';
import React, {
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  AlertIOS,
  Image,
  AsyncStorage
} from 'react-native';

var Base64 = require('base-64')
var Config = require('../config')
var Constants = require('../constants')

var Login = React.createClass({
  getInitialState: function() {
    return {
      mobile: '18600000009',
      password: '111111'
    }
  },
  render: function() {
    return (
      <View style={styles.container}>
        <Image source={require('../img/logo.png')}/>
        <TextInput style={styles.textInput}
          onChangeText={(text) => this.setState({mobile: text})}
          value={this.state.mobile}
        ></TextInput>

        <TextInput style={styles.textInput}
          onChangeText={(text) => this.setState({password: text})}
          placeholderText="请输入密码"
          placeholderTextColor="#ccc"
          secureTextEntry={1==1}
          value={this.state.password}
        ></TextInput>
        <View style={styles.buttonContainer}>
        <TouchableHighlight style={styles.submitButton} onPress={this.submit} underlayColor='#42e47e'>
          <Text style={styles.buttonText}>提交</Text>
        </TouchableHighlight>
        </View>
      </View>
    )
  },
  submit: function () {
    this.login()
  },
  login: function () {
    let token = Base64.encode(this.state.mobile + ':' + this.state.password)
    fetch(Config.API_ROOT + 'login', {
      headers: {
        'Authorization': 'Basic ' + token
      }
      })
      .then((response) => (response.json()))
      .then(responseData => {
        var user = responseData.data;
        user.token = token;
        this.props.onUserLogin(user);
        AsyncStorage.setItem(Constants.STORAGE_USER_KEY, JSON.stringify(user))
        // this.loadTasks();
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
  submitButton: {
    marginTop: 20,
    height: 49,
		backgroundColor: '#4cae4c',
		justifyContent: 'center',
		alignSelf: 'stretch',
    alignItems: 'center',
    borderRadius: 2
  },
  buttonText: {
		fontSize: 18,
		color: '#FFF'
  }
})

module.exports = Login;
