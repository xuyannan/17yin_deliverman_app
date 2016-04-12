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
var store = require('../store');

module.exports = React.createClass({
  getInitialState: function () {
    return {
      markers: [],
      marker: {},
      marking: false,
      newCoordinate: null,
      processing: false,
      myLocation: null,
      startRequestLocation: false,
      trafficEnabled: false
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
        myLocation: e,
        startRequestLocation: false
      })
    });
  },
  componentDidMount: function () {
    let merchant = this.props.merchant;
    let markers = this.props.markers;

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
      // markers: merchant.coordinate ? [JSON.stringify(marker)] : null,
      markers: markers.map(function(marker) {return JSON.stringify(marker)}),
      marker: marker,
      merchant: merchant
    });
    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.props.navigator.pop();
      return true;
    });
  },
  requestLocation: function () {
    if (this.state.startRequestLocation) {
      return false;
    }
    this.setState({
      startRequestLocation: true
    })
  },
  setMarkable: function () {
    let merchant = this.props.merchant;
    Alert.alert('提示', '长按红色位置图标2秒钟后即可拖动。拖动到正确位置后，点击"保存"即可');
    // if (merchant.coordinate) {
    //   let m = Object.assign({}, this.state.marker);
    //   m.showInfo = false;
    //   m.draggable = true;
    //   this.setState({
    //     markers: [JSON.stringify(m)],
    //     marker: m,
    //     marking: true
    //     // newCoordinate: {lat: parseFloat(merchant.coordinate.lat), lng: parseFloat(merchant.coordinate.lng)}
    //   });
    // } else {
    //   this.setState({
    //     markers: null,
    //     marker: null,
    //     marking: true
    //   });
    // }
    let _this = this;
    let markers = this.state.markers;
    _this.setState({
      markers: markers.map(function(marker) {
        let _m = JSON.parse(marker);
        _m.draggable = _m.merchantId === _this.state.merchant.id;
        return JSON.stringify(_m);
      }),
      marking: true
    });
  },
  cancelMark: function () {
    // if (this.state.marker) {
    //   let m = Object.assign({}, this.state.marker);
    //   this.setState({
    //     markers: [JSON.stringify(m)],
    //     marking: false,
    //     marker: m
    //   })
    // } else {
    //   this.setState({
    //     markers: null,
    //     marking: false,
    //     marker: null
    //   })
    // }
    let markers = this.state.markers;
    this.setState({
      markers: markers.map(function(marker) {
        let _m = JSON.parse(marker);
        _m.draggable = false;
        return JSON.stringify(_m);
      }),
      marking: false
    });

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
            // let _marker;
            // if (_this.state.marker) {
            //   _marker = Object.assign({}, _this.state.marker);
            //   _marker.coordinate = _this.state.newCoordinate;
            //   _marker.draggable = false;
            //   _marker.showInfo = true;
            // } else {
            //   _marker = {
            //     coordinate: _this.state.newCoordinate,
            //     info: _this.props.merchant.name,
            //     showInfo: true,
            //     draggable: false
            //   }
            // }
            let _markers = _this.statue.markers;
            _this.setState({
              // marker: _marker,
              markers: _markers.map(function(marker) {
                if (marker.merchantId === _this.state.merchant.id) {
                  marker.coordinate = _this.state.newCoordinate;
                }
                return marker;
              }),
              marking: false
            });
            let _merchant = Object.assign({}, _this.props.merchant);
            _merchant.coordinate = responseData.data;
            _this.setState({
              merchant: _merchant
            });

            store.dispatch({type: 'UPDATE_MERCHANT', merchant: _merchant});
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
    let _this = this;
    let _renderLocationButton = function () {
      if (_this.state.startRequestLocation) {
        return (
          <View style={styles.buttonContainer}>
            <Icon.Button name="spinner" backgroundColor="#ccc">
              定位
            </Icon.Button>
          </View>
        )
      } else {
        return (
          <View style={styles.buttonContainer}>
            <Icon.Button name="crosshairs" backgroundColor="#157254" onPress={() => _this.requestLocation()}>
              定位
            </Icon.Button>
          </View>
        )
      }
    };

    let _renderTrafficButton =  function () {
      return (

        <View style={styles.buttonContainer}>
        <Icon.Button name="road" backgroundColor=  {_this.state.trafficEnabled ? '#ccc' : '#157254'} onPress={() => _this.setState({trafficEnabled: !_this.state.trafficEnabled})}>
            {_this.state.trafficEnabled ? '关路况' : '查路况'}
          </Icon.Button>
        </View>

      );
    };
    if (!this.state.marking) {
      return (
        <View style={styles.buttons}>
          {_renderLocationButton()}
          {_renderTrafficButton()}
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
          {_renderLocationButton()}
          {_renderTrafficButton()}
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
          startRequestLocation={this.state.startRequestLocation}
          trafficEnabled={this.state.trafficEnabled}
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
