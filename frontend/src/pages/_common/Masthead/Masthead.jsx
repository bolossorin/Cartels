import React from 'react'
import './Masthead.scss'

function Masthead({ children, fullWidth }) {
    return (
        <div
            className={`content-masthead ${
                fullWidth ? 'content-masthead__full' : ''
            }`}
        >
            <span>{children}</span>
        </div>
    )
}

export default Masthead
