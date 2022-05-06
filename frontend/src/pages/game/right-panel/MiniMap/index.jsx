import React from 'react'
import { Link } from 'react-router-dom'
import LocationPin from 'img/icons/location.svg'

import './Map.scss'
import * as PropTypes from 'prop-types'

function MiniMap({ district }) {
    const currentDistrict = district ?? `No Man's Land`

    return (
        <Link to="/map" className="map-box content-box">
            <div className="map-box__header">
                <div className="map-box__header__location">
                    <span>{currentDistrict}</span>
                    <img src={LocationPin} alt="Current location pin" />
                </div>
                <div className="map-box__header__title">Map</div>
            </div>
            <div
                className={`map-container map-container__${currentDistrict
                    .toLowerCase()
                    .trim()
                    .split(/\s+/)
                    .join('-')}`}
            >
                {/*<p>Pop: 3,782</p>*/}
            </div>
        </Link>
    )
}

MiniMap.propTypes = { district: PropTypes.any }

export default MiniMap
