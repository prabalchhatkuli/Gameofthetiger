import React, { Component } from 'react'

import './game.css';


class Game extends Component {
    render() {
        return (
            <div>
                <div className='board'>
                    <div className='board-row'>

                        <img src={require('../../SVG/squareright.svg')} alt="left square"/>{' '}
                        <img src={require('../../SVG/squareleft.svg')} alt="left square"/>{' '}
                        <img src={require('../../SVG/squareright.svg')} alt="left square"/>{' '}
                        <img src={require('../../SVG/squareleft.svg')} alt="left square"/>{' '}
                    
                    </div>

                    <div className='board-row'>

                        <img src={require('../../SVG/squareleft.svg')} alt="left square"/>{' '}
                        <img src={require('../../SVG/squareright.svg')} alt="left square"/>{' '}
                        <img src={require('../../SVG/squareleft.svg')} alt="left square"/>{' '}
                        <img src={require('../../SVG/squareright.svg')} alt="left square"/>{' '}
                        
                    </div>

                    <div className='board-row'>

                        <img src={require('../../SVG/squareright.svg')} alt="left square"/>{' '}
                        <img src={require('../../SVG/squareleft.svg')} alt="left square"/>{' '}
                        <img src={require('../../SVG/squareright.svg')} alt="left square"/>{' '}
                        <img src={require('../../SVG/squareleft.svg')} alt="left square"/>{' '}

                    </div>

                    <div className='board-row'>

                        <img src={require('../../SVG/squareleft.svg')} alt="left square"/>{' '}
                        <img src={require('../../SVG/squareright.svg')} alt="left square"/>{' '}
                        <img src={require('../../SVG/squareleft.svg')} alt="left square"/>{' '}
                        <img src={require('../../SVG/squareright.svg')} alt="left square"/>{' '}

                    </div>
                </div>
            </div>
        )
    }
}

export default Game;