import React, { useState } from 'react'
import './Crews.scss'
import Content from '../../_common/Content/Content'
import Masthead from '../../_common/Masthead/Masthead'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import DefaultCrewImage from 'img/crew/crew_placeholder.png'
import { PLAYER_ITEMS_QUERY } from '../left-panel/components/Inventory/InventoryGrid'
import { Link } from 'react-router-dom'
import { crewMemberDesignation, crewNameComplement } from './crewUtils'

function CrewItem({ crew, linkItem }) {
    return (
        <div className="crew-item">
            <div className="crew-item__image">
                <img
                    src={crew?.image ?? DefaultCrewImage}
                    alt={`Emblem of ${crew?.name}`}
                />
            </div>
            <div className="crew-item__info">
                <h4>{`${crew?.name}${crewNameComplement(crew?.crewType)}`}</h4>

                <p className="crew-item__info__members">
                    {`${crewMemberDesignation(crew?.crewType)}s: ${
                        crew?.members?.length
                    }`}
                </p>
                <p className="crew-item__info__influence">
                    {`Influence: `}
                    <span>{crew?.influence}</span>
                </p>
            </div>
            {linkItem && <Link to={`/crew/${crew?.id}`} />}
        </div>
    )
}

export default CrewItem
