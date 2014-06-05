;(function(global) {
    var init = function(context) {
        context.WebStream = function(path, params, inputs) {
            return Rx.Observable.create(function(observer) {
                var self = {};
                self.params = params || {};
                self.subscriptions = [];
                self.inputs = inputs || {};

                // Add all parameters to the URL query string.
                self.url = window.location.origin.replace('http://', 'ws://') + path;
                if (params) {
                    self.url += '?' + toQueryString(params);

                    // Encode the given object as a query string.
                    function toQueryString(object) {
                        var parts = [];
                        for (var key in object) {
                            var value = object[key];
                            parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value))
                        }

                        return parts.join('&')
                    }
                }
                
                // Connect to the uri.
                self.socket = new WebSocket(self.url);

                // On disposal, close the socket & unsubscribe from all inputs.
                self.dispose = function () {
                    // Unsubscribe from all inputs.
                    if (self.subscriptions) {
                        for (var i in self.subscriptions) {
                            self.subscriptions[i].dispose();
                        }
                        self.subscriptions = [];
                    }

                    // Close the socket.
                    self.socket.close();
                };

                // If the socket closes, complete the sequence and unsubscribe from all inputs.
                self.socket.onclose = function () {
                    observer.onCompleted();
                    self.dispose();
                };

                // If the socket errors, propagate that error and unsubscribe from all inputs.
                self.socket.onerror = function (error) {
                    observer.onError(error);
                    self.dispose();
                };

                // Each time a message is received, parse it and propagate the results to the observer.
                self.socket.onmessage = function (message) {
                    if (message.data.length > 0) {
                        switch (message.data[0]) {
                        case 'n':
                            // Propagate 'Next' event.
                            observer.onNext(JSON.parse(message.data.slice(1)));
                            break;
                        case 'e':
                            // Propagate 'Error' event & dispose.
                            observer.onError(JSON.parse(message.data.slice(1)));
                            self.dispose();
                            break;
                        case 'c':
                            // Propagate 'Completed' event & dispose.
                            observer.onCompleted();
                            self.dispose();
                            break;
                        }
                    }
                };

                // Subscribe to each input, piping inputs to socket.
                for (var i in self.inputs) {
                    self.subscriptions.push(self.inputs[i].subscribe(function(next) {
                            // Send a 'Next' event.
                            self.socket.send('n' + i + '.' + JSON.stringify(next));
                        },
                        function(error) {
                            // Send an 'Error' event.
                            self.socket.send('e' + i + '.' + JSON.stringify(error));
                        },
                        function() {
                            // Send a 'Completed' event.
                            self.socket.send('c' + i);
                        }));
                }

                // Return the disposal method to the subscriber.
                return self.dispose;
            });
        };
    };

    if (typeof define === 'function' && define.amd) {
        define(['rx'], function(){
            return init({});
        })
    } else {
        init(global);
    }
}(this));