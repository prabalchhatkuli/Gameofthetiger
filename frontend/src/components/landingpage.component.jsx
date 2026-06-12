import React from 'react'
import '../App.css';
import Image from 'react-bootstrap/Image'

/**/
/*
function landingpage(props)

NAME

        landingpage - returns the landing page

SYNOPSIS

        function landingpage(props)
        props       ->props contains the user object as userInfo

DESCRIPTION

        This function will return the landing page and animations in the landing page.
        it will also show the name of the user that is signed in.

RETURNS

        Returns the component to diplay as the landing page.

AUTHOR

        Prabal Chhatkuli

DATE

        6/28/2020

*/
/**/
export default function landingpage(props) {
    return (
        <div>
                <div className="text-center text-light bg-success">
                    Welcome! {'  '}
                    {/* find if a user is signed in , if yes display the email */}
                    {props.userInfo === null ? <p>Visitor, please signup or login to play the game</p> : props.userInfo.email }
                </div>
                
                {/*display the animation and the image on the landing page */}
                <div class="hero-image">
                    <div class="hero-text">
                        <h2 style={{fontSize:"50px"}}>BagChal</h2>
                        <h4>A traditional game in a multiplayer approach</h4>
                    </div>
                </div>
        </div>
    )
}
