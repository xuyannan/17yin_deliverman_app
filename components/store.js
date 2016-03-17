'use strict';
import {createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';

const createStoreWithMiddleware = applyMiddleware(thunkMiddleware)(createStore);

const tasks = (state = {}, action) => {
  switch (action.type) {
    case 'FETCH_TASKS':

      break;
    case 'SET_TASKS':
      console.log('set tasks');
      state.tasks = action.tasks;
      return state;
      break;
    case 'DELETE_ORDER':
      console.log(`order to delete: ${action.orderid}`)
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
    default:
  }
}

// module.exports = createStore(tasks)
module.exports = createStoreWithMiddleware(tasks, {})
