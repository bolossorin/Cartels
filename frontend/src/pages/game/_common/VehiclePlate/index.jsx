import React from 'react'

import './VehiclePlate.scss'

function VehiclePlate({ plate, location }) {
    return (
        <>
            <div className={`vehicle-plate`}>
                <div className={`vehicle-plate__inner`}>
                    <div className={`vehicle-plate__inner__origin`}>
                        {location}
                    </div>
                    <div className={`vehicle-plate__inner__text`}>{plate}</div>
                </div>
            </div>
        </>
    )
}

export default VehiclePlate
