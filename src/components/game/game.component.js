import React, { Component } from 'react'

import './game.css';


class Game extends Component {
    render() {
        return (
            <div>
                <div className='board'>
                    {/*1st*/}
                    <div class="square"></div>
                    <div class="square"></div>
                    <div class="square"></div>
                    <div class="square"></div>
                    <div class="square"></div>
                    {/*2nd*/}
                    <div class="square"></div>
                    <div class="square"></div>
                    <div class="square"></div>
                    <div class="square"></div>
                    <div class="square"></div>
                    {/*3rd*/}
                    <div class="square"></div>
                    <div class="square"></div>
                    <div class="square"></div>
                    <div class="square"></div>
                    <div class="square"></div>
                    {/*4th*/}
                    <div class="square"></div>
                    <div class="square"></div>
                    <div class="square"></div>
                    <div class="square"></div>
                    <div class="square"></div>
                    {/*5th*/}
                    <div class="square"></div>
                    <div class="square"></div>
                    <div class="square"></div>
                    <div class="square"></div>
                    <div class="square"></div>
                    {/*path div contains all the illustrated paths*/}
                    <div class="path">
                        {/*1st*/}
                        <div class="square linepath"></div>
                        <div class="square linepath"></div>
                        <div class="square linepath"></div>
                        <div class="square linepath"></div>
                        
                        {/*2nd*/}
                        <div class="square linepath"></div>
                        <div class="square linepath"></div>
                        <div class="square linepath"></div>
                        <div class="square linepath"></div>
                        
                        {/*3rd*/}
                        <div class="square linepath"></div>
                        <div class="square linepath"></div>
                        <div class="square linepath"></div>
                        <div class="square linepath"></div>
                        
                        {/*4th*/}
                        <div class="square linepath"></div>
                        <div class="square linepath"></div>
                        <div class="square linepath"></div>
                        <div class="square linepath"></div>
                        
                    </div>
                {/*
                    <div className='board-row'>

                        <img src={require('../../SVG/squareright.svg')} alt="right square"/>{' '}
                        <img src={require('../../SVG/squareleft.svg')} alt="left square"/>{' '}
                        <img src={require('../../SVG/squareright.svg')} alt="right square"/>{' '}
                        <img src={require('../../SVG/squareleft.svg')} alt="left square"/>{' '}
                    
                    </div>

                    <div className='board-row'>

                        <img src={require('../../SVG/squareleft.svg')} alt="left square"/>{' '}
                        <img src={require('../../SVG/squareright.svg')} alt="right square"/>{' '}
                        <img src={require('../../SVG/squareleft.svg')} alt="left square"/>{' '}
                        <img src={require('../../SVG/squareright.svg')} alt="right square"/>{' '}
                        
                    </div>

                    <div className='board-row'>

                        <img src={require('../../SVG/squareright.svg')} alt="right square"/>{' '}
                        <img src={require('../../SVG/squareleft.svg')} alt="left square"/>{' '}
                        <img src={require('../../SVG/squareright.svg')} alt="right square"/>{' '}
                        <img src={require('../../SVG/squareleft.svg')} alt="left square"/>{' '}

                    </div>

                    <div className='board-row'>

                        <img src={require('../../SVG/squareleft.svg')} alt="left square"/>{' '}
                        <img src={require('../../SVG/squareright.svg')} alt="right square"/>{' '}
                        <img src={require('../../SVG/squareleft.svg')} alt="left square"/>{' '}
                        <img src={require('../../SVG/squareright.svg')} alt="right square"/>{' '}

                    </div>
                */}
                </div>
            </div>
        )
    }
}

export default Game;