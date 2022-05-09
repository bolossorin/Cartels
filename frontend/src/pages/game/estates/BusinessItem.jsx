import React, { useState } from 'react'
import './Estates.scss'
import Content from '../../_common/Content/Content'
import Masthead from '../../_common/Masthead/Masthead'
import UpgradeAvailable from 'img/estate/upgrade.svg'
import BalanceItem from '../_common/BalanceItem'
import Button from '../../_common/Button'

function BusinessItem({ businessItem, handleSelect }) {
    return (
        <div
            className="business-item"
            onClick={() => handleSelect(businessItem)}
        >
            <div className="business-item__top">
                <div className="business-item__image">
                    <img
                        className="business-item__image__img"
                        src={businessItem?.image}
                        alt={businessItem?.name}
                    />
                    {businessItem?.upgradeAvailable && (
                        <div className="business-item__image__upgrade">
                            <img
                                src={UpgradeAvailable}
                                alt="Upgrade available"
                            />
                        </div>
                    )}
                </div>
                <div className="business-item__info">
                    <h4>
                        {businessItem?.name}
                        <span className="level">{`lvl ${businessItem?.level}`}</span>
                    </h4>
                    <p className="business-item__info__location">
                        {businessItem?.location}
                    </p>
                    <p className="business-item__info__production-amount">
                        {`Producing daily: `}
                        <BalanceItem
                            value={businessItem?.producingDaily}
                            currency="money"
                            showFull
                        />
                    </p>
                </div>
            </div>
            <div className="business-item__collect">
                <p>Collect</p>
                <Button color="green" styleType="secondary">
                    <BalanceItem
                        value={businessItem?.collectReady}
                        currency="money"
                        showFull
                    />{' '}
                </Button>
            </div>
        </div>
    )
}

export default BusinessItem
