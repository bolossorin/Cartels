import React from 'react'
import PropTypes from 'prop-types'

import './Button.scss'

const Button = ({ size, className, children, onSubmit, ...props }) => (
    <>
        <button
            type="text"
            className={`form__button form__button__${size} ${
                className ?? undefined
            }`}
            onSubmit={onSubmit}
            {...props}
        >
            {children}
        </button>
    </>
)

Button.Sizes = Object.freeze({
    LargeCTA: 'large-cta',
})

Button.propTypes = {
    size: PropTypes.oneOf(Object.values(Button.Sizes)).isRequired,
    className: PropTypes.string,
    children: PropTypes.node,
    onSubmit: PropTypes.func,
}

export default Button
