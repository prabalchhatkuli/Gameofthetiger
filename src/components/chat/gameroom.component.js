import React, { Component ,useContext} from 'react'
import Button from 'react-bootstrap/Button'
import Game from '../game/game.component'
import axios from 'axios';

/**/
/*
class GameRoom

NAME

        GameRoom class - component to start the game room

SYNOPSIS

        props: contains the roomID from params, user object as userInfo 
        state:
            validRoom       -> flag to see if the room is valid
            playerPiece        ->piece of the current player
            gameFlag            -> flag to start the game

DESCRIPTION

        connects to the room. Checks the validity of the room with the server. Then starts the game
        with all required information about the user and the game.

RETURNS
        the game component, once all validation is complete

AUTHOR

        Prabal Chhatkuli

DATE

        4/14/2020

*/
/**/
export default class GameRoom extends Component {
    constructor(props)
    {
        super(props)
        this.state = { welcome:true, validRoom:false, playerPiece:null, gameFlag:false}
        console.log(this.props);
        console.log("reached here");
        this.startGame = this.startGame.bind(this);
    }

    /**/
    /*
    componentDidMount

    NAME

            componentDidMount function - in-built react function

    DESCRIPTION

            validates the room with the server.

    RETURNS
            sets the validRoom flag

    AUTHOR

            Prabal Chhatkuli

    DATE

            4/14/2020

    */
    /**/
    async componentDidMount()
    {
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

    /**/
    /*
    startGame()

    NAME

            startGame function - function to render the game component

    SYNOPSIS

    DESCRIPTION

            communicates with the server toget player piece and game state
            after successful communcation, the flag is set, which renders the game component

    RETURNS
            sets the startGame flag

    AUTHOR

            Prabal Chhatkuli

    DATE

            4/14/2020

    */
    /**/
    async startGame()
    {   
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


