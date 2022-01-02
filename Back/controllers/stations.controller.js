const StationModel = require('../models/stations.schema');
const jwt = require('jsonwebtoken');
const config = require('../../main/env.config');
const fs = require('fs');

exports.connectToStation = async (req, res, next) => {
    const token = req.headers['authorization'].split('Bearer ')[1];

    const secretKey = fs.readFileSync(config['key-file']);
    const payload = jwt.verify(token, secretKey, { algorithms: 'RS512' });
    if (!payload) {
        res.status(402).json({
            message: 'Invalid JWT'
        });
        return;
    }

    const { stationId, stationName, stationLat, stationLong } = req.body;
    if (!(stationId && stationName && stationLat && stationLong)) {
        res.status(400).send({
            message: 'Missing Required fields'
        });
        return;
    }

    let result = await StationModel.Station.findOne({ station_id: stationId });
    if (!result) {
        res.status(403).send({
            message: 'Station is already assigned, please link another one'
        });
        return;
    } else {
        let resultData = {
            added_at: new Date(),
            station_name: stationName,
            station_id: stationId,
            station_lat: stationLat,
            station_long: stationLong,
            user_id: payload.id
        };
        let addStation = await StationModel.createStation(resultData);
        res.status(200).send(JSON.stringify(addStation));
    }
};

exports.getStationsByUserId = async (req, res) => {
    const token = req.headers['authorization'].split('Bearer ')[1];

    const secretKey = fs.readFileSync(config['key-file']);
    const payload = jwt.verify(token, secretKey, { algorithms: 'RS512' });
    if (!payload) {
        res.status(402).json({
            message: 'Invalid JWT'
        });
        return;
    }

    if (payload.id != req.params.userId) {
        res.status(401).send({
            message: 'Cannot get other people\'s information'
        });
        return;
    }

    let result = await IdentityModel.Identity.find({ user_id: req.params.userId });
    if (!result) {
        res.status(400).send({
            message: 'there was an error with getting the user data'
        });
        return;
    }

    res.status(200).send(JSON.stringify(result));
};

exports.enableStation = async (req, res) => {
    const token = req.headers['authorization'].split('Bearer ')[1];

    const secretKey = fs.readFileSync(config['key-file']);
    const payload = jwt.verify(token, secretKey, { algorithms: 'RS512' });
    if (!payload) {
        res.status(402).json({
            message: 'Invalid JWT'
        });
        return;
    }

    let result = await IdentityModel.Identity.findOne({ station_id: req.params.stationId, user_id: payload.id });
    if (!result) {
        res.status(400).send({
            message: 'there was an error with getting the user data'
        });
        return;
    }

    result.isEnabled = true;
    await result.save();

    res.status(200).send(JSON.stringify(result));
};

exports.disableStation = async (req, res) => {
    const token = req.headers['authorization'].split('Bearer ')[1];

    const secretKey = fs.readFileSync(config['key-file']);
    const payload = jwt.verify(token, secretKey, { algorithms: 'RS512' });
    if (!payload) {
        res.status(402).json({
            message: 'Invalid JWT'
        });
        return;
    }

    let result = await IdentityModel.Identity.findOne({ station_id: req.params.stationId, user_id: payload.id });
    if (!result) {
        res.status(400).send({
            message: 'there was an error with getting the user data'
        });
        return;
    }

    result.isEnabled = false;
    await result.save();

    res.status(200).send(JSON.stringify(result));
};