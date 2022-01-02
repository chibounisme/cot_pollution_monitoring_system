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
    microphoneLevelAvg: {
        type: Number,
        default: 0
    },
    airPollutionLevelAvg: {
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