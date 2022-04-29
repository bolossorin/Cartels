import React from 'react'

import './ProgressStrip.scss'
import ProgressBar from '../ProgressBar'

function ProgressStrip({ progress, level, min, max }) {
    return (
        <article className="progress-strip">
            {progress !== undefined && (
                <ProgressBar
                    progress={progress}
                    label={`Level ${level}`}
                    min={min}
                    max={max}
                />
            )}
            {progress === undefined && (
                <b>Loading...</b>
            )}
        </article>
    )
}

export default ProgressStrip
