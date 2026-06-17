import React, { Component } from 'react'
import './game.css';

/**/
/*
Square

NAME

        Square class - smallest unit of the game board

SYNOPSIS

        getPiece(p)      ->gets the image of the piece based on p
        render()          ->renders the component

DESCRIPTION

        This function will return a square, which is a position that a piece can occupy in the game.
        The square will contain the image of the piece that is meant to be there.

RETURNS

        Returns an image element for the piece that should be at this square.
        an empty element otherwise.

AUTHOR

        Prabal Chhatkuli

DATE

        07/15/2020

*/
/**/
export default class Square extends Component {
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
          
        </div>
    );
  }
}