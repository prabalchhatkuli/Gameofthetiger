import React, { Component } from 'react'
import {Provider} from 'react-redux'
import './game.css';
import Board from './board.component'
import Tiger from '../piece/tigerpiece.component'
import Goat from '../piece/goatpiece.component'
import Piece from '../piece/piece.component'
//import fallenanimals from './fallenanimals.component'


class Game extends Component {
    constructor(props)
    {
        super(props);
        //this.changeColor = this.changeColor.bind(this);  Array(25).fill(new Piece())
        this.state ={
            history: [{
                squares: Array(25).fill(new Piece()),
            }],
            gisnext: true,
            sourceSelection:-1,
            destinationSelection:0,
            goatsOnBoard:0,//always <=20
            status:''
        };
    }
    
    //tigers start at the four corners of the board
    componentDidMount(){
        let startstate = Array(25).fill(new Piece());
        startstate[0]=new Tiger();
        startstate[4]=new Tiger();
        startstate[20]=new Tiger();
        startstate[24]=new Tiger();
        //here over-rwriting the initial null board state with tigers built in
        this.setState({
            history: [{
                squares:startstate
            }]
        })
    }

//----------------------------------------------------------handleClick()-------------------------------------------------
    handleClick(i){
        const history =  this.state.history;
        const current = history[history.length-1];
        const squares = current.squares.slice();
        console.log("clicked "+ i);
        //if source selection == -1
        if(this.state.sourceSelection===-1){
            //if clicked div has the piece that another player's piece is in
                //give status error
            if((squares[i].player==='T'&&this.state.gisnext) || (squares[i].player==='G'&&!this.state.gisnext))
            {
                console.log("wrong piece to move");
                return;
            }

            //if clicked on unoccupied div: 
                //give status error
            if(this.state.gisnext)
            {
                console.log(squares[i].player);
                if(squares[i].player===null){
                    //need to do something
                    //count g and if number is less than 20 continue
                    if(this.state.goatsOnBoard<16)
                    {
                        console.log("goats placed");
                        squares[i]=new Goat();
                        this.setState((state, props)=>{
                            return {goatsOnBoard: state.goatsOnBoard+1};
                        });
                    }
                    else
                    {
                        console.log("Already used all 16 goats");
                        return;
                    }
                }

                //try to move the goat
                else
                {
                    console.log(this.state.goatsOnBoard);
                    if(this.state.goatsOnBoard>=16)
                    {
                        this.setState((state, props)=>{
                            return {sourceSelection: i};
                        });
                        console.log("source selected "+ i);
                    }
                    else
                    {
                        console.log("place all 16 goats before moving");
                    }
                    return;
                }
            }
            //try to place a new tiger
            if(!this.state.gisnext)
            {
                if(squares[i].player===null)
                {
                    //clicked on incorrect place for tiger//give error
                    console.log("cannot place more than 4 tigers. Choose tiger first");
                    return;
                }
                
                //try to move tiger
                //if clicked correct piece
                    //change the background color of the div : this is the source div
                    //change source selection to the index of the div
                if(squares[i].player==='T')
                {
                    this.setState((state, props)=>{
                        return {sourceSelection: i};
                    });
                    console.log("4");
                    return;
                }
            }
        }
        else{
        //if source selection is not -1 : player chose the destination
            //if source selection not -1 and the next div is the same
            //change the backgroundn color back to what it was
            //do nothing
            if(this.state.sourceSelection===i)
            {
                //do nothing
                //don't change user
                this.setState((state, props)=>{
                    return {sourceSelection: -1};
                });
                console.log("selection cancelled");
                return;
            }
            //check if destination is valid
            if(squares[i].player!=null)
            {
                //error: destination square not empty
                console.log("destination is not empty: choose an empty destination");
                return;
            }
            //if valid dest position of the piece
                //switch the user: whoever will play next
            else
            {
                //execute the move
                squares[i]=this.state.gisnext? new Goat():new Tiger();
                //remove the object in square[this.state.sourceSelection]
                squares[this.state.sourceSelection]=new Piece();
                this.setState((state, props)=>{
                    return {sourceSelection: -1};
                });
                console.log("destination selected: "+i);
                //change user
            }
        }

        this.setState((state, props) => ({
            history: history.concat([{
                squares: squares,
            }]),
            gisnext: !this.state.gisnext,
        }));

    }
//---------------------------------------------------handleclick()----------------------------------------------------------
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