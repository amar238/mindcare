const mongoose = require('mongoose');

mongoose.connect(process.env.DB_URL);

const DB = mongoose.connection;

DB.on('error',console.error.bind(console,"Error in connecting DB"));

DB.once('open',()=>{
    console.log("connected to DB");
})

module.exports = DB;