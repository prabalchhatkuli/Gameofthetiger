import React, { Component } from 'react'
import './game.css';

export default class Square extends Component {
  // constructor(props)
  // {
  //   super(props);
  //   this.state={
  //     value:null,
  //     e:false,
  //     ne:false, 
  //     n:false,
  //     nw:false,
  //     w:false,
  //     sw:false,
  //     s:false,
  //     se:false
  //   }
  // }
//set state according to props, the props contain information on what direction 
//a square will allow movemements
/*  componentWillMount(){
    this.setState((state, props)=>({
      animal:props.animal,
      e:props.e,
      ne:props.ne,
      n:props.n,
      nw:props.nw,
      w:props.w,
      sw:props.sw,
      s:props.s,
      se:props.se
    }));
  }
  */
  getPiece(p){
    switch(p){

      case 'T':    return <img
          alt=""
          src={require('../../SVG/tigerpiece.svg')}
          width="45%"
          height="45%"
          className="d-inline-block align-top"
          />

  
      case 'G':    return <img
          alt=""
          src={require('../../SVG/goatpiece.svg')}
          width="60%"
          height="60%"
          className="d-inline-block align-top"
          />

      default: 
    }
  }

  render() {
    return (
        <div 
          className="squares" 
          onClick={this.props.onClick}>
          {this.getPiece(this.props.value.player)}
          {this.props.index}
        </div>
    );
  }
}