import React, { useState } from 'react'
import Size from 'img/lab/lab-size.svg'
import Button from '../_common/Button/Button'
import Crackhouse from '../../../assets/images/lab/crackhouse.jpg'
import BalanceItem from '../_common/BalanceItem'
import Modal from '../_common/Modal'
import Purchaser from '../_common/Purchaser/Purchaser'
import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import Tick from 'img/tick.svg'

const PURCHASE_LAB_MUTATION = gql`
    mutation PurchaseLabItem($input: LabItemPurchaseInput!) {
        purchaseLabItem(input: $input) {
            lab {
                id
                items {
                    id
                    name
                    capability
                    prices {
                        crypto
                        cash
                    }
                    image
                    variant
                    unlock
                    owned
                    locked
                    equipped
                }
                minimumRequirementsMet
            }
            success
        }
    }
`

function LabLocation({ location, locationType, attributes }) {
    const [purchaseItem, { data, loading, error }] = useMutation(
        PURCHASE_LAB_MUTATION
    )
    const [isPurchasing, setIsPurchasing] = useState(false)

    const prices = {
        cash: location?.prices?.cash,
        crypto: location?.prices?.crypto,
    }

    const locationClass = location?.locked ? 'facility-location--locked' : ''

    function closePurchaser() {
        setIsPurchasing(false)
    }

    function handlePurchase(currency) {
        return purchaseItem({
            variables: {
                input: {
                    id: location?.id,
                    currency,
                },
            },
        })
    }

    return (
        <>
            <div
                className={`facility-location ${locationClass}`}
                style={{
                    backgroundImage: `linear-gradient(to top, ${location?.locked ? '#000000EE' : '#26739e10'}, #000000EE ), url(${
                        location?.image ?? Crackhouse
                    })`,
                    backgroundSize: 'auto, cover',
                }}
                onClick={(event) => {
                    // console.log({ event })
                    // console.log(event.clientX)
                    // console.log(event.clientY)
                    // console.log(event.screenX)
                    // console.log(event.screenY)
                    // console.log(event.view)
                    // console.log(event.type)
                    // console.log(event.movementX)
                    // console.log(event.movementY)
                    // console.log(event.target.clientHeight)
                    // console.log(event.target.clientWidth)

                    !location?.locked &&
                        !location?.owned &&
                        setIsPurchasing(true)
                }}
            >
                <div className="facility-location__title">
                    <span>{location?.name ?? 'Unknown'}</span>
                    {location?.owned && <img src={Tick} alt="Location owned" />}
                </div>
                <div className="facility-location__meta">
                    <span>{location?.capability}</span>
                    {!location?.owned && (
                        <BalanceItem
                            currency="cash"
                            value={prices?.cash}
                            showFull
                        />
                    )}
                </div>
                {location?.locked && (
                    <p className="facility-location__locked">
                        Unlocks Level {location?.unlock}
                    </p>
                )}
            </div>
            <Purchaser
                isOpen={isPurchasing}
                title={location?.name}
                image={location?.image}
                type={locationType}
                attributes={attributes}
                prices={prices}
                handleClose={closePurchaser}
                handlePurchase={handlePurchase}
            />
        </>
    )
}

export default LabLocation
