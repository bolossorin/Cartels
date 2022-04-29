import React from 'react'
import './Crews.scss'
import { Link } from 'react-router-dom'
import { crewMemberTieredDesignation, crewNameComplement } from './crewUtils'
import Button from '../../_common/Button'
import PlayerCard from '../players-online/PlayerCard'
import Arrow from 'img/crew/Arrow 1.svg'

function HierarchyTier({ members, tier, crewType }) {
    const memberDesignation = crewMemberTieredDesignation(crewType, tier)

    return (
        <div className={`crew-hierarchy__tier crew-hierarchy__tier--${tier}`}>
            <h4>
                {memberDesignation === 'Deputy'
                    ? 'Deputies'
                    : [3, 4].includes(tier)
                    ? `${memberDesignation}s`
                    : memberDesignation}
            </h4>
            <div className="crew-hierarchy__tier__members">
                {members ? (
                    members.map((member) =>
                        member ? (
                            <PlayerCard playerOnline={member} />
                        ) : (
                            <span>Empty spot</span>
                        )
                    )
                ) : (
                    <span>Empty</span>
                )}
                {members?.length === 0 && <span>Empty</span>}
            </div>
            <img src={Arrow} alt="Down arrow" />
        </div>
    )
}

export default HierarchyTier
