import React from 'react'

import './Button.scss'

const BUTTON_STYLES = ['green', 'red', 'secondary', 'cancel']

function Button({ children, className, style, ...attributes }) {
    let classes = ''
    if (attributes?.className) {
        classes += `${attributes?.className} `
    }
    if (BUTTON_STYLES.includes(style)) {
        classes += `button__${style} `
    }

    return (
        <button
            {...attributes}
            className={`button ${classes}`}
            onClick={!attributes?.disabled ? attributes?.onClick : undefined}
        >
            {children}
        </button>
    )
}

export default Button
