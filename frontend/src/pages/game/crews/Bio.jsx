import React from 'react'
import './Crews.scss'
import { Link } from 'react-router-dom'
import { crewNameComplement } from './crewUtils'
import Button from '../../_common/Button'

function Bio({ bio }) {
    return (
        <div className={`crew-bio ${bio ? '' : 'crew-bio--empty'}`}>
            {bio ? bio : "This crew doesn't have a bio"}
        </div>
    )
}

export default Bio
