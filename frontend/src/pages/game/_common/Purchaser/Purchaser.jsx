import React, { useState } from 'react'
import Modal from '../Modal'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import './Purchaser.scss'
import StyleButton from '../StyleButton'
import Button from '../Button/Button'
import BalanceItem from '../BalanceItem'
import TextPill from '../TextPill'

import Tick from 'img/tick.svg'
import Crackhouse from 'img/lab/crackhouse.jpg'
import GraphErrors from '../GraphErrors'

const PURCHASER_QUERY = gql`
    query PurchaserAdviceQuery {
        viewer {
            player {
                id
                cash
                gold
                crypto
            }
        }
    }
`

function Purchaser({
    isOpen,
    prices,
    image,
    description,
    title,
    type,
    attributes,
    handleClose,
    handlePurchase,
}) {
    const { data, loading } = useQuery(PURCHASER_QUERY, {
        fetchPolicy: 'cache-and-network',
    })
    const [currency, setCurrency] = useState('cash')
    const [error, setError] = useState()
    const [purchasing, setPurchasing] = useState(false)
    const [success, setSuccess] = useState(false)

    const locationClass = location?.locked ? 'facility-location-locked' : ''

    const hasOptions = prices?.crypto
    const otherOption = currency === 'cash' ? 'crypto' : 'cash'

    const playerCurrencies = {
        cash: data?.viewer?.player?.cash,
        crypto: data?.viewer?.player?.crypto,
        gold: data?.viewer?.player?.gold,
    }

    const currencyAfterPurchase =
        parseInt(playerCurrencies?.[currency]) - parseInt(prices?.[currency])
    const cannotAffordPurchase = currencyAfterPurchase < 0

    function performPurchase() {
        setPurchasing(true)
        handlePurchase(currency)
            .then((result) => {
                // console.log({ result })
                setSuccess(true)
                setTimeout(() => {
                    handleClose()
                }, 1250)
            })
            .catch((e) => {
                setError(e)
            })
            .finally(() => {
                setPurchasing(false)
            })
    }

    return (
        <>
            <Modal
                title="Confirm purchase"
                isOpen={isOpen}
                className="purchaser-modal"
            >
                {success ? (
                    <article className="purchaser-modal__review">
                        <div className="purchaser-modal__review__success">
                            <img
                                src={Tick}
                                alt={`Successfully purchased ${title}`}
                            />
                            <p className="purchaser-modal__own">
                                You now own a {title}!
                                <span>
                                    The item has been delivered to your estate.
                                </span>
                            </p>
                        </div>
                    </article>
                ) : (
                    <article className="purchaser-modal__review">
                        <div
                            className="purchaser-modal__review__image"
                            style={{
                                backgroundImage: `url(${image ?? Crackhouse})`,
                                backgroundSize: 'cover',
                            }}
                        />
                        <div className="purchaser-modal__review__description">
                            <h1>{title ?? 'test item'}</h1>
                            <h2>{type}</h2>
                            <ul>
                                {attributes.map((attribute) => (
                                    <li key={attribute}>{attribute}</li>
                                ))}
                            </ul>
                            {hasOptions && (
                                <Button
                                    style="secondary"
                                    onClick={() => {
                                        setCurrency(otherOption)
                                    }}
                                >
                                    Switch to {otherOption}
                                </Button>
                            )}
                        </div>
                    </article>
                )}
                {!success && (
                    <article className="purchaser-modal__advice">
                        {error ? (
                            <GraphErrors error={error} />
                        ) : cannotAffordPurchase ? (
                            <TextPill style="error">
                                You need an extra{' '}
                                <BalanceItem
                                    currency={currency}
                                    value={currencyAfterPurchase * -1}
                                    showFull
                                />{' '}
                                to purchase.
                            </TextPill>
                        ) : (
                            <span>
                                You have{' '}
                                <BalanceItem
                                    currency={currency}
                                    value={playerCurrencies?.[currency]}
                                    showFull
                                />{' '}
                                and will have{' '}
                                <BalanceItem
                                    currency={currency}
                                    value={currencyAfterPurchase}
                                    showFull
                                />{' '}
                                after purchase.
                            </span>
                        )}
                    </article>
                )}
                <article className="purchaser-modal__cta">
                    <Button style="cancel" onClick={handleClose}>
                        {success ? 'Close' : 'Cancel'}
                    </Button>
                    <Button
                        disabled={cannotAffordPurchase || success}
                        onClick={performPurchase}
                    >
                        Purchase
                        <BalanceItem
                            currency={currency}
                            value={prices?.[currency] ?? 'N/A'}
                            showFull
                        />
                    </Button>
                </article>
            </Modal>
        </>
    )
}

export default Purchaser
