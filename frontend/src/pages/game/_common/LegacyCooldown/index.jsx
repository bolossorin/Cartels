import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import Ticker from '../Ticker'
import useJailFeed from '../../../../hooks/useJailFeed'
import './Cooldown.scss'

function LegacyCooldown({
    cooldown,
    expiryText,
    children,
    ignoreJail,
    ignoreFeature,
}) {
    const { selfRelease } = useJailFeed()

    const isJailCooldown =
        !ignoreJail && selfRelease !== undefined && selfRelease > 0
    const isFeatureCooldown =
        !ignoreFeature && cooldown !== undefined && cooldown > 0
    const ignoreAll = ignoreFeature && ignoreJail
    const isCooldown = isJailCooldown || isFeatureCooldown

    const [seconds, setSeconds] = useState(0)
    useEffect(() => {
        if (seconds !== -1) {
            const cooldownSeconds = Math.max(
                ignoreJail ? 0 : selfRelease ?? 0,
                ignoreFeature ? 0 : cooldown ?? 0
            )

            setSeconds(isCooldown ? cooldownSeconds : 0)
        }
    }, [isJailCooldown, isFeatureCooldown, cooldown, selfRelease, seconds])
    console.log({ ignoreJail, ignoreFeature, ignoreAll })

    const cooldownShown = seconds === selfRelease ? 'jail' : 'feature'

    function handleExpiry() {
        setSeconds(-1)
    }

    return (
        <>
            <div className="cooldown-container">
                <section
                    className={`cooldown-box cooldown-box__${
                        seconds > 0 ? 'active' : 'hidden'
                    }`}
                >
                    <h1>
                        {cooldownShown === 'jail' ? `Imprisoned` : `Cooldown`}
                    </h1>
                    <article>
                        <p className="timer">
                            {seconds > 0 && (
                                <Ticker
                                    seconds={seconds}
                                    expiryText={
                                        cooldownShown === 'jail'
                                            ? `Free!`
                                            : `Rested!`
                                    }
                                    onExpiry={handleExpiry}
                                />
                            )}
                        </p>
                        <p className="timer-tag">
                            Until{' '}
                            {cooldownShown === 'jail' ? `freed` : `rested`}
                        </p>
                    </article>
                </section>
                <div
                    className={`cooldown-fade cooldown-fade__${
                        seconds > 0 ? 'active' : 'hidden'
                    }`}
                >
                    {children}
                </div>
            </div>
        </>
    )
}

LegacyCooldown.propTypes = {
    timer: PropTypes.number,
    children: PropTypes.node,
}

export default LegacyCooldown
