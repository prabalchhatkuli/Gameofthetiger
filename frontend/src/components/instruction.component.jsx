import React from 'react'
import "firebase/auth";
import {auth} from '../firebase.config'

/**/
/*
InstructPage(props)

NAME

        InstructPage(props) - returns a component for the instructions

SYNOPSIS

       function InstructPage(props)
       props        -> contains the user object as userInfo

DESCRIPTION

        This function simply returns text containing the instruction for the game.

RETURNS

        Returns the instruction page

AUTHOR

        Prabal Chhatkuli
DATE

        1/28/2020

*/
/**/

export default function InstructPage(props) {

    return (
        <div>
            <div className="container">
                <h3 className="text-center">Instructions for the game</h3>
                <p>
                बाघचाल  Bagh-Chal  meaning Game of Tiger is a strategic, two-player board game originating in Nepal.

                Compared to traditional board games like Chess or Checkers,
                this game is asymmetric in that one player controls four tigers and the other player controls upto twenty goats.
                </p>
                <br/>
                <p>
                    Tigers:
                </p>
                <p>
                    Tigers need to jump over(eat) 5 goats to win.
                </p>
                <p>
                    Tigers can only jump over 1 goat at a time.
                </p>
                <br/>
                <p>
                    Goats:
                </p>
                <p>
                    Goats need to block moves of all four tigers to win.
                </p>
                <p>
                    Goats cannot jump over tigers. But can block the move of the tiger by standing against each other.
                </p>
                <br/>
                <p>
                    for more information visit the wikipedia page: <a href='https://en.wikipedia.org/wiki/Bagh-Chal'> Bagchal </a>
                </p>
            </div>
        </div>
    )
}
