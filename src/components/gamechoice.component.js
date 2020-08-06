import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import Game from './game/game.component'

export default class GameChoice extends Component {

    constructor(props){
        super(props);
        this.state ={
            gamechosen: false
        };
        this.singlePlayer =  this.singlePlayer.bind(this);

    }

    singlePlayer(){
        ReactDOM.render(<Game/>, document.getElementById('gametype'));
    }

    twoPlayer(){
        ReactDOM.render(<Game/>, document.getElementById('gametype'));
    }

    multiplayer(){
        ReactDOM.render(<Game/>, document.getElementById('gametype'));
    }

    choose(){
        if(!this.state.gamechosen){
            return(
                <div className="container">
                    <button onClick={this.twoPlayer} className="btn btn-primary form-control">Two Players on same Device</button>{' '}
                    <button onClick={this.multiplayer} className="btn btn-primary form-control">Multiplayer</button>{'   '}
                    <button onClick={this.singlePlayer} className="btn btn-primary form-control">VS AI</button>{'  '}
                </div>
            )
        }
    }
    

    render() {
        return(
        <div id='gametype'>{this.choose()}</div>
             
        );
    }
}
