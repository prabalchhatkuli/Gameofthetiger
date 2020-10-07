import React, { Component ,useContext} from 'react'
import Button from 'react-bootstrap/Button'
import Game from '../game/game.component'
import axios from 'axios';

export default class GameRoom extends Component {
    constructor(props)
    {
        super(props)
        this.state = { welcome:true, validRoom:false, playerPiece:null, gameFlag:false}
        console.log(this.props);
        console.log("reached here");
        this.startGame = this.startGame.bind(this);
    }

    async componentDidMount()
    {
        console.log(this.props);
        //check if the room is valid or not by accessing the database
        var payload = {roomID: this.props.match.params.roomID}


        //check if the room has been created and stored in the database
        try
        {
            const response = await axios.post('http://localhost:5000/room/validateRoom',payload);

            //no need to implement callback
            this.setState(()=>({
                validRoom: response.data.isRoomValid
            }));
        }
        catch(error)
        {
            console.log(error);
            return;
        }
    }

    async startGame()
    {
        console.log(this.props.userInfo);
        
        //if the room is valid, get the state of the player: i.e. the pieces of the player
        if(this.state.validRoom)
        {
            
            //create a payload with the user's information
            var payload = {roomID: this.props.match.params.roomID, userInfo:this.props.userInfo.email};

            try
            {
                const response = await axios.post('http://localhost:5000/room/joinRoom',payload);

                //no need to implement callback
                this.setState(()=>({
                    playerPiece: response.data.playerPiece
                }));
            }
            catch(error)
            {
                console.log(error);
                return;
            }

            console.log("player piece is "+this.state.playerPiece)
        }

        this.setState(()=>({
            gameFlag: true
        }));

    }
    //verify the room has been created if not, give an error
    render() {
        if(!this.state.gameFlag)
        {
            if(this.props.userInfo===null)
            {
                return(<h4>Please log in to continue.</h4>);
            }
            else
            {
            return(
                <div id='gametype'>
                    {this.state.validRoom?<div><h4>Room is valid click start game to enter</h4><Button onClick={this.startGame}>Start Game</Button></div>:
                    <h4>The room is invalid, please enter the link again or create a link to join.</h4>}
                </div>
                )
            }
        }
        else
        {
            return (
                <Game roomID={this.props.match.params.roomID} userInfo={this.props.userInfo} playerPiece={this.state.playerPiece} choice="multi"/>
            )
        }
    }
}


