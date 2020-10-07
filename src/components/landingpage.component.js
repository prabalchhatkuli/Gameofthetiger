import React from 'react'
import Image from 'react-bootstrap/Image'

export default function landingpage(props) {
    return (
        <div>
                <div className="text-center text-light bg-success">
                    Welcome! {'  '}
                    {props.userInfo === null ? <p>Visitor</p> : props.userInfo.email }
                </div>
                
                <Image src={require("../SVG/landing.jpg")} fluid alt="background"/>
                <h1>hello there</h1>
                
        </div>
    )
}
