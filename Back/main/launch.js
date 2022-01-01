#!/usr/bin/env node
const app = require('./app')
const config = require('./env.config.js');
const debug = require('debug')('phoenix:server');
// config.initRefreshSecret();
const tls = require('spdy'); // enable : http2 + https (http2 over tls)
const fs = require('fs');
let helmet = require('helmet');

const options = {
    key: fs.readFileSync(config["key-file"]),
    cert: fs.readFileSync(config["cert-file"]),
    dhparam: fs.readFileSync(config["dh-strongfile"])
}

app.use(helmet());

app.use((req, res, next) => {
    if(req.method == 'OPTIONS') {
        // set headers
        req.headers['Access-Control-Allow-Origin'] = '*';
        req.headers['Access-Control-Allow-Methods'] = '*';
        req.headers['Access-Control-Allow-Headers'] = '*';
        req.headers['Access-Control-Allow-Credentials'] = 'true';
    } else {
        next();
    }
})

// create the server
const server = tls.createServer(options, app);

server.listen(443, (err) => {
    if(err) {
        console.log('error when running the db');
    } else {
        console.log('running on port 8443');
    }
})