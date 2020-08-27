const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatMessagesSchema = new Schema({
    //this schema will contain all the possible destinations in the csv file
        "chatRoomID":{type: String,default: '-'},
        "author":{type: String,default: '-'},
        "message":{type: String,default: '-'},
    },
    {
        timestamps:true
    }
)

const Schedule = mongoose.model('Schedule', chatMessagesSchema);

module.exports = Schedule;
