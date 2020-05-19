import React, { Component } from 'react'

import './game.css';
import Board from './board.component'


class Game extends Component {
    constructor(props)
    {
        super(props);
        //this.changeColor = this.changeColor.bind(this);
        this.state ={
            history: [{
                squares: Array(25).fill(null),
            }],
            gisnext: true,
        };
    }

    handleClick(i){
        const history = this.state.history;
        const current = history[history.length-1];
        const squares = current.squares.slice();

        squares[i]= this.state.gisnext? 'G': 'T';
        this.setState((state, props) => ({
            history: history.concat([{
                squares: squares,
            }]),
            gisnext: !this.state.gisnext,
        }));

    }
/*
    getBoard(){
        console.log("get board function called");
        const objs = []
        for (var i=0; i < 25; i++) {
          objs.push(<div className="squares" onClick={this.playerMove} key={`Board${i.toString()}`}></div>)
        }
        return objs;
    }
*/


    render() {
        const history = this.state.history;
        const current = history[history.length -1];
        
        let status;
        status = 'Next player: ' + (this.state.gisnext ? 'Goat' : 'Tiger');
        return (
            <div className="game">
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{/*add smth*/}</ol>
                </div>
                <div>
                        {/*get the main board*/}
                        <Board
                            squares={current.squares}
                            handleClick={(i)=> this.handleClick(i)}
                        />
                        {/*contains all the illustrated paths/click divs and diagonal elements.*/}
                </div>
            </div>
        )
    }
}

export default Game;