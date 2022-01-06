const StationModel = require('../models/stations.schema');
const jwt = require('jsonwebtoken');
const config = require('../main/env.config');
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
    if (result) {
        res.status(403).send({
            message: 'Station is already assigned, please link another one'
        });
        return;
    } else {
        let resultData = {
            added_at: new Date(),
            lastUpdatedAt: new Date(),
            station_name: stationName,
            station_id: stationId,
            station_lat: stationLat,
            station_long: stationLong,
            user_id: payload.id
        };
        let addStation = await StationModel.createStation(resultData);
        res.status(200).json(addStation);
    }
};

exports.getStationsByStationId = async (req, res) => {
    const token = req.headers['authorization'].split('Bearer ')[1];

    const secretKey = fs.readFileSync(config['key-file']);
    const payload = jwt.verify(token, secretKey, { algorithms: 'RS512' });
    if (!payload) {
        res.status(402).json({
            message: 'Invalid JWT'
        });
        return;
    }

    let result = await StationModel.Station.findById(req.params.stationId);
    if (!result) {
        res.status(400).send({
            message: 'there was an error with getting the user data'
        });
        return;
    }

    res.status(200).json(result);
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

    let result = await StationModel.Station.find({ user_id: payload.id });
    if (!result) {
        res.status(400).send({
            message: 'there was an error with getting the user data'
        });
        return;
    }

    res.status(200).json(result);
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

    let result = await StationModel.Station.findById(req.params.stationId);

    if (!result) {
        res.status(400).send({
            message: 'there was an error with getting the user data'
        });
        return;
    }

    result.isEnabled = true;
    await result.save();

    res.status(200).json(result);
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

    let result = await StationModel.Station.findById(req.params.stationId);
    if (!result) {
        res.status(400).send({
            message: 'there was an error with getting the user data'
        });
        return;
    }

    result.isEnabled = false;
    await result.save();

    res.status(200).json(result);
};

exports.updateAlert = async (req, res) => {
    const token = req.headers['authorization'].split('Bearer ')[1];

    const secretKey = fs.readFileSync(config['key-file']);
    const payload = jwt.verify(token, secretKey, { algorithms: 'RS512' });
    if (!payload) {
        res.status(402).json({
            message: 'Invalid JWT'
        });
        return;
    }

    let result = await StationModel.Station.findById(req.params.stationId);
    if (!result) {
        res.status(400).send({
            message: 'there was an error with getting the user data'
        });
        return;
    }

    let {alertMicrophoneLevelThreshold, isAlertMicrophoneOn} = req.body;
    if (!(alertMicrophoneLevelThreshold && isAlertMicrophoneOn)) {
        res.status(401).send({
            message: 'Missing data'
        });
        return;
    }

    result.alertMicrophoneLevelThreshold = alertMicrophoneLevelThreshold;
    result.isAlertMicrophoneOn = isAlertMicrophoneOn;
    await result.save();

    res.status(200).json(result);
};