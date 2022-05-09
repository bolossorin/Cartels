import React from 'react'
import './Text.scss'

function Text({ children, ...classes }) {
    const addClasses = Object.keys(classes)
        .map((name) => `content-text__${name} `)
        .join('')

    return <div className={`content-text ${addClasses}`}>{children}</div>
}

export default Text
