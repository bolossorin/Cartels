import React from 'react'
import Button from '../../../_common/Button/Button'

import './InventoryItemLabMarket.scss'
import BalanceItem from '../../../_common/BalanceItem'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'

const MARKET_PRICING_QUERY = gql`
    query MarketPricingQuery {
        lab {
            id
            marketPricing {
                id
                product
                price
            }
        }
    }
`

function InventoryItemLabMarket({ inventoryItem, handleClose }) {
    const { data } = useQuery(MARKET_PRICING_QUERY, {
        fetchPolicy: 'cache-and-network',
    })
    const item = inventoryItem.item

    const marketPrices = data?.lab?.marketPricing
    const marketPrice = marketPrices?.find(
        ({ product }) => product === item.name
    )?.price

    const streetValue = marketPrice
        ? marketPrice * inventoryItem.quantity
        : null

    return (
        <>
            <article>
                <desc>{item.description}</desc>
                <div className="inventory-item-lab-market__pricing">
                    <div className="inventory-item-lab-market__pricing__box">
                        <h3>Unit Pricing</h3>
                        {marketPrice && (
                            <BalanceItem
                                currency="money"
                                value={marketPrice}
                                showFull
                            />
                        )}
                    </div>
                    <div className="inventory-item-lab-market__pricing__box">
                        <h3>Street Value</h3>
                        {streetValue && (
                            <BalanceItem
                                currency="money"
                                value={streetValue}
                                showFull
                            />
                        )}
                    </div>
                </div>
                <div className="inventory-item-lab-market__hint">
                    You can buy/sell your drug items on the Lab page.
                </div>
            </article>
            <div className="modal-inventory-item__description__control">
                <Button style="cancel" onClick={handleClose}>
                    Cancel
                </Button>
            </div>
        </>
    )
}

export default InventoryItemLabMarket
