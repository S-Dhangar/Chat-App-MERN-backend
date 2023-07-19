const mongoose = require('mongoose');

const user = new mongoose.Schema({
    name:{
        type: "string",
        required:"true"
    },
    email:{
        type: "string",
        required:"true"
    },
    password:{
        type: "string",
        required:"true"
    },
    photo: {
        type: "string",
        default: '', // or provide a default image URL
    }
});

const User = mongoose.model("User",user);
module.exports = User;
