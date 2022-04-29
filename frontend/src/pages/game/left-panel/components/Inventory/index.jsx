import React from 'react'
import { Link } from 'react-router-dom'

import './Inventory.scss'
import InventoryGrid from './InventoryGrid'

function Inventory() {
    return (
        <div className="inventory-box content-box">
            <h3 className="side-title">Inventory</h3>
            <div className="inventory-box__list">
                <InventoryGrid />
            </div>
        </div>
    )
}

export default React.memo(Inventory)
