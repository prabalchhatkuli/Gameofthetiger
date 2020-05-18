import React, { Component } from 'react'

import './game.css';


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

    getBoard(){
        console.log("get board function called");
        const objs = []
        for (var i=0; i < 25; i++) {
          objs.push(<div className="squares" onClick={this.playerMove} key={`Board${i.toString()}`}></div>)
        }
        return objs;
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
            <div>
                <div className='board'>
                    {/*get the main board*/}
                        {this.getBoard()}
                    {/*contains all the illustrated paths and diagonal elements.*/}
                    <div className="squares inner-square">
                        {this.getIllustrations()}
                    </div>
                </div>
            </div>
        )
    }
}

export default Game;