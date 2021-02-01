import config from 'config/config'

const database = config.firebase.database()
let lastUpdate = database.ref('dbUdpates').orderByKey().limitToFirst(1).once().then((snapshot) => snapshot.val().key)

while (true) {
    

}