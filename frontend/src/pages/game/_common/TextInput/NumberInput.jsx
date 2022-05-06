import React, { useState } from 'react'

import './TextInput.scss'
import Button from '../../../_common/Button'

const MINIMUM_VALUE = 0
const MAXIMUM_VALUE = 1000000

const numberFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
})

// Waiting for this -> ref: https://github.com/jaredpalmer/formik/pull/2255
function NumberInput({ field, form, ...props }) {
    const { hasModifiers } = props

    const minimumValue = props.minimumValue ?? MINIMUM_VALUE
    const maximumValue = props.maximumValue ?? MAXIMUM_VALUE

    const constrainValue = (value) => {
        let constrainedValue = value
        if (constrainedValue < MINIMUM_VALUE) {
            constrainedValue = MINIMUM_VALUE
        }
        if (constrainedValue > maximumValue) {
            constrainedValue = maximumValue
        }
        if (isNaN(constrainedValue)) {
            constrainedValue = minimumValue
        }

        return constrainedValue
    }

    const applyUpdate = (update) => {
        const inputValue = parseInt(`${field.value}`.replace(/\D/g, ''), 10)
        const modifiedValue = constrainValue(inputValue + update)

        form.setFieldValue(
            field.name,
            numberFormatter.format(parseInt(`${modifiedValue}`, 10))
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
        event.target.value = numberFormatter.format(constrainValue(inputValue))

        field.onChange(event)
    }

    return (
        <div className="text-input">
            <div className="rocker">
                <Button
                    styleType="primary"
                    color="white"
                    linkTag
                    className="multiplier"
                    onClick={() => applyUpdate(-1)}
                >
                    -
                </Button>
            </div>

            <input
                type="text"
                {...field}
                onChange={normalizeChanges}
                {...props}
            />

            <div className="rocker">
                <Button
                    styleType="primary"
                    color="white"
                    linkTag
                    className="multiplier"
                    onClick={() => applyUpdate(1)}
                >
                    +
                </Button>
            </div>
        </div>
    )
}

export default NumberInput
