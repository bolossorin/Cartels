import React from 'react'
import Content from '../../_common/Content/Content'
import Masthead from '../../_common/Masthead/Masthead'
import Property from '../../_common/Property/Property'
import { Link } from 'react-router-dom'

import './RaceTrack.scss'
import RaceTrackBoard from './RaceTrackBoard'

function RaceTrack() {
    return (
        <Content color={`game`} className={`race-track`}>
            <Masthead fullWidth>
                <Link to={`/casino`}>Race Track</Link>
            </Masthead>
            <Property propertyType={`track`}>
                <>
                    <RaceTrackBoard />
                </>
            </Property>
        </Content>
    )
}

export default RaceTrack
