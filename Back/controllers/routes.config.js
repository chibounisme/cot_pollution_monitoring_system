const StationController = require('./stations.controller');

exports.routesConfig = function (app) {
    app.post('/stations', StationController.connectToStation);

    app.get('/stations', StationController.getStationsByUserId);
    app.get('/stations:stationId', StationController.getStationsByStationId);

    app.get('/stations/:stationId/enable', StationController.enableStation);
    
    app.get('/stations/:stationId/disable', StationController.disableStation);
};