const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatRoomsSchema = new Schema({
        "name":{type: String,default: '-'},
        "creator":{type:String, default:'-'},
        "creator_uid":{type:String, default:'-'},
        "creator_piece":{type:String, default:'-'},
        "joiner":{type:String, default:'-'},
        "joiner_uid":{type:String, default:'-'},
        "winner":{type:String, default:'-'},
        "reported_winner":{type:String, default:'-'},
        "reported_by":{type:String, default:'-'}
    },
    {
        timestamps:true
    }
)

const chatRooms = mongoose.model('chatRooms', chatRoomsSchema);

module.exports = chatRooms;
