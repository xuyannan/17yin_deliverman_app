'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Navigator,
} from 'react-native';

var Config = require('../../config');
var Icon = require('react-native-vector-icons/FontAwesome');
var NavigationBar = require('react-native-navbar');
var moment = require('moment')

module.exports = React.createClass({
  getInitialState: function () {
    return {
      balance: null,
      date: this.props.date
    }
  },
  componentDidMount: function () {
    this.goToDate(this.props.date)
  },
  goToDate: function (date) {
    this.setState({
      date: date
    });
    fetch(`${Config.API_ROOT}deliveryman/cashflow/balance?date=${this.state.date}`, {
      headers: {
        'Authorization': 'Basic ' + this.props['token']
      }
    })
    .then((response) => (response.json()))
    .then((responseData) => {
      this.setState({
        balance: responseData.data
      })
    }).done()
  },
  goToNextDate: function () {
    var date = moment(this.state.date).add(1, 'day').format('YYYY-MM-DD');
    this.goToDate(date);
  },
  goToPrevDate: function () {
    var date = moment(this.state.date).add(-1, 'day').format('YYYY-MM-DD');
    this.goToDate(date);
  },
  renderBalance: function () {
    if (this.state.balance) {
      return (
        <View style={styles.container}>
          <NavigationBar
            title={{title: '对账'}}
            leftButton={{title: ''}} />
          <View style={styles.dateNavi}>
            <Icon name="chevron-left" size={32} onPress={this.goToPrevDate}/>
            <Text style={{fontSize: 32}}>{this.state.balance.date}</Text>
            <Icon name="chevron-right" size={32} onPress={this.goToNextDate}/>
          </View>
          <View style={styles.balance}><Text style={{fontSize: 64, fontWeight: "bold"}}>{this.state.balance.cash_income}</Text></View>
        </View>
      )
    } else {
      return (
        <View><Text>Loading</Text></View>
      )
    }
  },
  render: function () {
    let _this = this
    let balanceNaviRenderScene = function (route, navigator) {
      switch (route.id) {
        case 'balance':
          return _this.renderBalance()
          break;
        default:

      }
    };
    return (
      <Navigator ref="navigator"
      initialRoute={{id: 'balance'}}
      renderScene={(route, navigator) => balanceNaviRenderScene(route, navigator)}
      />
    )
  }
});

var styles = StyleSheet.create({
  container: {flex: 1},
  dateNavi: {
    padding: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  balance: {
    flexDirection: "row",
    justifyContent: "center"
  }
});
