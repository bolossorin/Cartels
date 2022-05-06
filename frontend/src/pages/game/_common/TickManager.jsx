import React, { useEffect, useState } from 'react'
import './Ticker.scss'

function getDurationDetails(dateStart, dateEnd) {
    const secondsRemaining = (dateEnd - window.ESCOBAR.getTime()) / 1000
    const totalSeconds = (dateEnd - dateStart) / 1000
    const pretty =
        dateEnd === null
            ? null
            : prettyDurationFromDiff(dateEnd - window.ESCOBAR.getTime())

    let percentageComplete = 0
    if (dateEnd !== null) {
        percentageComplete = parseFloat(
            `${Math.max(
                Math.min(
                    ((totalSeconds - secondsRemaining) / totalSeconds) * 100,
                    100
                ),
                0
            )}`
        ).toFixed(2)
    }

    let speed = 10000
    if (secondsRemaining <= 3620) {
        speed = 1000
    }
    if (secondsRemaining <= 7) {
        speed = 100
    }

    if (secondsRemaining <= 0) {
        return {
            seconds: 0,
            speed: 0,
            style: dateEnd === null ? 'pending' : 'expired',
            percentageComplete,
            pretty,
        }
    }

    if (secondsRemaining <= 5.2) {
        return {
            seconds: secondsRemaining.toFixed(1),
            speed,
            style: 'panic',
            percentageComplete,
            pretty,
        }
    }

    return {
        seconds: secondsRemaining.toLocaleString('en-US', {
            maximumFractionDigits: 0,
        }),
        speed,
        style: 'normal',
        percentageComplete,
        pretty,
    }
}

function dateOrNull(date) {
    return ['', null].includes(date) ? null : new Date(date)
}

function prettyDurationFromDiff(diff) {
    const parts = {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    }

    const diffParts = Object.keys(parts).map((part) => {
        if (!parts[part] && part !== 'seconds') return

        return `${parts[part]}${part.substr(0, 1)}`
    })

    return diffParts
        ?.filter((part) => part !== undefined)
        ?.slice(0, 2)
        ?.join(' ')
}

function TickManager({ dateStart, dateEnd, children, onExpiry }) {
    const [ticker, setTicker] = useState(null)
    useEffect(() => {
        let timeout
        ;(async function tickerEffect(dateStart, dateEnd, onExpiry) {
            let ticker = getDurationDetails(dateStart, dateEnd)
            setTicker(ticker)

            if (ticker.speed !== 0) {
                timeout = setTimeout(() => {
                    tickerEffect(dateStart, dateEnd, onExpiry)
                }, ticker.speed)
            }

            if (ticker.speed === 0) {
                onExpiry?.()
            }
        })(dateOrNull(dateStart), dateOrNull(dateEnd), onExpiry)

        return () => {
            clearTimeout(timeout)
        }
    }, [dateStart, dateEnd])

    return (
        <>
            {ticker !== null &&
                children({
                    seconds: ticker?.seconds,
                    style: ticker?.style,
                    percent: ticker?.percentageComplete,
                    pretty: ticker?.pretty,
                    prettyShort: ticker?.pretty?.split(' '),
                })}
        </>
    )
}

export default TickManager
