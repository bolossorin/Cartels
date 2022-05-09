import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import ImgCar from 'img/inventory/box-truck.png'

import './EquippedVehicle.scss'

function EquippedVehicle() {
    return (
        <>
            <h3 className="side-title">Garage</h3>
            <div className="equipped-vehicle">
                <p className="name">Box Truck</p>
                <img src={ImgCar} alt="Boy Truck" />
            </div>
        </>
    )
}

export default EquippedVehicle
