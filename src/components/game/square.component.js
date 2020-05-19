import React, { Component } from 'react'
import './game.css';

export default class Square extends Component {
  constructor(props)
  {
    super(props);
    this.state={
      value:null,
      e:false,
      ne:false,
      n:false,
      nw:false,
      w:false,
      sw:false,
      s:false,
      se:false
    }

    this.clickfunction= this.clickfunction.bind(this);
  }
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
  clickfunction= ()=> {
    this.setState((state, props)=>({
      value:'Goat'
    }))
  }

  render() {
    return (
        <div 
          className="squares" 
          onClick={this.clickfunction}>
          {this.state.value}
        </div>
    );
  }
}