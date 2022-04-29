import React, { useState } from 'react'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import IntegratedLoader from '../_common/Loading/IntegratedLoader'
import MarketCard from './MarketCard'
import ShowcasePurchase from '../../_common/Showcase/ShowcasePurchase'
import useEvent from '../../../hooks/useEvent'

const MARKET_PAGE_QUERY = gql`
    query MarketPageQuery {
        market {
            weapons {
                id
                name
                imageUrl
                horizontalImageUrl
                strengthDisplay
                description
                marketPrice
                rarity
                variant
                tradable
                stackable
                amountOwned
            }
            protection {
                id
                name
                imageUrl
                horizontalImageUrl
                strengthDisplay
                description
                marketPrice
                rarity
                variant
                tradable
                stackable
                amountOwned
            }
            equipment {
                id
                name
                imageUrl
                horizontalImageUrl
                strengthDisplay
                description
                marketPrice
                rarity
                variant
                tradable
                stackable
                amountOwned
            }
            skins {
                id
                name
                imageUrl
                horizontalImageUrl
                strengthDisplay
                description
                marketPrice
                rarity
                variant
                tradable
                stackable
                amountOwned
            }
        }
    }
`

function MarketPage({ variant }) {
    const triggerEvent = useEvent()
    const [isPurchasing, setIsPurchasing] = useState(false)
    const [purchasingItem, setPurchasingItem] = useState(null)
    const { data, refetch } = useQuery(MARKET_PAGE_QUERY)

    const variantData = data?.market?.[variant]
    if (!variantData) {
        return <IntegratedLoader />
    }

    function handlePurchase(item) {
        if (item) {
            triggerEvent({
                name: 'MARKET_EXPAND_ITEM',
                details: {
                    variant,
                    itemTitle: item.name,
                    itemId: item.id,
                },
            })
        }

        setPurchasingItem(item)
        setIsPurchasing(!!item)
    }

    return (
        <>
            {variantData.map((marketItem) => {
                return (
                    <MarketCard
                        key={marketItem.id}
                        color={`blue`}
                        image={
                            marketItem?.horizontalImageUrl ??
                            marketItem?.imageUrl
                        }
                        rarity={`COMMON`}
                        rarityColor={`lightBlue`}
                        title={marketItem.name}
                        description={marketItem.description}
                        value={marketItem.marketPrice}
                        stat={marketItem.strengthDisplay}
                        owned={marketItem.amountOwned !== 0}
                        onClick={() => handlePurchase(marketItem)}
                    />
                )
            })}
            <ShowcasePurchase
                item={purchasingItem}
                isOpen={isPurchasing}
                handleClose={() => {
                    handlePurchase(null)
                    refetch()
                }}
            />
        </>
    )
}

export default MarketPage
