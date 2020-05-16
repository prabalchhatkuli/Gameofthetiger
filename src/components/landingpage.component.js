import React from 'react'
import Image from 'react-bootstrap/Image'

export default function landingpage() {
    return (
        <div>
                <div className="text-center text-light bg-success">
                    Welcome!
                </div>
                
                <Image src={require("../SVG/landing.jpg")} fluid alt="background"/>
                
        </div>
    )
}
