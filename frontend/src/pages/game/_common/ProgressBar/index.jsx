import React from 'react'

import './ProgressBar.scss'

function ProgressBar({
    progress,
    min,
    max,
    label,
    pendingLabel,
    fullLabel,
    unit,
    className,
}) {
    const minimum = min ?? 0
    const maximum = max ?? 100

    if (pendingLabel) {
        return (
            <div
                className={`progress-bar progress-bar__no-unit progress-bar__pending`}
            >
                <p className="bar-label bar-label__pending">{pendingLabel}</p>
                <div className="full-bar">
                    <div className="bar" />
                </div>
            </div>
        )
    }

    const progressPercentage =
        ((progress - minimum) / (maximum - minimum)) * 100
    const percentage = Math.floor(
        Math.min(Math.max(progressPercentage, 0), 100)
    )

    const progressLabel =
        maximum === undefined ? progress : `${progress}/${maximum}`

    return (
        <div
            className={`progress-bar ${className ?? ''} ${
                !unit ? 'progress-bar__no-unit' : ''
            } ${percentage === 100 ? 'progress-bar__full' : ''}`}
        >
            <p className="progress-amount">
                {percentage !== 100 ? progressLabel : ''}
            </p>
            <p className="bar-label">
                {percentage === 100 ? fullLabel : label}
            </p>
            {unit && <p className="bar-unit">{unit}</p>}
            <div className="full-bar">
                <div
                    className="bar"
                    style={{
                        width: `${percentage}%`,
                    }}
                />
            </div>
        </div>
    )
}

export default ProgressBar
