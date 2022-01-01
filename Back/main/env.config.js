module.exports = {
    'key-file': '/etc/letsencrypt/live/pmscot.me/privkey.pem',
    'cert-file': '/etc/letsencrypt/live/pmscot.me/fullchain.pem',
    'dh-strongfile': '/etc/letsencrypt/live/pmscot.me/dh-strong.pem',
    'main_db_url': 'mongodb+srv://chiboub:chiboub@db-cot.6pho3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    'permissionLevels': ['Master', 'Member', 'Surfer'],
    'port': 443
}