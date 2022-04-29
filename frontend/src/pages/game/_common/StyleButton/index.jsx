import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import './StyleButton.scss'

import Dice from '../../../../assets/images/index.svg'

const StyleButton = ({ text, color, loading, disabled, onClick }) => (
    <button
        onClick={disabled ? undefined : onClick}
        className={`styled-button styled-button__${color} ${
            loading ? 'styled-button__loading' : ''
        } ${disabled ? 'styled-button__disabled' : ''}`}
    >
        {loading ? (
            <Fragment>
                <span>&#9733;</span>
                <span>&#9733;</span>
                <span>&#9733;</span>
            </Fragment>
        ) : (
            text
        )}
    </button>
)

StyleButton.color = Object.freeze({
    blue: 'blue',
    yellow: 'yellow',
    red: 'red',
    purple: 'purple',
})

StyleButton.propTypes = {
    text: PropTypes.string.isRequired,
    color: PropTypes.oneOf(Object.values(StyleButton.color)).isRequired,
    loading: PropTypes.bool,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
}

export default StyleButton
