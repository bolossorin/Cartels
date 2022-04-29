import React from 'react'

import BalanceItem from '../_common/BalanceItem'
import Button from '../../_common/Button'
import './Store.scss'

function GoldItem({ goldItem }) {
    return (
        <div
            className={`gold-item ${
                goldItem?.labelCode ? `gold-item--${goldItem?.labelCode}` : ''
            }`}
        >
            {goldItem?.labelText && (
                <p
                    className={`gold-item__label ${
                        goldItem?.labelCode
                            ? `gold-item__label--${goldItem?.labelCode}`
                            : ''
                    }`}
                >
                    {goldItem?.labelText}
                </p>
            )}
            <img src={goldItem?.image} />
            <BalanceItem
                currency="gold"
                value={goldItem?.goldAmount}
                showFull
            />
            <Button
                styleType="primary"
                color={
                    goldItem?.labelCode === 'most_popular' ? 'yellow' : 'white'
                }
            >
                {`$${goldItem?.price}`}
            </Button>
        </div>
    )
}

export default GoldItem
