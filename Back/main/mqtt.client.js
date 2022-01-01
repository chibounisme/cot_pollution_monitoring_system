const mqtt = require('mqtt');
const config = require('./env.config.js');

const client = mqtt.connect(config.mqtt_host, {
    username: config.mqtt_user,
    password: config.mqtt_password,
    port: config.mqtt_port
})

client.on('connect', function () {
    console.log('Connected to MQTT Broker')

    client.subscribe(config.mqtt_topic, (err) => {
        if (err) {
            console.log('couldnt subsribe to ' + config.mqtt_topic + ' topic');
        }
    })
})

client.on('message', (topic, message) => {
    console.log('got message from topic: ' + topic);
    console.log('the message is: ' + message);
})

