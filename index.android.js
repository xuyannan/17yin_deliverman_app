/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';
import React, {
  AppRegistry
} from 'react-native';

var delivermanApp = require('./app/app.android');

AppRegistry.registerComponent('delivermanApp', () => delivermanApp);
