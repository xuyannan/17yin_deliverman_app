// import fetchIntercept from 'fetch-intercept';
//
// const unregister = fetchIntercept.register({
//   request: function (url, config) {
//       // Modify the url or config here
//       console.log('request');
//       return [url, config];
//   },
//
//   requestError: function (error) {
//       // Called when an error occured during another 'request' interceptor call
//       console.log('requestError');
//       return Promise.reject(error);
//   },
//
//   response: function (response) {
//       // Modify the reponse object
//       console.log('response');
//       return response;
//   },
//
//   responseError: function (error) {
//       // Handle an fetch error
//       console.log('responseError');
//       return Promise.reject(error);
//   }
// });
//
// module.exprts.unregister = unregister;
