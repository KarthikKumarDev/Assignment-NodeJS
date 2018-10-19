/*
 *  Primary file for the API
 *
*/

//Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

// Instantiating the https server
const httpServer = http.createServer(function (req, res) {

    let payloadBuffer = '';
    // Get the URL and parse it
    let parsedUrl = url.parse(req.url, true);

    // Get the path 
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an Object
    let queryStringObject = parsedUrl.query;

    // Get the HTTP method
    let method = req.method.toLowerCase();

    // Get the Headers as an object
    let headers = req.headers;

    // Get the Payload, if any
    let decoder = new StringDecoder('utf-8');

    req.on('data', function (data) {
        payloadBuffer += decoder.write(data);
    });

    req.on('end', function () {
        payloadBuffer += decoder.end();

        // Choose the handler this request should go to. If one is not found, use the not found handler
        let chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        //construct the data object to send to the handler
        let data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': payloadBuffer
        };

        chosenHandler(data, function (statusCode, payload) {
            // Use the status code called back by the handler or default to 200
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

            // Use the paylaod called back by the handler or default to an empty object
            payload = typeof (payload) == 'object' ? payload : {};

            // Convert payload to a string
            let payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);

            // Send the response    
            res.end(payloadString);

            // Log the response
            console.log("Returning the response: ", statusCode, payloadString)
        });
    });
});

//Start the http server and have it listen on port 3000
httpServer.listen(config.httpPort, function () {
    console.log("The server is listening on port " + config.httpPort);
});

// Define the handlers
let handlers = {};

handlers.ping = function (data, callback) {
    callback(200);
};

handlers.hello = function (data, callback) {
    callback(200,{"message":"Hello! Welcome to NodeJs Assignment #1 of JkkR"});
};

// Not found handler
handlers.notFound = function (data, callback) {
    callback(404);
};

// Define a request router

let router = {
    'ping': handlers.ping,
    'hello': handlers.hello
}