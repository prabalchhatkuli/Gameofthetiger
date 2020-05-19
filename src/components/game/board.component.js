import React, { Component } from 'react'
import Square from './square.component'
import './game.css'

export default class Board extends Component {
    constructor(props){
        super(props);
        //array will have characters G/T/null
        this.state={
            squares:Array(25).fill(null)
        }
    }
    renderSquare(i) {
        return (
          <Square value={this.state.squares[i]}/>
        );
      }
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
      render() {
        return (
          <div className="board">
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
            <div className="squares inner-square">
                {this.getIllustrations()}
            </div>
        </div>
        );
      }
}
