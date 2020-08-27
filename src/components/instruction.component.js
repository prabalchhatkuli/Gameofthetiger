import React from 'react'
import "firebase/auth";
import {auth} from '../firebase.config'


export default function InstructPage(props) {
    console.log(auth.currentUser);
    return (
        <div>
            <div className="container">
                <h3 className="text-center">Instructions for the game</h3>
                <p>
                बाघचाल  Bagh-Chal  meaning Game of Tiger is a strategic, two-player board game originating in Nepal.

Compared to traditional board games like Chess or Checkers,
this game is asymmetric in that one player controls four tigers and the other player controls upto twenty goats.


Tigers need to jump over(eat) 5 goats to win.

Goats need to block all moves of fopur tigers to win.
                </p>
            </div>
        </div>
    )
}
