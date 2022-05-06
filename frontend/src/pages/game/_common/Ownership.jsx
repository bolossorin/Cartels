import React from 'react'
import PropTypes from 'prop-types'

import './Ownership.scss'

function Ownership({ property }) {
    const { maximumBet, forSale, ownerTag, owner } = property
    const { name } = owner

    return (
        <div className="property-info">
            <div className="info-item">
                <p>Owner</p>
                <p>{name}</p>
            </div>
            <div className="info-item">
                <p>Maximum bet</p>
                <p>{maximumBet}</p>
            </div>
            <div className="info-item">
                <p>For sale?</p>
                <p>{forSale}</p>
            </div>
        </div>
    )
}

Ownership.propTypes = {
    property: PropTypes.object.isRequired,
}

export default Ownership
