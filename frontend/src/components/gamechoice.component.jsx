import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import Game from './game/game.component'
import Multichoice from './chat/multichoice.component'

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
            return(
                <div className="mx-auto max-w-2xl px-4 single-setup">
                    <h5>Play vs Computer</h5>
                    <label htmlFor="aiSideSelect">You play as: </label>
                    <select id="aiSideSelect" value={humanSide}
                            onChange={e => this.setState({ aiSide: e.target.value === 'tiger' ? 'goat' : 'tiger' })}>
                        <option value="goat">Goat</option>
                        <option value="tiger">Tiger</option>
                    </select>
                    {' '}
                    <label htmlFor="aiDiffSelect">Difficulty: </label>
                    <select id="aiDiffSelect" value={this.state.aiDifficulty}
                            onChange={e => this.setState({ aiDifficulty: e.target.value })}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                    {' '}
                    <button onClick={this.startSinglePlayer} className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">Start</button>
                </div>
            )
        }
        return(
            <div className="mx-auto max-w-2xl px-4">
                <button onClick={this.singlePlayer} className="w-full rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">Play vs Computer</button>{' '}
                <button onClick={this.twoPlayer} className="w-full rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">Two Players on same Device</button>{' '}
                <button onClick={this.multiplayer} className="w-full rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">Multiplayer</button>{'   '}
            </div>
        )
    }

    render() {
        return(
            this.props.userInfo===null?
                <div>
                    <h4>Please log in to continue.</h4>
                </div>
                :
                <div>
                    <div id='gametype'>{this.choose()}</div>
                    <div id='multichoice'></div>
                </div>
        );
    }
}
