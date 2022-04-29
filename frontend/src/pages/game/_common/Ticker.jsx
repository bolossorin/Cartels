import React, { useEffect, useState } from 'react'
import './Ticker.scss'

function tickTock(date) {
    const seconds = (date - new Date()) / 1000

    if (seconds <= 0) {
        return {
            seconds: 0,
            speed: 0,
            style: 'expired',
        }
    }

    if (seconds <= 5.2) {
        return {
            seconds: seconds.toFixed(1),
            speed: 100,
            style: 'panic',
        }
    }

    return {
        seconds: seconds.toLocaleString('en-US', { maximumFractionDigits: 0 }),
        speed: seconds <= 6 ? 100 : 1000,
        style: 'normal',
    }
}

// deprecated
const Ticker = ({ seconds, expiryText, onExpiry }) => {
    const [ticker, setTicker] = useState(null)
    useEffect(() => {
        let timeout
        const dateObj = new Date()
        dateObj.setSeconds(dateObj.getSeconds() + parseInt(seconds))

        ;(async function tickerEffect(date, onExpiry) {
            let ticker = tickTock(date)
            setTicker(ticker)

            if (ticker.speed !== 0) {
                timeout = setTimeout(() => {
                    tickerEffect(date, onExpiry)
                }, ticker.speed)
            }

            if (ticker.speed === 0) {
                onExpiry?.()
            }
        })(dateObj, onExpiry)

        return () => {
            clearTimeout(timeout)
        }
    }, [seconds])

    return (
        <>
            <span className={`ticker ticker__${ticker?.style ?? 'loading'}`}>
                {ticker === null ? (
                    <>⌛</>
                ) : (
                    <>
                        {ticker.seconds === 0 ? (
                            expiryText ?? 'Exp'
                        ) : (
                            <>{ticker.seconds}s</>
                        )}
                    </>
                )}
            </span>
        </>
    )
}

export default Ticker
