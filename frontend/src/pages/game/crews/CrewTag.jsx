import React from 'react'
import './Crews.scss'
import { Link } from 'react-router-dom'
import { crewNameComplement } from './crewUtils'

function CrewTag({ crew, linkToMyCrew }) {
    return (
        <Link
            to={linkToMyCrew ? '/crew' : crew ? `/crew/${crew?.id}` : '/crew'}
        >
            <p className="crew-tag">
                {crew
                    ? `${crew?.name}${crewNameComplement(crew?.crewType)}`
                    : 'No Crew'}
            </p>
        </Link>
    )
}

export default CrewTag
