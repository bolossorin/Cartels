import React, { useState } from 'react'
import './Estates.scss'
import Content from '../../_common/Content/Content'
import Masthead from '../../_common/Masthead/Masthead'
import UpgradeAvailable from 'img/estate/upgrade.svg'
import BalanceItem from '../_common/BalanceItem'
import Button from '../../_common/Button'

function EstateItem({ estateItem, handleSelect }) {
    return (
        <div className="estate-item" onClick={() => handleSelect(estateItem)}>
            <h4 className="estate-item__name">{estateItem?.name}</h4>
            <div className="estate-item__image">
                <img
                    className="estate-item__image__img"
                    src={estateItem?.image}
                    alt={estateItem?.name}
                />
            </div>
            <div className="estate-item__unlocked">
                {`${estateItem.level}/${estateItem.maxLevel} Unlocked`}
            </div>
        </div>
    )
}

export default EstateItem
