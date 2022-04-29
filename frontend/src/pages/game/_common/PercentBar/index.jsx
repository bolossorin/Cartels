import React from 'react'

import './PercentBar.scss'

function PercentBar({
    value,
    maxValue,
    showMaxValue,
    unit,
    color,
    label,
    children,
}) {
    return (
        <div className={`percent-bar percent-bar--${color}`}>
            <div
                className="filled-bar"
                style={{
                    width: `${(value / maxValue) * 100 < 100 ? (value / maxValue) * 100 : 100}%`,
                }}
            />
            {!!children ? (
                <p>{children}</p>
            ) : (
                <p>
                    {value?.toLocaleString('en-US')}{' '}
                    {showMaxValue
                        ? `/ ${maxValue?.toLocaleString('en-US')}`
                        : ''}{' '}
                    {unit}
                </p>
            )}

            {label && <p className="percent-bar__label">{label}</p>}
        </div>
    )
}

export default PercentBar
