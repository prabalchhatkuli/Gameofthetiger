const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatRoomsSchema = new Schema({
    //this schema will contain all the possible destinations in the csv file
        "name":{type: String,default: '-'},
        "creator":{type:String, default:'-'},
        "creator_piece":{type:String, default:'-'},
        "joiner":{type:String, default:'-'},
        "winner":{type:String, default:'-'}
    },
    {
        timestamps:true
    }
)

const chatRooms = mongoose.model('chatRooms', chatRoomsSchema);

module.exports = chatRooms;
