import React, { useState } from 'react'
import './Store.scss'
import ArrowMenuItem from '../../_common/ArrowMenuItem/ArrowMenuItem'

function StoreLink() {
    return (
        <div className="store-link">
            <ArrowMenuItem title={`Cartels Store`} src={`/store`} />
        </div>
    )
}

export default StoreLink
