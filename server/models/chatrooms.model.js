const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatRoomsSchema = new Schema({
    //this schema will contain all the possible destinations in the csv file
        "name":{type: String,default: '-'},
    },
    {
        timestamps:true
    }
)

const chatRooms = mongoose.model('chatRooms', chatRoomsSchema);

module.exports = chatRooms;
