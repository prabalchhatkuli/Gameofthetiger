import React, { Component } from 'react'
import Square from './square.component'
import './game.css'

/**/
/*
class Board

NAME

        Board class - class for the game board

SYNOPSIS
        renderSquare(i)     -> renders a square with index i
        getIllustrations(i)   ->gets the design for the board

DESCRIPTION

        The board class makes the board for the game. It generates 25 squares, that are the postions
        where the pieces can move during the game. In addition, it also generates the illustration showing the 
        basic layout structure.

RETURNS

        Returns true if the open was successful and false if it was opened
        as a phantom.  One of these two cases will always occur.

AUTHOR

        Victor Miller

DATE

        6:27pm 9/1/2001

*/
/**/

export default class Board extends Component {
    
  //render the squares for positions in the board
    renderSquare(i) {
        return (
          <Square 
            index={i}
            value={this.props.squares[i]}
            onClick={()=>this.props.handleClick(i)}
          />
        );
      }


    //make the illustration design in the board
    getIllustrations(){
        const objs = [];
        let keyCounter=0;//keys are needed for listed elements

        for (let i=0; i < 2; i++) {
            for (let j=0; j < 2; j++) {
                objs.push(<div className="squares outline1" key={`illustration${keyCounter.toString()}`}></div>);
                keyCounter++;
                objs.push(<div className="squares outline2" key={`illustration${keyCounter.toString()}`}></div>);
                keyCounter++;
            }
            for (let j=0; j< 2; j++) {
                objs.push(<div className="squares outline2" key={`illustration${keyCounter.toString()}`}></div>);
                keyCounter++;
                objs.push(<div className="squares outline1" key={`illustration${keyCounter.toString()}`}></div>);
                keyCounter++;
            }
        }

        return objs;
    }

    //render method for the board
    render() {
      return (
        <div className="board">
          <div className="squares inner-square">
              {this.getIllustrations()}
          </div> 
            {this.renderSquare(0)}
            {this.renderSquare(1)}
            {this.renderSquare(2)}
            {this.renderSquare(3)}
            {this.renderSquare(4)}
            {this.renderSquare(5)}
            {this.renderSquare(6)}
            {this.renderSquare(7)}
            {this.renderSquare(8)}
            {this.renderSquare(9)}
            {this.renderSquare(10)}
            {this.renderSquare(11)}
            {this.renderSquare(12)}
            {this.renderSquare(13)}
            {this.renderSquare(14)}
            {this.renderSquare(15)}
            {this.renderSquare(16)}
            {this.renderSquare(17)}
            {this.renderSquare(18)}
            {this.renderSquare(19)}
            {this.renderSquare(20)}
            {this.renderSquare(21)}
            {this.renderSquare(22)}
            {this.renderSquare(23)}
            {this.renderSquare(24)}
      </div>
      );
    }
}
