import React, { useState, useEffect } from 'react'
import './Header.scss'

function HeaderClock() {
    const [formattedTime, setFormattedTime] = useState('00:00:00')

    useEffect(() => {
        const effect = setInterval(() => {
            updatedTime()
        }, 1000)
        updatedTime()

        return () => clearInterval(effect)
    }, [updatedTime])

    function updatedTime() {
        const currentTime = window.ESCOBAR.getTime()

        const match = /T(.*)\./gm.exec(currentTime.toISOString())[1]

        setFormattedTime(match)
    }

    return (
        <p className="timer">
            GAME TIME: <span className="timer__seconds">{formattedTime}</span>
            <span className="timer__no-seconds">
                {formattedTime.substr(0, 5)}
            </span>
        </p>
    )
}

export default HeaderClock
