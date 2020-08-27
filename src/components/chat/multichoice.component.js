import React, { Component } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'

export default class Multichoice extends Component {
    constructor(props){
        super(props);
        this.state={modalShow:true};
        this.onCloseButtonClick =  this.onCloseButtonClick.bind(this);
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
        console.log(event.target.value);
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
                                <Button >Generate game link</Button>
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
