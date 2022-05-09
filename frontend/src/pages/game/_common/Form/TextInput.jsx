import React from 'react'
import PropTypes from 'prop-types'
import { useField, Formik } from 'formik'

import './TextInput.scss'
import TextPill from '../TextPill'

const TextInput = ({ size, className, isSubmitting, ...props }) => {
    const [field, meta] = useField(props)

    return (
        <>
            <input
                className={`form__text-input form__text-input__${size} ${
                    className ?? undefined
                }`}
                {...field}
                {...props}
            />
            {meta.touched && meta.error && (
                <TextPill alt={meta.error} style={TextPill.Style.Error}>
                    <p>no</p>
                </TextPill>
            )}
        </>
    )
}

TextInput.Sizes = Object.freeze({
    FullWidth: 'full-width',
})

TextInput.propTypes = {
    size: PropTypes.oneOf(Object.values(TextInput.Sizes)).isRequired,
    name: PropTypes.string,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    onSubmit: PropTypes.func,
}

export default TextInput
