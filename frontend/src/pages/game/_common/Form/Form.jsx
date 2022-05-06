import React from 'react'
import PropTypes from 'prop-types'

import './Form.scss'

const Form = ({ className, children, onSubmit }) => (
    <form
        className={className ?? undefined}
        onSubmit={onSubmit}
        autoComplete="off"
    >
        <input type="hidden" name="fasdasdz" autoComplete="off" />
        {children}
    </form>
)

Form.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
    onSubmit: PropTypes.func,
}

export default Form
