const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const mqtt = require('../main/mqtt.client');

const stationSchema = new Schema({
    station_name: String,
    station_id: String,
    station_lat: String,
    station_long: String,
    added_at: Date,
    user_id: String,
    isEnabled: {
        type: Boolean,
        default: true
    },
    lastUpdatedAt: {
        type: Date
    },
    avgMicrophonelevel: {
        type: Number,
        default: -1
    },
    lastMicrophoneLevel: {
        type: Number,
        default: -1
    },
    lastAirPollutionLevel: {
        type: String,
        default: 'None'
    },
    microphonePayloadCount: {
        type: Number,
        default: 0
    },
    alertMicrophoneLevelThreshold: {
        type: Number,
        default: '50'
    },
    isAlertMicrophoneOn: {
        type: Boolean,
        default: true
    }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'stations'
});

const Station = mongoose.model('Station', stationSchema);

exports.Station = Station;

exports.createStation = async (stationData) => {
    const station = new Station(stationData);
    const data = await station.save();

    mqtt.MQTTClient.subscribe(station.station_id, (err) => {
        if (err) {
            console.log('couldn\'t subscribe to station: ' + station.station_id);
        } else {
            console.log('Successfully subscribed to station: ' + station.station_id);
        }
    });

    return data;
};