import React, { useState } from 'react'

import './TextInput.scss'

const MINIMUM_VALUE = 100
const MAXIMUM_VALUE = 1000000000000

const moneyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
})

// Waiting for this -> ref: https://github.com/jaredpalmer/formik/pull/2255
function TextInput({ field, form, ...props }) {
    const { hasModifiers } = props

    const minimumValue = props.minimumValue ?? MINIMUM_VALUE
    const maximumValue = props.maximumValue ?? MAXIMUM_VALUE

    const constrainValue = (value) => {
        let constrainedValue = value
        if (constrainedValue < 1) {
            constrainedValue = 1
        }
        if (constrainedValue > maximumValue) {
            constrainedValue = maximumValue
        }
        if (isNaN(constrainedValue)) {
            constrainedValue = minimumValue
        }

        return constrainedValue
    }

    const applyModifier = (modifier) => {
        const inputValue = parseInt(`${field.value}`.replace(/\D/g, ''), 10)
        const modifiedValue = constrainValue(inputValue * modifier)

        form.setFieldValue(
            field.name,
            moneyFormatter.format(parseInt(`${modifiedValue}`, 10))
        )
    }

    const normalizeChanges = (event) => {
        if (event.target.value === '') {
            return field.onChange(event)
        }

        const inputValue = parseInt(
            `${event.target.value}`.replace(/\D/g, ''),
            10
        )
        // 1000 -> 1,000
        event.target.value = moneyFormatter.format(constrainValue(inputValue))

        field.onChange(event)
    }

    return (
        <div className="text-input">
            {hasModifiers && (
                <div className="wager-modifier">
                    <button
                        type="button"
                        className="multiplier"
                        onClick={() => applyModifier(0.5)}
                    >
                        1/2
                    </button>
                    <button
                        type="button"
                        className="multiplier"
                        onClick={() => applyModifier(2)}
                    >
                        2X
                    </button>
                    <button
                        type="button"
                        className="multiplier"
                        onClick={() => applyModifier(3)}
                    >
                        3X
                    </button>
                </div>
            )}

            <input
                type="text"
                {...field}
                onChange={normalizeChanges}
                {...props}
            />
        </div>
    )
}

export default TextInput
