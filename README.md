WebStreamJs
===========

JavaScript client for https://github.com/daprlabs/WebStreamServer.

Combines the power of [Reactive Extensions]() with WebSockets for writing highly interactive, real-time apps.

# Usage
The `WebStream` function returns an `Rx.Observable` which can be queried/manipulated and eventually subscribed to.
```
function WebStream(path, queryParams, inputStreams) { /* returns a cold Rx.Observable */ }
```
`path`: The path of the WebSocket to connect to. Either an absolute path ("/stock/ticker") or a URI.

`queryParams`: The query parameters to append to the path.

`inputStreams`: The collection of observables to pipe into the stream. Note that keys must match those specified on the service.

Example for a stock ticker (see [WebStream Samples](https://github.com/daprlabs/WebStreamSamples)):
```javascript
var stock = WebStream('/stock/ticker', { symbol: 'AMZN' }).subscribe(console.log);
```
WebStream also allows for full-duplex communication. Pass input streams in as the third parameter to `WebStream(...)`.


Serving suggestion for writing actual apps: Combine with [AngularJS](https://angularjs.org/)/[KnockoutJS](http://knockoutjs.com/).

# AngularJS
WebStream should be used in AngularJS *services*. Use [rx.-angular.js](https://github.com/Reactive-Extensions/rx.angular.js) to bind AngularJS &amp; RxJS together as appropriate.

## Example
*TODO*

# KnockoutJS

## Example
*TODO*
