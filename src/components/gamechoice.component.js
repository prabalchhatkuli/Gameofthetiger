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
        };
        this.singlePlayer =  this.singlePlayer.bind(this);
        this.twoPlayer =  this.twoPlayer.bind(this);
        this.multiplayer =  this.multiplayer.bind(this);
    }

    singlePlayer(){
        ReactDOM.render(<Game choice="single" userInfo={this.props.userInfo}/>, document.getElementById('gametype'));
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
        if(!this.state.gamechosen){
            return(
                <div className="container">
                    <button onClick={this.twoPlayer} className="btn btn-primary form-control">Two Players on same Device</button>{' '}
                    <button onClick={this.multiplayer} className="btn btn-primary form-control">Multiplayer</button>{'   '}
                </div>
            )
        }
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
