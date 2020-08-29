var express = require('express');
var router = express.Router();
const chatrooms = require('../models/chatrooms.model');
const chatmessages = require('../models/chatmessages.model');

//accepts number of characters to generate a room ID
function makeid(l)
{
  return new Promise((resolve, reject)=>{
    var text = "";
    var char_list = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i=0; i < l; i++ )
    {  
    text += char_list.charAt(Math.floor(Math.random() * char_list.length));
    }
    resolve(text);
  }) 
}

/* GET users listing. */
var generateRoomID = async function(req, res){
  console.log(req.body.adminPiece);
  
  //generate a 6 character room id 
  //validate that the room is not already created in the database
  //if room already present create another 
  //await chatrooms.insertMany([{name:roomID}]);
  var roomID;
  let list;
  do
  {
    //generate a 6 character room id 
    roomID = await makeid(6);
    list = await chatrooms.find({name:roomID});

  }while(list.size===0)

  await chatrooms.insertMany([{name:roomID}]);
  res.send({roomID:roomID});
  res.end();
}

router.post('/generate', generateRoomID);

module.exports = router;
