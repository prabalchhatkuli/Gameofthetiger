import React, { Component } from 'react'

import './game.css';
import Board from './board.component'


class Game extends Component {
    /*constructor(props)
    {
        super(props);
        //this.changeColor = this.changeColor.bind(this);
    }*/

    shouldComponentUpdate()
    {
        console.log("components should updated");
    }

    componentDidUpdate()
    {
        console.log("components did updated");
    }

    playerMove(e)
    {
        console.log("div clicked");
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
        return (
            <div className="game">
                <div>
                        {/*get the main board*/}
                        <Board/>
                        {/*contains all the illustrated paths/click divs and diagonal elements.*/}
                </div>
                <div className="gameInfo">
                    <p>Here is game info</p>
                </div>
            </div>
        )
    }
}

export default Game;