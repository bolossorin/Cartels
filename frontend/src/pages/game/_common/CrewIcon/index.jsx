import React from 'react'
import PropTypes from 'prop-types'
import NoCrewImage from 'img/crew/no-crew.png'

import './CrewIcon.scss'

const CrewIcon = ({ crewName, crewColor, crewImage }) => (
    <div className="crew-icon" title={{ crewName }}>
        <div
            className="crew-image"
            style={{
                backgroundImage: `url(${crewImage ? crewImage : NoCrewImage})`,
            }}
        />
        <div className="crew-color" style={{ backgroundColor: crewColor }} />
    </div>
)

CrewIcon.propTypes = {
    crewName: PropTypes.string.isRequired,
    crewColor: PropTypes.string.isRequired,
    crewImage: PropTypes.string,
}

CrewIcon.defaultProps = {
    crewName: 'No Crew',
    crewColor: '#92278f',
}

export default CrewIcon
