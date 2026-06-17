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
        <main className="mx-auto max-w-3xl px-5 py-12">
            <div className="animate-rise text-center">
                <p className="eyebrow">How to play</p>
                <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">बाघचाल · Bagh-Chal</h1>
                <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                    A strategic, asymmetric two-player game from Nepal. One side commands
                    four <span className="text-primary">tigers</span>, the other up to twenty <span className="text-accent">goats</span>.
                </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <section className="heritage-card p-6">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="text-2xl">🐯</span>
                        <h2 className="font-display text-xl font-semibold text-primary">Tigers</h2>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex gap-2"><span className="text-primary">•</span> Capture (jump over) 5 goats to win.</li>
                        <li className="flex gap-2"><span className="text-primary">•</span> Jump over only one goat at a time, into an empty point.</li>
                        <li className="flex gap-2"><span className="text-primary">•</span> Start on the four corners of the board.</li>
                    </ul>
                </section>

                <section className="heritage-card p-6">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="text-2xl">🐐</span>
                        <h2 className="font-display text-xl font-semibold text-accent">Goats</h2>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex gap-2"><span className="text-accent">•</span> Win by blocking every tiger so none can move.</li>
                        <li className="flex gap-2"><span className="text-accent">•</span> Place all 20 goats first, then move them.</li>
                        <li className="flex gap-2"><span className="text-accent">•</span> Cannot jump — corner the tigers by standing firm.</li>
                    </ul>
                </section>
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
                More on the <a href="https://en.wikipedia.org/wiki/Bagh-Chal" className="font-medium text-primary hover:underline">Bagh-Chal Wikipedia page</a>.
            </p>
        </main>
    )
}
