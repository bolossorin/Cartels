import React from 'react'
import ProductPills from 'img/inventory/ecstasy.png'
import ProductCoke from 'img/inventory/coke-new.png'
import ProductAcid from 'img/inventory/lsd.png'
import ProductMeth from 'img/inventory/meth.png'

import './LabMarket.scss'
import Button from '../../_common/Button/Button'
import { Field, Formik } from 'formik'
import NumberInput from '../../_common/TextInput/NumberInput'
import BalanceItem from '../../_common/BalanceItem'
import { gql } from 'apollo-boost'
import { useMutation, useQuery } from '@apollo/react-hooks'
import AdjustorButton from '../../_common/AdjustorButton'
import QuickModify from './QuickModify'
import Customs from '../Customs'
import IntegratedLoader from '../../_common/Loading/IntegratedLoader'
import TextPill from '../../_common/TextPill'
import { useToast } from '../../_common/Toast'

const MARKET_PRICING_QUERY = gql`
    query LabMarketplacePricing {
        viewer {
            player {
                id
                inventory {
                    itemsCount
                    items {
                        id
                        quantity
                        item {
                            id
                            code
                        }
                    }
                }
                currencies {
                    name
                    amount
                }
                cash
                gold
                crypto
            }
        }
        lab {
            id
            marketPricing {
                id
                product
                price
            }
        }
        customs {
            min
            max
            current
            description
            label
            travelRestriction
        }
    }
`

const MARKET_TRADE_MUTATION = gql`
    mutation LabMarketplaceTrade($input: LabMarketTradeInput!) {
        labMarketTrade(input: $input) {
            success
            message
        }
    }
`

function Index() {
    const toast = useToast()
    const { data, refetch } = useQuery(MARKET_PRICING_QUERY, {
        fetchPolicy: 'cache-and-network',
    })
    const [mutateTrade, { data: tradeData, error: tradeError }] = useMutation(
        MARKET_TRADE_MUTATION
    )

    const marketPrices = data?.lab?.marketPricing
    const prices = {
        ecstasy: marketPrices?.find(({ product }) => product === 'Ecstasy')
            ?.price,
        lsd: marketPrices?.find(({ product }) => product === 'LSD')?.price,
        cocaine: marketPrices?.find(({ product }) => product === 'Cocaine')
            ?.price,
        speed: marketPrices?.find(({ product }) => product === 'Speed')?.price,
    }

    const drugInventory = data?.viewer?.player?.inventory?.items?.filter(
        (item) =>
            ['speed', 'cocaine', 'ecstasy', 'lsd'].includes(item.item.code)
    )
    const quantities = {
        ecstasy: drugInventory?.find((item) => item.item.code === 'ecstasy')
            ?.quantity,
        lsd: drugInventory?.find((item) => item.item.code === 'lsd')?.quantity,
        cocaine: drugInventory?.find((item) => item.item.code === 'cocaine')
            ?.quantity,
        speed: drugInventory?.find((item) => item.item.code === 'speed')
            ?.quantity,
    }

    function calculateTotal(values) {
        let total = 0
        for (const drug of ['speed', 'cocaine', 'ecstasy', 'lsd']) {
            const drugAmount = parseInt(
                (values?.[`${drug}Amount`] ?? '0').replace(/,/g, '')
            )
            const drugTotal = prices?.[drug] * drugAmount

            total += !isNaN(drugTotal) ? drugTotal : 0
        }

        return total
    }

    async function trade(values, handleSuccess) {
        const operation = values.operation
        const trades = []
        for (const [drug, amount] of Object.entries(values)) {
            const quantity = parseInt(`${amount.replace(/,/g, '')}`)

            if (quantity >= 1 && drug !== 'operation') {
                trades.push({
                    name: drug.replace('Amount', ''),
                    quantity,
                })
            }
        }

        if (trades.length === 0) {
            toast.add(
                'error',
                'Market',
                'You must select at least 1 unit.',
                true
            )

            return
        }

        const mutationResponse = await mutateTrade({
            variables: {
                input: {
                    operation,
                    trades,
                },
            },
        })

        const success = mutationResponse?.data?.labMarketTrade?.success
        const message = mutationResponse?.data?.labMarketTrade?.message
        if (!success) {
            toast.add(
                'error',
                'Market',
                message ??
                    'Your trade could not be completed, please try again.',
                true
            )

            return
        }

        toast.add('success', 'Market', message, true)
        handleSuccess()
        refetch()
    }

    return (
        <>
            <h1>Lab Market</h1>
            <article className="modal-marketplace__container">
                <div className="modal-marketplace__description">
                    <article>
                        <Formik
                            initialValues={{
                                cocaineAmount: '',
                                lsdAmount: '',
                                speedAmount: '',
                                ecstasyAmount: '',
                                operation: 'buy',
                            }}
                            onSubmit={async (values, actions) => {
                                return trade(values, actions.resetForm)
                            }}
                        >
                            {(props) => (
                                <form
                                    onSubmit={props.handleSubmit}
                                    className={`${
                                        props.isSubmitting
                                            ? 'form__loading'
                                            : 'form'
                                    }`}
                                >
                                    <div className="modal-marketplace__product">
                                        <div className="modal-marketplace__product__item">
                                            <img
                                                src={ProductPills}
                                                alt="Ecstasy"
                                            />
                                            <div className="modal-marketplace__product__item__control">
                                                <h3>
                                                    {quantities?.ecstasy ?? '0'}
                                                    x Ecstasy{' '}
                                                    {prices?.ecstasy && (
                                                        <BalanceItem
                                                            currency="money"
                                                            value={
                                                                prices?.ecstasy
                                                            }
                                                            showFull
                                                            countDuration={0.6}
                                                        />
                                                    )}
                                                </h3>
                                                <Field
                                                    name="ecstasyAmount"
                                                    placeholder="Amount"
                                                    hasModifiers={true}
                                                    component={NumberInput}
                                                />
                                                <QuickModify
                                                    fieldName="ecstasyAmount"
                                                    quantity={
                                                        quantities.ecstasy
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="modal-marketplace__product__item">
                                            <img src={ProductAcid} alt="LSD" />
                                            <div className="modal-marketplace__product__item__control">
                                                <h3>
                                                    {quantities?.lsd ?? '0'}x
                                                    LSD{' '}
                                                    {prices?.lsd && (
                                                        <BalanceItem
                                                            currency="money"
                                                            value={prices?.lsd}
                                                            showFull
                                                            countDuration={0.6}
                                                        />
                                                    )}
                                                </h3>
                                                <Field
                                                    name="lsdAmount"
                                                    placeholder="Amount"
                                                    hasModifiers={true}
                                                    component={NumberInput}
                                                />
                                                <QuickModify
                                                    fieldName="lsdAmount"
                                                    quantity={quantities.lsd}
                                                />
                                            </div>
                                        </div>
                                        <div className="modal-marketplace__product__item">
                                            <img
                                                src={ProductCoke}
                                                alt="Cocaine"
                                            />
                                            <div className="modal-marketplace__product__item__control">
                                                <h3>
                                                    {quantities?.cocaine ?? '0'}
                                                    x Cocaine{' '}
                                                    {prices?.cocaine && (
                                                        <BalanceItem
                                                            currency="money"
                                                            value={
                                                                prices?.cocaine
                                                            }
                                                            showFull
                                                            countDuration={0.6}
                                                        />
                                                    )}
                                                </h3>
                                                <Field
                                                    name="cocaineAmount"
                                                    placeholder="Amount"
                                                    hasModifiers={true}
                                                    component={NumberInput}
                                                />
                                                <QuickModify
                                                    fieldName="cocaineAmount"
                                                    quantity={
                                                        quantities.cocaine
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="modal-marketplace__product__item">
                                            <img
                                                src={ProductMeth}
                                                alt="Speed"
                                            />
                                            <div className="modal-marketplace__product__item__control">
                                                <h3>
                                                    {quantities?.speed ?? '0'}x
                                                    Speed{' '}
                                                    {prices?.speed && (
                                                        <BalanceItem
                                                            currency="money"
                                                            value={
                                                                prices?.speed
                                                            }
                                                            showFull
                                                            countDuration={0.6}
                                                        />
                                                    )}
                                                </h3>
                                                <Field
                                                    name="speedAmount"
                                                    placeholder="Amount"
                                                    hasModifiers={true}
                                                    component={NumberInput}
                                                />
                                                <QuickModify
                                                    fieldName="speedAmount"
                                                    quantity={quantities.speed}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-marketplace__customs">
                                        <Customs />
                                    </div>
                                    <div className="modal-marketplace__total">
                                        TOTAL:{' '}
                                        <BalanceItem
                                            currency="money"
                                            value={calculateTotal(props.values)}
                                            showFull
                                            countDuration={0.6}
                                        />
                                    </div>
                                    <div className="modal-marketplace__control">
                                        <Button
                                            name="sell"
                                            style="red"
                                            onClick={() =>
                                                props.setFieldValue(
                                                    'operation',
                                                    'sell'
                                                )
                                            }
                                        >
                                            Sell
                                        </Button>
                                        <Button
                                            name="buy"
                                            style="green"
                                            onClick={() =>
                                                props.setFieldValue(
                                                    'operation',
                                                    'buy'
                                                )
                                            }
                                        >
                                            Buy
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </Formik>
                    </article>
                </div>
            </article>
        </>
    )
}

export default Index
