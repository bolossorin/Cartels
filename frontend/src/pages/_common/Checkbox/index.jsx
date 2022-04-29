import React from 'react'

import './Checkbox.scss'

function Checkbox({ field, form, meta, children, ...props }) {
    const disabled = props?.disabled || form.isSubmitting

    return (
        <div className="checkbox">
            <input
                id={field.name}
                disabled={disabled}
                type="checkbox"
                {...field}
                {...props}
            />
            <label htmlFor={field.name}>{children}</label>
        </div>
    )
}

export default Checkbox
