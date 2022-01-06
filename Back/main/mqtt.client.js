const mqtt = require('mqtt');
const config = require('./env.config.js');
const MQTTDataModel = require('../models/mqttData.schema');
const StationsModel = require('../models/stations.schema');

const client = mqtt.connect(config.mqtt_host, {
    username: config.mqtt_user,
    password: config.mqtt_password,
    port: config.mqtt_port
})

client.on('connect', async function () {
    console.log('Connected to MQTT Broker');

    let stations = await StationsModel.Station.find();
    let station_ids = stations.map(station => station.station_id);

    for (let station_id of station_ids) {
        client.subscribe(station_id, (err) => {
            if (err) {
                console.log('couldn\'t subscribe to station: ' + station_id);
            } else {
                console.log('Successfully subscribed to station: ' + station_id);
            }
        });
    }
})

client.on('message', async (topic, message) => {
    
    // update mqtt data 
    let station = await StationsModel.Station.findOne({ station_id: topic });
    if (station.isEnabled) {
        const data = JSON.parse(message);
        const mqttData = await MQTTDataModel.saveMQTTData({ topic, payload: data.payload, sensorType: data.sensorType });
        console.log('Received MQTT Data: ' + mqttData);
        
        if (station) {
            if(data.sensorType == 'microphone') {
                station.avgMicrophonelevel = ((station.avgMicrophonelevel *  station.microphonePayloadCount) + data.payload) / (station.avgMicrophonelevel + 1);
                station.lastMicrophoneLevel = Number(data.payload);
                station.microphonePayloadCount++;
            } else if(data.sensorType == 'air') {
                station.lastAirPollutionLevel = data.payload;
            }
    
            await station.save();
            console.log('Updated station with id: ' + topic + ' with live MQTT Data!');
        }
    }
})

exports.MQTTClient = client;