const mongoose = require('mongoose');
const DB = process.env.db;

mongoose.connect(DB, {
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(()=>{
    console.log("connection successful");
}).catch((err)=>console.log("No connection"))
