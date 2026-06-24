import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import Game from './game/game.component'
import Multichoice from './chat/multichoice.component'
import { Button } from '@/components/ui/button';

/**/
/*
class GameChoice

NAME

        GameChoice component - component to choose the type of game to play

SYNOPSIS
        props
            userInfo       ->the signed in user object

DESCRIPTION

        The component renders two buttons which lets the user pick the type of game
        The user object is passed as props to the respective option

RETURNS
        Renders the chosen type of game

AUTHOR
        Prabal Chhatkuli 

DATE
        8/6/2020

*/
/**/

export default class GameChoice extends Component {

    constructor(props){
        super(props);
        console.log(props);
        this.state ={
            gamechosen: false,
            showSinglePlayerSetup: false,
            aiSide: 'goat',
            aiDifficulty: 'medium',
        };
        this.singlePlayer =  this.singlePlayer.bind(this);
        this.startSinglePlayer = this.startSinglePlayer.bind(this);
        this.twoPlayer =  this.twoPlayer.bind(this);
        this.multiplayer =  this.multiplayer.bind(this);
    }

    singlePlayer(){
        this.setState({ showSinglePlayerSetup: true });
    }

    startSinglePlayer(){
        ReactDOM.render(
            <Game
                choice="single"
                playerSide={this.state.aiSide === 'tiger' ? 'goat' : 'tiger'}
                aiSide={this.state.aiSide}
                difficulty={this.state.aiDifficulty}
                userInfo={this.props.userInfo}
            />,
            document.getElementById('gametype')
        );
    }

    twoPlayer(){
        ReactDOM.render(<Game choice="double" userInfo={this.props.userInfo}/>, document.getElementById('gametype'));
    }

    multiplayer(){

        ReactDOM.render(
            <Multichoice userInfo={this.props.userInfo}/>, document.getElementById('multichoice')
        );
    }

    choose(){
        if(this.state.gamechosen){
            return null;
        }
        if(this.state.showSinglePlayerSetup){
            const humanSide = this.state.aiSide === 'tiger' ? 'goat' : 'tiger';
            const difficulties = ['easy', 'medium', 'hard'];
            return(
                <div className="heritage-card animate-rise single-setup mx-auto max-w-md p-7">
                    <p className="eyebrow mb-2">Single player</p>
                    <h2 className="mb-6 font-display text-2xl font-semibold">Set up your match</h2>

                    <p className="mb-2 text-sm font-medium text-muted-foreground">You play as</p>
                    <div className="mb-6 grid grid-cols-2 gap-2">
                        {['goat', 'tiger'].map(side => (
                            <button key={side} onClick={() => this.setState({ aiSide: side === 'tiger' ? 'goat' : 'tiger' })}
                                className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold capitalize transition-colors ${humanSide === side ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-card text-muted-foreground hover:border-primary/40'}`}>
                                {side === 'goat' ? '20 Goats' : '4 Tigers'}
                            </button>
                        ))}
                    </div>

                    <p className="mb-2 text-sm font-medium text-muted-foreground">Difficulty</p>
                    <div className="mb-7 grid grid-cols-3 gap-2">
                        {difficulties.map(d => (
                            <button key={d} onClick={() => this.setState({ aiDifficulty: d })}
                                className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${this.state.aiDifficulty === d ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:border-primary/40'}`}>
                                {d}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => this.setState({ showSinglePlayerSetup: false })} className="rounded-full">Back</Button>
                        <Button onClick={this.startSinglePlayer} size="lg" className="flex-1 rounded-full text-base">Start game</Button>
                    </div>
                </div>
            )
        }
        const modes = [
            { onClick: this.singlePlayer, title: 'Play vs Computer', desc: 'Minimax AI — easy, medium or hard.', tag: 'Solo' },
            { onClick: this.twoPlayer, title: 'Two Players', desc: 'Pass and play on one device.', tag: 'Local' },
            { onClick: this.multiplayer, title: 'Online Multiplayer', desc: 'Create a room and share the link.', tag: 'Online' },
        ];
        return(
            <div className="mx-auto max-w-3xl px-5 py-12">
                <div className="mb-8 text-center animate-rise">
                    <p className="eyebrow">Choose a mode</p>
                    <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">How will you play?</h1>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                    {modes.map((m, i) => (
                        <button key={m.title} onClick={m.onClick}
                            className="heritage-card animate-rise group flex flex-col items-start gap-2 p-6 text-left transition-transform hover:-translate-y-1"
                            style={{ animationDelay: `${i * 80}ms` }}>
                            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-accent">{m.tag}</span>
                            <span className="font-display text-xl font-semibold">{m.title}</span>
                            <span className="text-sm text-muted-foreground">{m.desc}</span>
                            <span className="mt-2 text-sm font-medium text-primary transition-transform group-hover:translate-x-1">Play →</span>
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    render() {
        return(
            this.props.userInfo===null?
                <div className="mx-auto max-w-md px-5 py-20 text-center">
                    <h2 className="font-display text-2xl font-semibold">Please log in to continue</h2>
                    <p className="mt-2 text-muted-foreground">You need an account to play and track your record.</p>
                    <Button asChild className="mt-6 rounded-full px-7"><a href="/login">Log in</a></Button>
                </div>
                :
                <div>
                    <div id='gametype'>{this.choose()}</div>
                    <div id='multichoice'></div>
                </div>
        );
    }
}
