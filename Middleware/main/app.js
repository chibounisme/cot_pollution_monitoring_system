const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/web'));

//set default message
app.get(['/', '/login', '/register', '/stations/*', '/path', '/logout'], (req, res) => {
    res.sendFile(__dirname + 'web/index.html');
});

//connect to all databases
require('./connection.pools')();

//initialize schemas
require('../models/identity.schema');
require('../models/mqttData.schema');
require('../models/stations.schema');

//connect to MQTT Broker
require('./mqtt.client');

const SecurityRouter = require('../security/routes.config');
const IdentityRouter = require('../identity/routes.config');
const MainRouter = require('../controllers/routes.config');

//bind routes to the express application
SecurityRouter.routesConfig(app);
IdentityRouter.routesConfig(app);
MainRouter.routesConfig(app);

//add error middleware
app.use(function (err, req, res, next) {
    if (err) {
        console.log(err);
        res.status(500).json({ error: err.stack });
    }
});

// Export the express application
module.exports = app;
