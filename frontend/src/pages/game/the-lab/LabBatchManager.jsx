import React, { useEffect, useState } from 'react'

import ProductPills from 'img/inventory/ecstasy-2.png'
import ProductCoke from 'img/inventory/coke.png'
import ProductAcid from 'img/inventory/lsd.png'
import ProductMeth from 'img/inventory/METH-2.png'

import './Lab.scss'
import { gql } from 'apollo-boost'
import { useMutation, useQuery } from '@apollo/react-hooks'
import IntegratedLoader from '../_common/Loading/IntegratedLoader'
import TextPill from '../_common/TextPill'
import BalanceItem from '../_common/BalanceItem'

const LAB_BATCH_INFORMATION = gql`
    query LabBatchManager {
        lab {
            id
            minimumRequirementsMet
            batchesCount
            batchesMaximumCount
            batchesUnitCount
            maximumUnits
            batches {
                id
                product
                units
                producing
                startAt
                finishAt
            }
            marketPricing {
                id
                product
                price
            }
        }
    }
`

const QUEUE_BATCH_MUTATION = gql`
    mutation LabBatchManagerQueue($input: LabBatchInput!) {
        createLabBatch(input: $input) {
            success
            lab {
                id
                minimumRequirementsMet
                batchesCount
                batchesMaximumCount
                batchesUnitCount
                maximumUnits
                batches {
                    id
                    product
                    units
                    producing
                    startAt
                    finishAt
                }
                marketPricing {
                    id
                    product
                    price
                }
            }
        }
    }
`

function LabBatchManager() {
    const [selectedDrug, setSelectedDrug] = useState('')
    const { data, loading } = useQuery(LAB_BATCH_INFORMATION, {
        pollInterval: 15000,
    })
    const [
        queueBatch,
        { data: queueData, loading: queueLoading, error: queueError },
    ] = useMutation(QUEUE_BATCH_MUTATION)



    function handleQueueBatch(product) {
        setSelectedDrug(product)

        queueBatch({
            variables: {
                input: {
                    product,
                },
            },
        })
    }

    if (loading) {
        return <IntegratedLoader text="Loading information" />
    }

    if (!data?.lab?.minimumRequirementsMet) {
        return false
    }

    const marketPrices = data?.lab?.marketPricing
    const prices = {
        ecstasy: marketPrices?.find(({ product }) => product === 'Ecstasy')
            ?.price,
        lsd: marketPrices?.find(({ product }) => product === 'LSD')?.price,
        cocaine: marketPrices?.find(({ product }) => product === 'Cocaine')
            ?.price,
        speed: marketPrices?.find(({ product }) => product === 'Speed')?.price,
    }

    return (
        <>
            <article className="lab-product">
                <h2>Start new batch (free)</h2>
                <div className="lab-product__catalogue">
                    <div
                        className="lab-product__catalogue__item"
                        onClick={() => handleQueueBatch('ecstasy')}
                    >
                        <img src={ProductPills} alt="Ecstasy" />
                        <p>Ecstasy</p>
                        <div className="lab-product__catalogue__item__price">
                            <BalanceItem
                                currency="money"
                                value={prices?.ecstasy}
                                showFull
                            />
                        </div>
                    </div>
                    <div
                        className="lab-product__catalogue__item"
                        onClick={() => handleQueueBatch('lsd')}
                    >
                        <img src={ProductAcid} alt="LSD" />
                        <p>LSD</p>
                        <div className="lab-product__catalogue__item__price">
                            <BalanceItem
                                currency="money"
                                value={prices?.lsd}
                                showFull
                            />
                        </div>
                    </div>{' '}
                    <div
                        className="lab-product__catalogue__item"
                        onClick={() => handleQueueBatch('cocaine')}
                    >
                        <img src={ProductCoke} alt="Cocaine" />
                        <p>Cocaine</p>
                        <div className="lab-product__catalogue__item__price">
                            <BalanceItem
                                currency="money"
                                value={prices?.cocaine}
                                showFull
                            />
                        </div>
                    </div>{' '}
                    <div
                        className="lab-product__catalogue__item"
                        onClick={() => handleQueueBatch('speed')}
                    >
                        <img src={ProductMeth} alt="Speed" />
                        <p>Speed</p>
                        <div className="lab-product__catalogue__item__price">
                            <BalanceItem
                                currency="money"
                                value={prices?.speed}
                                showFull
                            />
                        </div>
                    </div>
                </div>
                <div
                    className={`lab-product__guide lab-product__guide__${
                        queueLoading ? 'visible' : 'hidden'
                    }`}
                >
                    <span>Queueing {selectedDrug}...</span>
                </div>
                {queueError && (
                    <TextPill style="error">
                        <span>{queueError.graphQLErrors[0].message}</span>
                    </TextPill>
                )}
            </article>
        </>
    )
}

export default LabBatchManager
