const mongoose = require('mongoose');

const mongo_url = process.env.MONGO_CONN;

mongoose.connect(mongo_url)
.then(() => {
    console.log("DataBase Connected...");
}).catch((err) => {
    console.log("DataBase Connection Error...",err);
});