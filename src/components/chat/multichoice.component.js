import React, { Component, useContext } from 'react'
import ReactDOM from 'react-dom'
import { UserContext } from "../../providers/UserProvider";
import { Redirect } from "react-router-dom";
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import axios from 'axios';

/**/
/*
class Multichoice

NAME

        Multichoice class - starts process for a multiplayer game

SYNOPSIS

        state:
            modalShow       ->flag for modal view
            playerPiece        ->the piece that the player wants to play with
            linkId              ->the id of the game room
            setRedirect         ->flag for redirecting to the room
            userInfo            ->the user object from firebase
        
        

DESCRIPTION
        The component create a modal and asks for user to input the piece they want to play with.
        Also, a game room can be generated. Once game is created they can join the game. There is also
        the option to join the game using an already created link.


RETURNS
        UI component

AUTHOR

        Prabal Chhatkuli

DATE

        9/12/2020

*/
/**/

export default class Multichoice extends Component {
    constructor(props){
        super(props);
        this.state={modalShow:true, playerPiece:null, linkId:null, setRedirect:false, userInfo: this.props.userInfo};
        this.onCloseButtonClick =  this.onCloseButtonClick.bind(this);
        this.onGenerateButtonClick =  this.onGenerateButtonClick.bind(this);
        this.createGame = this.createGame.bind(this);
        this.joinGame = this.joinGame.bind(this);
        this.setPlayerPiece = this.setPlayerPiece.bind(this);
        this.createGame = this.createGame.bind(this);
    }

    /*trivial function for close button click*/
    onCloseButtonClick(e)
    {
        this.setState({
            modalShow: false,
          })
        
          //rederect to the gameChoice page
          window.location.href="/game"
    }

    /*trivial function to set the player piece*/
    setPlayerPiece(event) {
        this.setState({
            playerPiece: event.target.value,
          })
        
        //set local player information
        var playerInfo = {creator:true, playerPiece:this.state.playerPiece, linkId:this.state.linkId};
        localStorage.setItem("playerInfo", JSON.stringify(playerInfo));

        console.log(event.target.value);
    }

    /**/
    /*
    onGenerateButtonClick()

    NAME

            onGenerateButtonClick function - get a unique room number

    DESCRIPTION
            This component communicates with the server to generate a unique room number.
            on response, the DOM is updated with the received information.

    RETURNS
            sets the state of LinkID to the received response from the server.

    */
    /**/
    async onGenerateButtonClick(event){
        console.log("Generating randomly generated link");
        let payload={piece:this.state.playerPiece, user: this.state.userInfo.email};
        try
        {
            const response = await axios.post('http://localhost:5000/room/generate',payload);

            //no need to implement callback
            this.setState(()=>({
                linkId: response.data.roomID
            }));
        }
        catch(error)
        {
            console.log(error);
            const errorMsg = <p className="text-warning">Error in generating key. Please press again.</p>
            ReactDOM.render(errorMsg, document.getElementById('generate result'));
            return;
        }
        const successMsg = <p className="text-success">http://localhost:3000/room/{this.state.linkId}</p>
        ReactDOM.render(successMsg, document.getElementById('generate result'));
    }

    /*trivial function to go to the room*/
    createGame()
    {
        //room has already been created
        //now just connect to the room with the room ID
        //if, connection successful, redirect to the main game page
        this.setState(()=>({
            setRedirect: true
        }));
        console.log("Setredirect setter");
    }

    /*trivial function to redirect to the link of the game*/
    joinGame(e)
    {
        //enter the url
        let joinLink= document.getElementById("JoinGame").value;
        let arrLink = joinLink.split("/");
        window.location.href="/room/"+arrLink[4];
        //go to the url
        //play game
    }

    render() {
        if(this.state.setRedirect)
        {
            window.location.href="/room/"+this.state.linkId;
        }
        else
        {
            return (
                <div>
                    <Modal
                        show={this.state.modalShow}
                        onHide={this.onCloseButtonClick}
                        size="lg"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                        >
                        <Modal.Header closeButton>
                            <Modal.Title id="contained-modal-title-vcenter">
                            Multiplayer game
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <h5>Join:</h5>
                            <Tabs defaultActiveKey="new" id="uncontrolled-tab-example">
                                <Tab eventKey="new" title="Create New Room">
                                    <h6>Choose Your piece</h6>
                                    <div class="custom-control custom-radio custom-control-inline" onChange={this.setPlayerPiece.bind(this)}>
                                    <input type="radio" id="GoatChoice" name="PieceChoice" value='goat' class="custom-control-input"/>
                                    <label class="custom-control-label" for="GoatChoice">Goat</label>
                                    </div>
                                    <div class="custom-control custom-radio custom-control-inline" onChange={this.setPlayerPiece.bind(this)}>
                                    <input type="radio" id="TigerChoice" name="PieceChoice" value='tiger' class="custom-control-input"/>
                                    <label class="custom-control-label" for="TigerChoice">Tiger</label>
                                    </div>
                                    <p>Share the link below with your friends</p>
                                    <div id='generate result'></div>
                                    <Button onClick={this.onGenerateButtonClick}>Generate game link</Button>
                                    <p id="gameLink"></p>
                                    <Button onClick={this.createGame}>Submit</Button>
                                </Tab>
                                <Tab eventKey="old" title="Join with link">
                                <label for="JoinGame">Paste the URL Below to join the Room:</label>
                                <input type="url" id="JoinGame" name="JoinGame" class="form-control"/><br/><br/>
                                <Button onClick={this.joinGame}>Join Game</Button>
                                </Tab>
                            </Tabs>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={this.onCloseButtonClick}>Close</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            )
        }
    }
}
