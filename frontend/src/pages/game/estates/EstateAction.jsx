import React, { useState } from 'react'
import './Estates.scss'
import Content from '../../_common/Content/Content'
import Masthead from '../../_common/Masthead/Masthead'
import UpgradeAvailable from 'img/estate/upgrade.svg'
import BalanceItem from '../_common/BalanceItem'
import Button from '../../_common/Button'

function EstateAction({ action }) {
    return (
        <div className="estate-action">
            <div className="estate-action__image">
                {action?.image && (
                    <img src={action?.image} alt={action?.name} />
                )}
            </div>
            <div className="estate-action__info">
                <h4>{action?.name}</h4>
                <p className="estate-action__info__type">
                    {`${action?.type}: `}
                    <BalanceItem
                        value={action?.amount}
                        currency="money"
                        type="debit"
                        showFull
                    />
                    {`/hour `}
                </p>
            </div>
            <div className="estate-action__button">
                <Button styleType="secondary" color="red">
                    Deal with it
                    <BalanceItem
                        value={action?.dealAmount}
                        currency="money"
                        type="debit"
                        showFull
                    />
                </Button>
            </div>
        </div>
    )
}

export default EstateAction
