import React from 'react'
import './Content.scss'

function Content({ children, color, className, onClick, contentRef }) {
    return (
        <div
            className={`welcome-box welcome-box--${color} ${
                className ? className : ''
            }`}
            onClick={onClick ?? undefined}
            ref={contentRef ?? undefined}
        >
            {children}
        </div>
    )
}

export default Content
