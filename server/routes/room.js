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

  await chatrooms.insertMany([{name:roomID, creator:req.body.user, creator_piece:req.body.piece}]);
  res.send({roomID:roomID});
  res.end();
}

var validateRoom = async function(req, res){
  let list = await chatrooms.find({name:req.body.roomID});

  console.log("reached here in server");
  console.log(list);
  if(list.length === 0)
  {
    console.log("invalid room");
    res.send({isRoomValid: false})
  }
  else
  {
    console.log("valid room");
    res.send({isRoomValid: true})
  }
  res.end();
}

var joinRoom = async function(req, res){
  let listOfRooms = await chatrooms.find({name:req.body.roomID});
  console.log(req.body.userInfo);
  console.log(listOfRooms);
  //find what the player is: creator / joiner
  //if joiner is already validated: the requesting client is an audience
  if(req.body.userInfo === listOfRooms[0].creator)
  {
    res.send({playerPiece:listOfRooms[0].creator_piece})
  }
  else
  {
    if(req.body.userInfo === listOfRooms[0].joiner)
    {
      if(listOfRooms[0].creator_piece==='goat')
      {
        res.send({playerPiece:'tiger'})
      }
      else
      {
        res.send({playerPiece:'goat'})
      }
    }
    else
    {
      if(listOfRooms[0].joiner === '-')
      {
        //update the database entry
        listOfRooms[0].joiner = req.body.userInfo;
        await listOfRooms[0].save();

        if(listOfRooms[0].creator_piece==='goat')
        {
          res.send({playerPiece:'tiger'})
        }
        else
        {
          res.send({playerPiece:'goat'})
        }
      }
      else
      {
        res.send({playerPiece:null});
      }
    }
  }

}

router.post('/joinRoom', joinRoom);

router.post('/validateRoom', validateRoom);

router.post('/generate', generateRoomID);

module.exports = router;
