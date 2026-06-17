import React,{useContext} from 'react'
import {auth} from '../firebase.config.js'
import { signOut } from "firebase/auth";
import goatSvg from '../SVG/goat.svg'
import tigerSvg from '../SVG/tiger.svg'
import { Button } from '@/components/ui/button';

/**/
/*
function Navigation(props)

NAME

        Navigation - the navigation bar component for the application

SYNOPSIS

        export default function Navigation(props)
            props       --> props contains the user object sent from the App component

DESCRIPTION

        provides a gui at the top of the page for accessing the various routes of the program,
        inlcuding the sign-in/out and the play game functionality.

RETURNS

        Returns navigation bar gui

AUTHOR

        Prabal Chhatkuli

DATE

        2/24/2020

*/
/**/

export default function Navigation(props) {

        //trivial function for the signout button
        function signout()
        {
            signOut(auth);
        }

        //elements returned by the component
        return (
    <nav className="flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-2 shadow-sm">
      <a href="/" className="flex items-center gap-2 font-semibold">
        <img alt="" src={goatSvg} width="30" height="30" className="inline-block align-top" />
        Game of the Tiger
        <img alt="" src={tigerSvg} width="30" height="30" className="inline-block align-top" />
      </a>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" asChild><a href="/game">Play the Game</a></Button>
        <a href="/instruction" className="px-2 text-sm hover:underline">Instruction</a>
        <a href="/about" className="px-2 text-sm hover:underline">About</a>
        {props.userInfo !== null && <a href="/Profile" className="px-2 text-sm hover:underline">Profile</a>}
        {props.userInfo === null
          ? <Button variant="outline" asChild><a href="/login">Log In/Sign Up</a></Button>
          : <Button variant="destructive" onClick={signout}>Signout</Button>}
      </div>
    </nav>
  );
}
