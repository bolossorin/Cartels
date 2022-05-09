import React, { useEffect, useRef } from 'react'

import Error from 'img/toast/toast_failed.svg'
import Success from 'img/toast/toast_success.svg'
import Megaphone from 'img/toast/toast_error.svg'
import Close from 'img/toast/close.svg'

function Toast({ children, remove, variant, title }) {
    const removeRef = useRef()
    removeRef.current = remove

    useEffect(() => {
        const duration = 7000
        const id = setTimeout(() => removeRef.current(), duration)

        return () => clearTimeout(id)
    }, [])

    let Icon = Megaphone
    if (variant === 'error') {
        Icon = Error
    }
    if (variant === 'success') {
        Icon = Success
    }

    return (
        <div className="toast">
            <div className={`toast__icon toast__icon__${variant}`}>
                <img src={Icon} alt={variant} />
            </div>
            <div className="toast__text">
                {title && <h2>{title}</h2>}
                <p>{children}</p>
            </div>
            <div className="toast__close-btn">
                <button onClick={remove}>
                    <img src={Close} alt={`Close toast notification`} />
                </button>
            </div>
        </div>
    )
}

export default Toast
