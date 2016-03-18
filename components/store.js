'use strict';
import {createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';

const createStoreWithMiddleware = applyMiddleware(thunkMiddleware)(createStore);

const tasks = (state = {}, action) => {
  switch (action.type) {
    case 'SET_USER':
      state.user = action.user;
      return state;
      break;
    case 'DELETE_USER':
      state.user = null;
      return state;
      break;
    case 'FETCH_TASKS':
      break;
    case 'SET_TASKS':
      state.tasks = action.tasks;
      return state;
      break;
    case 'DELETE_ORDER':
      let tasks = state.tasks.filter(function (task) {
        let payment = 0
        console.log(task.orders.map(function(o) {return o.id}));
        let _orders = task.orders.filter(function (o) {
          if (o.id !== action.orderid) {
            payment += parseFloat(o.price.replace('元', ''))
          }
          return o.id !== action.orderid
        })
        task.orders = _orders
        task.payment = payment
        return task.orders.length > 0
      })
      tasks.map(function(task) {
        console.log(task.orders.map(function(o) {
          return o.id
        }))
      })
      return Object.assign({}, state, {
        tasks: tasks
      })
      break;
    case 'CLEAR_DATA':
      state = {
        user: null,
        tasks: []
      };
      return state;
      break;
    default:
      return state
  }
}

// module.exports = createStore(tasks)
module.exports = createStoreWithMiddleware(tasks, {})
