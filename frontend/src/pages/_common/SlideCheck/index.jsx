import React from 'react'
import './SlideCheck.scss'

function SlideCheck({ onChange, checked, disabled, name, label, className }) {
    return (
        <div
            className={`slider-container ${
                disabled ? 'slider-container--disabled' : ''
            } ${className ? className : ''}`}
        >
            <label htmlFor={name}>{label}</label>
            <label className="switch">
                <input
                    type="checkbox"
                    id={name}
                    disabled={disabled}
                    checked={checked}
                    onChange={onChange}
                />
                <span className="slider round">&nbsp;</span>
            </label>
        </div>
    )
}

export default SlideCheck
