import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import axios from 'axios';

export default class Multichoice extends Component {
    constructor(props){
        super(props);
        this.state={modalShow:true, playerPiece:null, linkId:null};
        this.onCloseButtonClick =  this.onCloseButtonClick.bind(this);
        this.onGenerateButtonClick =  this.onGenerateButtonClick.bind(this);
    }

    onCloseButtonClick(e)
    {
        this.setState({
            modalShow: false,
          })
        
          //rederect to the gameChoice page
          window.location.href="/game"
    }

    setPlayerPiece(event) {
        this.setState({
            playerPiece: event.target.value,
          })
        console.log(event.target.value);
    }

    async onGenerateButtonClick(event){
        console.log("Generating randomly generated link");
        let payload={adminPiece:this.state.playerPiece};
        try
        {
            const response = await axios.post('http://localhost:5000/room/generate',payload);

            //no need to implement callback
            this.setState(()=>({
                linkId: response.data.roomID
            }));
        }
        catch(error)
        {
            console.log(error);
            const errorMsg = <p className="text-warning">Error in generating key. Please press again.</p>
            ReactDOM.render(errorMsg, document.getElementById('generate result'));
            return;
        }
        const successMsg = <p className="text-success">http://localhost:3000/game/room/{this.state.linkId}</p>
        ReactDOM.render(successMsg, document.getElementById('generate result'));
    }

    render() {
        return (
            <div>
                <Modal
                    show={this.state.modalShow}
                    onHide={this.onCloseButtonClick}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                        Multiplayer game
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h5>Join:</h5>
                        <Tabs defaultActiveKey="new" id="uncontrolled-tab-example">
                            <Tab eventKey="new" title="Create New Room">
                                <p>Share the link below with your friends</p>
                                <div id='generate result'></div>
                                <Button onClick={this.onGenerateButtonClick}>Generate game link</Button>
                                <p id="gameLink"></p>
                                <h6>Choose Your piece</h6>
                                <div class="custom-control custom-radio custom-control-inline" onChange={this.setPlayerPiece.bind(this)}>
                                <input type="radio" id="GoatChoice" name="PieceChoice" value='goat' class="custom-control-input"/>
                                <label class="custom-control-label" for="GoatChoice">Goat</label>
                                </div>
                                <div class="custom-control custom-radio custom-control-inline" onChange={this.setPlayerPiece.bind(this)}>
                                <input type="radio" id="TigerChoice" name="PieceChoice" value='tiger' class="custom-control-input"/>
                                <label class="custom-control-label" for="TigerChoice">Tiger</label>
                                </div>
                                <Button >Submit</Button>
                            </Tab>
                            <Tab eventKey="old" title="Join with link">
                            <label for="JoinGame">Paste the URL Below to join the Room:</label>
                            <input type="url" id="JoinGame" name="JoinGame" class="form-control"/><br/><br/>
                            <Button>Join Game</Button>
                            </Tab>
                        </Tabs>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.onCloseButtonClick}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}
