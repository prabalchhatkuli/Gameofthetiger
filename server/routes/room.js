var express = require('express');
var router = express.Router();
const chatrooms = require('../models/chatrooms.model');
const chatmessages = require('../models/chatmessages.model');

/**/
/*
 makeid(l)

NAME

       makeid function - randomly generate a string of l characters 

SYNOPSIS

        function makeid(l)
           l    -> number of characters for the id

DESCRIPTION
        This function randomly chooses l numbers from a set of characters and composes
        the string as an id.

RETURNS

        returns a string l characters long

AUTHOR

        Prabal Chhatkuli

DATE

        10/11/2020

*/
/**/

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


/**/
/*
 generateRoomID

NAME
       generateRoomID function - generate a room with an ID

DESCRIPTION
        generates an id of 6 characters. Loops until the generated id is unique for the database.
        Then creates an entry in the database with the created roomID.

RETURNS
        responds to the client with the generated Room ID.

AUTHOR
        Prabal Chhatkuli

DATE
        10/11/2020

*/
/**/
/* GET users listing. */
var generateRoomID = async function(req, res){
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

/**/
/*
 validateRoom

NAME
       validateRoom function - generate a room with an ID

SYNOPSIS  
      function (req, res)
        req     -> req.body has the roomID
        res     ->call back

DESCRIPTION
        checks if the room ID has been generated before.
        Also, it is verified whether the game has completed or not

RETURNS
        responds to the client with the validity

AUTHOR
        Prabal Chhatkuli

DATE
        10/11/2020

*/
/**/
var validateRoom = async function(req, res){
  let list = await chatrooms.find({name:req.body.roomID});

  if(list.length === 0)
  {
    res.send({isRoomValid: false})
  }
  else
  {
    if(list[0].winner=='-')
    {
      res.send({isRoomValid: true})    
    }
    else
    {
      res.send({isRoomValid: false})
    }   
  }
  res.end();
}

/**/
/*
 joinRoom

NAME
       joinRoom function - let a user join a room

SYNOPSIS  
      function (req, res)
        req     -> req.body has the roomID
        res     ->call back

DESCRIPTION
        finds the requested room. Then returns the relevant player piece information
        to the correct user.

RETURNS
        responds to the client with the player piece

AUTHOR
        Prabal Chhatkuli

DATE
        10/11/2020

*/
/**/
var joinRoom = async function(req, res){
  let listOfRooms = await chatrooms.find({name:req.body.roomID});
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
