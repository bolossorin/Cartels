import React from 'react'

import './Cooldown.scss'
import TickManager from '../../game/_common/TickManager'
import useCooldown from '../../../hooks/useCooldown'

function Cooldown({ timer, excludeJail, ignore, children }) {
    const cooldown = useCooldown(timer, excludeJail ?? false)
    const resting = !!cooldown && !ignore

    return (
        <>
            <div className="cooldown-container">
                <div
                    className={`cooldown-box cooldown-box__${
                        resting ? 'active' : 'hidden'
                    } cooldown-box__${cooldown?.name}`}
                >
                    <div className={`cooldown-box__title`}>
                        {cooldown?.name === 'jail'
                            ? `Imprisoned`
                            : `Recovering`}
                    </div>
                    <div className={`cooldown-box__ticker`}>
                        <p className="timer">
                            {resting && (
                                <TickManager
                                    dateStart={cooldown.startedAt}
                                    dateEnd={cooldown.expiresAt}
                                >
                                    {({ pretty }) => <>{pretty}</>}
                                </TickManager>
                            )}
                        </p>
                        <p className="timer-tag">
                            Until{' '}
                            {cooldown?.name === 'jail' ? `released` : `ready`}
                        </p>
                    </div>
                </div>
                <div
                    className={`cooldown-fade cooldown-fade__${
                        resting ? 'active' : 'hidden'
                    }`}
                >
                    {children}
                </div>
            </div>
        </>
    )
}

export default Cooldown
