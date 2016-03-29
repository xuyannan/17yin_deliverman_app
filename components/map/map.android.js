'use strict'
import React, {
  StyleSheet,
  View,
  Alert,
  WebView,
  Text,
  DeviceEventEmitter,
  BackAndroid
} from 'react-native';

import BaiduMap from 'baidumapkit';
var Config = require('../../config');
var Icon = require('react-native-vector-icons/FontAwesome');

module.exports = React.createClass({
  getInitialState: function () {
    return {
      markers: [],
      marker: {},
      marking: false,
      newCoordinate: null,
      processing: false,
      myLocation: null
    }
  },
  componentWillMount: function () {
    let _this = this;
    DeviceEventEmitter.addListener('markerDragEnd', function(e: Event) {
      console.log('marker drag end', e);
      _this.setState({
        newCoordinate: e
      })
    });

    DeviceEventEmitter.addListener('onGetMyLocation', function(e: Event) {
      console.log('get my location', e);
      _this.setState({
        myLocation: e
      })
    });
  },
  componentDidMount: function () {
    let merchant = this.props.merchant;
    // let coord = [[parseFloat(merchant.coordinate.lat), parseFloat(merchant.coordinate.lng)]];
    let marker = null;
    if (merchant.coordinate) {
      marker = {
        coordinate: {lat: parseFloat(merchant.coordinate.lat), lng: parseFloat(merchant.coordinate.lng)},
        info: merchant.name,
        showInfo: true,
        draggable: false
      };
    }

    this.setState({
      markers: merchant.coordinate ? [JSON.stringify(marker)] : null,
      marker: marker
    });
    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.props.navigator.pop();
      return true;
    });
  },
  setMarkable: function () {
    let merchant = this.props.merchant;
    Alert.alert('提示', '长按红色位置图标2秒钟后即可拖动。拖动到正确位置后，点击"保存"即可');
    if (merchant.coordinate) {
      let m = Object.assign({}, this.state.marker);
      m.showInfo = false;
      m.draggable = true;
      this.setState({
        markers: [JSON.stringify(m)],
        marker: m,
        marking: true
        // newCoordinate: {lat: parseFloat(merchant.coordinate.lat), lng: parseFloat(merchant.coordinate.lng)}
      });
    } else {
      this.setState({
        markers: null,
        marker: null,
        marking: true
      });
    }

  },
  cancelMark: function () {
    if (this.state.marker) {
      let m = Object.assign({}, this.state.marker);
      this.setState({
        markers: [JSON.stringify(m)],
        marking: false,
        marker: m
      })
    } else {
      this.setState({
        markers: null,
        marking: false,
        marker: null
      })
    }

  },
  saveCoodinate: function () {
    let _this = this;
    let url = `users/${_this.props.merchant.id}/coordinate`;
    let _submit = function () {
      _this.setState({processing: true});
      fetch(Config.API_ROOT + url, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + _this.props['token'],
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
          ,
          body: JSON.stringify({
            lng: _this.state.newCoordinate.lng,
            lat: _this.state.newCoordinate.lat,
            provider: 'baidu',
            axis: 'bd09ll'
          })
        })
        .then((response) => (response.json()))
        .then(responseData => {
          _this.setState({processing: false});
          if (responseData.message) {
            Alert.alert('提示', responseData.message + '，请确认是否进行了标注？')
          } else {
            let _marker;
            if (_this.state.marker) {
              _marker = Object.assign({}, _this.state.marker);
              _marker.coordinate = _this.state.newCoordinate;
              _marker.draggable = false;
              _marker.showInfo = true;
            } else {
              _marker = {
                coordinate: _this.state.newCoordinate,
                info: _this.props.merchant.name,
                showInfo: true,
                draggable: false
              }
            }
            _this.setState({
              marker: _marker,
              markers: [JSON.stringify(_marker)],
              marking: false
            });
            Alert.alert('提示', '标注成功');
          }
        })
        .catch((error) => {
          console.log(error);
          _this.setState({processing: false, marking: false});
        })
        .done();
    };


    if (this.state.processing) {
      return false;
    }
    console.log(this.state.newCoordinate, this.state.myLocation);
    if (this.state.newCoordinate == null && this.state.myLocation == null) {
      Alert.alert('提示', '无效的位置。请先在地图上标注。');
      return false;
    } else if (this.state.newCoordinate == null && this.state.myLocation != null) {
      Alert.alert('提示', '您没有进行拖动操作。直接将当前位置保存为门店位置？', [
        {
          text: '确认',
          onPress: function() {
            _this.setState({
              newCoordinate: _this.state.myLocation
            })
            _submit();
          }
        },
        {
          text: '取消',
          style: 'cancel',
          onPress: function() {
            return false;
          }
        }
      ])
    } else if (_this.state.newCoordinate != null) {
      _submit();
    }
  },
  renderButtons: function () {
    if (!this.state.marking) {
      return (
        <View style={styles.buttons}>
          <View style={styles.buttonContainer}>
            <Icon.Button name="thumb-tack" backgroundColor="#1b809e" onPress={() => this.setMarkable()}>
              标注位置
            </Icon.Button>
          </View>
        </View>
      )
    } else {
      return (
        <View style={styles.buttons}>
          <View style={styles.buttonContainer}>
          <Icon.Button name="check" backgroundColor="#5cb85c" onPress={() => this.saveCoodinate()}>
            保存
          </Icon.Button>
          </View>
          <View style={styles.buttonContainer}>
          <Icon.Button name="ban" backgroundColor="#d9534f" onPress={() => this.cancelMark()}>
            取消
          </Icon.Button>
          </View>
        </View>
      )
    }
  },
  dragEnd: function(event) {
    console.log(event);
  },
  onGetMyLocation: function(event) {
    console.log('Get My Location: ', event);
  },
  render: function () {
    // let url = `${Config.MAP_URL}${merchant.id}/?lng=${merchant.coordinate.lng}&lat=${merchant.coordinate.lat}&name=${merchant.name}&address=${merchant.address}`;
    let _this = this;
    return (
      <View style={{flex: 1}}>
        <View style={{padding: 4}}>
          <Text style={{fontSize: 18}}>{this.props.merchant.name}</Text>
          <Text>{this.props.merchant.address}</Text>
          <View style={styles.buttonContainer}>
            {this.renderButtons()}
          </View>
        </View>
        <BaiduMap
          style={{flex: 1}}
          marker={this.state.markers}
          mode={1}
          locationEnabled={true}
          showZoomControls={false}
          trafficEnabled={true}
        />
      </View>
    )
  }
});

var styles = StyleSheet.create({
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  buttonContainer: {
    marginLeft: 8
  }
})
