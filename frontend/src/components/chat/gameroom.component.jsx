import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
            return (
                <main className="mx-auto max-w-md px-5 py-20 text-center">
                    <h2 className="font-display text-2xl font-semibold">Please log in to continue</h2>
                    <Button asChild className="mt-6 rounded-full px-7"><a href="/login">Log in</a></Button>
                </main>
            );
        }

        return (
            <main id='gametype' className="mx-auto max-w-md px-5 py-16">
                <div className="heritage-card animate-rise p-8 text-center">
                    {validRoom ? (
                        <div>
                            <p className="eyebrow mb-2">Online match</p>
                            <h2 className="font-display text-2xl font-semibold">Room ready</h2>
                            <p className="mt-2 text-sm text-muted-foreground">Your opponent's room is valid. Enter when you're ready.</p>
                            <Button onClick={startGame} size="lg" className="mt-6 rounded-full px-8">Start game</Button>
                        </div>
                    ) : (
                        <div>
                            <h2 className="font-display text-2xl font-semibold">Room not found</h2>
                            <p className="mt-2 text-sm text-muted-foreground">That link is invalid. Check the URL, or create a new room to invite a friend.</p>
                            <Button asChild variant="outline" className="mt-6 rounded-full px-7"><a href="/game">Back to menu</a></Button>
                        </div>
                    )}
                </div>
            </main>
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
