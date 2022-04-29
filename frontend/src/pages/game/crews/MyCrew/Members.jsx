import React, { useEffect, useState } from 'react'
import MemberItem from './MemberItem'

function Members({ myCrewMembers, crewType, viewerId, canLeave }) {
    return (
        <div className="crew-members content-padding">
            {myCrewMembers?.map((crewMember) => (
                <MemberItem
                    canBeKicked={crewMember?.canBeKicked}
                    member={crewMember?.member}
                    key={crewMember?.member?.id}
                    tier={crewMember?.hierarchyTier}
                    crewType={crewType}
                    canLeave={canLeave}
                    isSelf={viewerId === crewMember?.member?.id}
                />
            ))}
        </div>
    )
}

export default Members
