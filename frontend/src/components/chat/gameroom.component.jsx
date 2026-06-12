import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Game from '../game/game.component';
import axios from 'axios';
import { auth } from "../../firebase.config";

/**/
/*
GameRoom

NAME

        GameRoom - component to start the game room

SYNOPSIS

        props: contains user object as userInfo
        Uses useParams() hook to get roomID from URL

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
export default function GameRoom({ userInfo }) {
    const { roomID } = useParams();
    const [validRoom, setValidRoom] = useState(false);
    const [playerPiece, setPlayerPiece] = useState(null);
    const [gameFlag, setGameFlag] = useState(false);

    /**/
    /*
    useEffect - validates the room with the server on mount

    DESCRIPTION
            validates the room with the server.

    RETURNS
            sets the validRoom flag
    */
    /**/
    useEffect(() => {
        async function validateRoom() {
            const payload = { roomID: roomID };

            try {
                const response = await axios.post('/room/validateRoom', payload);
                setValidRoom(response.data.isRoomValid);
            } catch (error) {
                console.log(error);
            }
        }

        validateRoom();
    }, [roomID]);

    /**/
    /*
    startGame()

    NAME

            startGame function - function to render the game component

    DESCRIPTION

            communicates with the server to get player piece and game state
            after successful communication, the flag is set, which renders the game component

    RETURNS
            sets the startGame flag

    AUTHOR

            Prabal Chhatkuli

    DATE

            4/14/2020

    */
    /**/
    async function startGame() {
        // If the room is valid, get the state of the player: i.e. the pieces of the player
        if (validRoom) {
            const payload = { roomID: roomID };

            try {
                const token = await auth.currentUser.getIdToken();
                const response = await axios.post('/room/joinRoom', payload,
                    { headers: { Authorization: `Bearer ${token}` } });
                setPlayerPiece(response.data.playerPiece);
            } catch (error) {
                console.log(error);
                return;
            }
        }

        setGameFlag(true);
    }

    // Verify the room has been created if not, give an error
    if (!gameFlag) {
        if (userInfo === null) {
            return <h4>Please log in to continue.</h4>;
        }

        return (
            <div id='gametype'>
                {validRoom ? (
                    <div>
                        <h4>Room is valid click start game to enter</h4>
                        <Button onClick={startGame}>Start Game</Button>
                    </div>
                ) : (
                    <h4>The room is invalid, please enter the link again or create a link to join.</h4>
                )}
            </div>
        );
    }

    return (
        <Game
            roomID={roomID}
            userInfo={userInfo}
            playerPiece={playerPiece}
            choice="multi"
        />
    );
}
