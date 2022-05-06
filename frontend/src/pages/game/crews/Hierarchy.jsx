import React from 'react'
import './Crews.scss'
import { Link } from 'react-router-dom'
import { crewMemberTieredDesignation, crewNameComplement } from './crewUtils'
import Button from '../../_common/Button'
import HierarchyTier from './HierarchyTier'

function Hierarchy({ crew }) {
    const crewType = crew?.crewType
    const allMembers = crew?.members
    const leaders = [
        crew?.hierarchy?.tier1,
        crew?.hierarchy?.tier2,
        crew?.hierarchy?.tier3[0],
        crew?.hierarchy?.tier3[1],
        crew?.hierarchy?.tier3[2],
    ]
    const leaderIds = leaders?.map((leader) => leader?.id)
    const otherMembers = allMembers?.filter(
        (member) => !leaderIds.includes(member.id)
    )

    const hierarchyTiers = [
        {
            tier: 1,
            members: [crew?.hierarchy?.tier1],
        },
        {
            tier: 2,
            members: [crew?.hierarchy?.tier2] ?? null,
        },
        {
            tier: 3,
            members: crew?.hierarchy?.tier3 ?? null,
        },
        {
            tier: 4,
            members: otherMembers ?? null,
        },
    ]

    return (
        <div className="crew-hierarchy">
            {hierarchyTiers.map((tier) => (
                <HierarchyTier
                    key={tier.tier}
                    crewType={crewType}
                    tier={tier.tier}
                    members={tier.members}
                />
            ))}
        </div>
    )
}

export default Hierarchy
