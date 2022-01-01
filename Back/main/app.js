const express = require('express');
const app = express();

app.use(express.json());

//set default message
app.get('/', (req, res) => {
    res.json({
        message: 'The Server is working as it should :)'
    });
});

//connect to all databases
require('./connection.pools')();
require('../models/identity.schema');

//connect to MQTT Broker
require('./mqtt.client');

const SecurityRouter = require('../security/routes.config');
const IdentityRouter = require('../identity/routes.config');

//bind routes to the express application
SecurityRouter.routesConfig(app);
IdentityRouter.routesConfig(app);

//add error middleware
app.use(function (err, req, res, next) {
    if (err) {
        console.log(err);
        res.status(500).json({ error: err.stack });
    }
});

// Export the express application
module.exports = app;
