const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

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
        default: 0
    },
    lastMicrophoneLevel: {
        type: Number,
        default: 0
    },
    avgAirPollutionLevel: {
        type: Number,
        default: 0
    },
    lastAirPollutionLevel: {
        type: Number,
        default: 0
    },
    microphonePayloadCount: {
        type: Number,
        default: 0
    },
    airPollutionPayloadCount: {
        type: Number,
        default: 0
    }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'stations'
});

const Station = mongoose.model('Station', stationSchema);

exports.Station = Station;

exports.createStation = (stationData) => {
    const station = new Station(stationData);
    return station.save();
};