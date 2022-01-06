const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const mqttDataSchema = new Schema({
    timestamp: Date,
    topic: String,
    payload: String,
    sensorType: String
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'mqttdata'
});

const MQTTData = mongoose.model('MQTTData', mqttDataSchema);

exports.Identity = MQTTData;

exports.saveMQTTData = async (data) => {
    data.timestamp = new Date();

    let mqttData = new MQTTData(data);
    return await mqttData.save();
}