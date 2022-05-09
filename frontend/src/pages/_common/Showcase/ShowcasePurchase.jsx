import React, { useState } from 'react'
import Showcase from './Showcase'
import Text from '../Text/Text'

import IcoDollars from 'img/icons/dollar.svg'
import IcoGold from 'img/icons/gold.svg'
import IcoCrypto from 'img/icons/crypto.svg'

import './ShowcasePurchase.scss'
import Image from '../Image/Image'
import StyleButton from '../../game/_common/StyleButton'
import Button from '../Button'

import { useToast } from '../../game/_common/Toast'
import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { PLAYER_ITEMS_QUERY } from '../../game/left-panel/components/Inventory/InventoryGrid'

const PURCHASE_MUTATION = gql`
    mutation ShowcasePurchase($input: PurchaseMarketItemInput!) {
        purchaseMarketItem(input: $input) {
            outcome
            outcomeMessage
            closePurchasePrompt
        }
    }
`

function ShowcasePurchase({ item, isOpen, handleClose }) {
    const [mutatePurchase] = useMutation(PURCHASE_MUTATION, {
        refetchQueries: [{ query: PLAYER_ITEMS_QUERY }],
    })
    const toast = useToast()
    const [purchaseStatus, setPurchaseStatus] = useState(0)

    function handlePurchaseClose() {
        handleClose()
        setPurchaseStatus(0)
    }

    async function handleClick() {
        if (purchaseStatus === 2) {
            handlePurchaseClose()
        }
        if (purchaseStatus !== 0) {
            return
        }

        setPurchaseStatus(1)

        const result = await mutatePurchase({
            variables: {
                input: {
                    id: item.id,
                    variant: item.variant,
                },
            },
        })

        const {
            closePurchasePrompt,
            outcome,
            outcomeMessage,
        } = result.data.purchaseMarketItem

        toast.add(outcome, `Market Dealer`, outcomeMessage)

        if (outcome === 'error') {
            setPurchaseStatus(0)
        }

        if (closePurchasePrompt) {
            handlePurchaseClose()
        }
    }

    let buttonText = null
    if (purchaseStatus === 1) {
        buttonText = 'Purchasing...'
    }
    if (purchaseStatus === 2) {
        buttonText = 'Close'
    }

    return (
        <Showcase item={item} isOpen={isOpen} handleClose={handlePurchaseClose}>
            <>
                <div className={`showcase-purchase`}>
                    <div className={`showcase-purchase__currency`}>
                        {item?.amountOwned !== 1 && (
                            <div
                                className={`showcase-purchase__currency__icons`}
                            >
                                <Image
                                    src={IcoGold}
                                    alt={`Gold purchase`}
                                    className={`showcase-purchase__currency__icons__disabled`}
                                />
                                <Image
                                    src={IcoCrypto}
                                    alt={`Crypto purchase`}
                                    className={`showcase-purchase__currency__icons__disabled`}
                                />
                                <Image src={IcoDollars} alt={`Cash purchase`} />
                            </div>
                        )}
                        <Text italic bodyGrey body14>
                            {item?.amountOwned !== 1
                                ? 'Select a currency'
                                : `You already own this ${item.variant}`}
                        </Text>
                    </div>
                    <div className={`showcase-purchase__cta`}>
                        {item?.amountOwned === 1 ? (
                            <Button
                                type={`primary`}
                                color={`blue`}
                                onClick={handleClose}
                            >
                                Close
                            </Button>
                        ) : (
                            <Button
                                type={`primary`}
                                color={purchaseStatus === 2 ? `blue` : `green`}
                                loading={purchaseStatus === 1}
                                onClick={handleClick}
                            >
                                {buttonText ? (
                                    buttonText
                                ) : (
                                    <>
                                        <Image
                                            src={IcoDollars}
                                            alt={`Cash purchase`}
                                        />{' '}
                                        {item?.marketPrice
                                            ? item.marketPrice.toLocaleString()
                                            : '0'}
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </>
        </Showcase>
    )
}

export default ShowcasePurchase
