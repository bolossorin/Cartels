import React, { useRef, useEffect, useState } from 'react'

import './Textarea.scss'

function Textarea({ field, form, meta, ...props }) {
    const inputElement = useRef(null)
    const [inputMeta, setInputMeta] = useState(null)

    const disabled = props?.disabled || form.isSubmitting

    const value = field.value
    useEffect(() => {
        const formName = inputElement?.current?.form?.name
        if (formName) {
            const meta = {
                ...inputMeta,
            }
            if (meta?.distances?.length >= 10) {
                meta.distances = meta.distances.slice(0, 9)
            }
            if (inputMeta === null) {
                meta.startTyping = new Date()
                meta.distances = []
                meta.lastEntry = new Date()
            } else {
                meta.distances.unshift((new Date() - meta.lastEntry) / 1000)
                meta.lastEntry = new Date()
            }

            setInputMeta(meta)
        }
    }, [value])

    const encoded = inputMeta ? JSON.stringify(inputMeta) : ''

    const error = form.touched[field.name] && form.errors[field.name]

    return (
        <div className="textarea-container">
            {error && <span className="textarea__error-text">{error}</span>}
            <div
                className={`textarea ${disabled ? 'textarea__disabled' : ''} ${
                    error ? 'textarea__error' : ''
                }`}
            >
                <textarea
                    ref={inputElement}
                    id={field.name}
                    {...field}
                    {...props}
                    data-performance-meta={encoded}
                    disabled={disabled}
                />
            </div>
        </div>
    )
}

export default Textarea
