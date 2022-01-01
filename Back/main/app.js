const express = require('express');
const app = express();

app.use(express.json());

const path = require('path');
// view engine setup
app.set('views', path.join(__dirname, '../welcome/views'));
app.set('view engine', 'ejs');

//connect to all databases
require('./connection.pools')();
require('../identity/models/identity.schema');

//connect to MQTT Broker
require('./mqtt.client');

const SecurityRouter = require('../security/routes.config');
const IdentityRouter = require('../identity/routes.config');
const indexRouter  = require('../welcome/routes.config');

//bind routes to the express application
SecurityRouter.routesConfig(app);
IdentityRouter.routesConfig(app);
indexRouter.routesConfig(app);

// Export the express application
module.exports = app;
