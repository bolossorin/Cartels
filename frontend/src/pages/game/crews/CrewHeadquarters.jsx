import React, { useState } from 'react'
import './Crews.scss'
import BalanceItem from '../_common/BalanceItem'
import { crewMemberDesignation } from './crewUtils'

function CrewHeadquarters({ headquarters, crewType }) {
    return (
        <div className="crew-headquarters">
            <div className="crew-headquarters__image">
                <img src={headquarters?.image} alt={headquarters?.name} />
            </div>
            <div className="crew-headquarters__text">
                <h5>
                    {headquarters?.name}{' '}
                    <BalanceItem
                        value={headquarters?.price}
                        currency="money"
                        showFull
                    />
                </h5>
                <p className="crew-headquarters__text__max-cap">
                    {`Maximum ${crewMemberDesignation(crewType)}: ${
                        headquarters?.maxMembers
                    }`}
                </p>
            </div>
        </div>
    )
}

export default CrewHeadquarters
