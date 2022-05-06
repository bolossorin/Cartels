import React from 'react'
import { Link } from 'react-router-dom'
import GambleBackground from 'img/gamble/gamble-background.png'

import './Gamble.scss'
import Numerals from 'numeral'

import GovBuilding from 'img/govbuilding.svg'

function BasicGambleCell({ owner, info, classes }) {
    return (
        <td className={`property-cell ${classes}`}>
            <p>{owner}</p>
            <p className="property-cell__max-bet">{info}</p>
        </td>
    )
}

function GambleCell({ property }) {
    const owner = property?.player
    const maxBet = property?.maximumBet

    const maxDisplay = `$${Numerals(maxBet).format('0,0a', Math.floor)} max`
    const isStateOwned = property?.currentState === 'STATE_OWNED'
    const isUnowned = property?.currentState === 'UNOWNED'
    const isLocked = property?.currentState === 'LOCKED'
    const isUnplayable = isLocked || isUnowned

    if (isUnowned) {
        return (
            <BasicGambleCell
                owner={`For Sale`}
                info={`Buy: $1.35m`}
                classes={`property-cell--unowned`}
            />
        )
    }
    if (isStateOwned) {
        return (
            <BasicGambleCell
                owner={
                    <span>
                        <img src={GovBuilding} alt={'Government'} /> State Owned
                    </span>
                }
                info={maxDisplay}
                classes={`property-cell--state-owned`}
            />
        )
    }
    if (isUnplayable) {
        return (
            <BasicGambleCell
                owner={
                    <span>
                        <img src={GovBuilding} alt={'Government'} /> Locked
                    </span>
                }
                info={`Unplayable`}
                classes={`property-cell--unplayable`}
            />
        )
    }

    return (
        <BasicGambleCell
            owner={owner}
            info={maxDisplay}
            classes={`property-cell--player-owned`}
        />
    )
}

export default GambleCell
