module.exports = {
    'actualRefreshSecret': 'this_is_a_secret',
    'jwtValidityTimeInSeconds': '3600',
    'key-file': '/etc/letsencrypt/live/pmscot.me/privkey.pem',
    'cert-file': '/etc/letsencrypt/live/pmscot.me/fullchain.pem',
    'dh-strongfile': '/etc/letsencrypt/live/pmscot.me/dh-strong.pem',
    'main_db_url': 'mongodb+srv://chiboub:chiboub@db-cot.6pho3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    'permissionLevels': ['Admin', 'Member'],
    'port': 443,
    'mqtt_host': 'mqtt://mqtt.pmscot.me',
    'mqtt_user': 'mqttchiboub',
    'mqtt_password': 'chiboub',
    'mqtt_port': 1883,
    'mqtt_topic': 'test_topic'
}