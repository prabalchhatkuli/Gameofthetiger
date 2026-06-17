import React from 'react'
import {auth} from '../firebase.config.js'
import { signOut } from "firebase/auth";
import goatSvg from '../SVG/goat.svg'
import tigerSvg from '../SVG/tiger.svg'
import { Button } from '@/components/ui/button';

/**/
/*
function Navigation(props)
        The top navigation bar for the application.
*/
/**/

export default function Navigation(props) {

    //trivial function for the signout button
    function signout() {
        signOut(auth);
    }

    return (
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
            <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
                <a href="/" className="group flex items-center gap-2.5">
                    <img alt="" src={tigerSvg} width="30" height="30" className="transition-transform duration-300 group-hover:-rotate-6" />
                    <span className="font-display text-lg font-semibold tracking-tight">
                        Game of the <span className="text-primary">Tiger</span>
                    </span>
                    <img alt="" src={goatSvg} width="26" height="26" className="transition-transform duration-300 group-hover:rotate-6" />
                </a>

                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                    <NavLink href="/game">Play</NavLink>
                    <NavLink href="/instruction">How to play</NavLink>
                    <NavLink href="/about">About</NavLink>
                    {props.userInfo !== null && <NavLink href="/Profile">Profile</NavLink>}
                    {props.userInfo === null
                        ? <Button asChild className="ml-1 rounded-full px-5"><a href="/login">Log in</a></Button>
                        : <Button variant="outline" onClick={signout} className="ml-1 rounded-full px-5">Sign out</Button>}
                </div>
            </nav>
        </header>
    );
}

function NavLink({ href, children }) {
    return (
        <a
            href={href}
            className="relative px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:bottom-0 after:left-3 after:right-3 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform hover:after:scale-x-100"
        >
            {children}
        </a>
    );
}
