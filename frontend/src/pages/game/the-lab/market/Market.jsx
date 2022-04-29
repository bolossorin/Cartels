import React from 'react'
import ProductPills from 'img/inventory/ecstasy.png'
import ProductCoke from 'img/inventory/coke-new.png'
import ProductAcid from 'img/inventory/lsd.png'
import ProductMeth from 'img/inventory/meth.png'
import LabBackground from 'img/lab/background.png'
import './LabMarket.scss'
import Button from '../../../_common/Button'
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
import Content from '../../../_common/Content/Content'
import Masthead from '../../../_common/Masthead/Masthead'
import { Link } from 'react-router-dom'
import Back from 'img/icons/back.svg'
import DrugMarketItem from './MarketItem'
import LootItem from '../../_common/ResultScreen/LootItem'

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

function DrugMarket() {
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
            toast.add('error', 'Market', 'You must select at least 1 unit.')

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

        console.log({ data })
        const success = mutationResponse?.data?.labMarketTrade?.success
        const message = mutationResponse?.data?.labMarketTrade?.message
        if (!success) {
            toast.add(
                'error',
                message ??
                    'Your trade could not be completed, please try again.'
            )

            return
        }

        toast.add('success', 'Market', message)
        handleSuccess()
        refetch()
    }

    const drugMarketItems = [
        {
            name: 'Ecstasy',
            price: prices?.ecstasy,
            quantity: quantities?.ecstasy,
            image: ProductPills,
        },
        {
            name: 'LSD',
            price: prices?.lsd,
            quantity: quantities?.lsd,
            image: ProductAcid,
        },
        {
            name: 'Cocaine',
            price: prices?.cocaine,
            quantity: quantities?.cocaine,
            image: ProductCoke,
        },
        {
            name: 'Speed',
            price: prices?.speed,
            quantity: quantities?.speed,
            image: ProductMeth,
        },
    ]

    return (
        <Content color="game" className="lab-market">
            <Masthead fullWidth>
                <Link to={`../lab`}>
                    <img src={Back} alt="back to lab" />
                </Link>{' '}
                Lab market
            </Masthead>
            <img className="background" src={LabBackground} alt="lab" />
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
                        className={`lab-market__form ${
                            props.isSubmitting
                                ? 'lab-market__form__loading'
                                : ''
                        }`}
                    >
                        <div className="lab-market__form__product">
                            {drugMarketItems.map((item) => (
                                <DrugMarketItem item={item} />
                            ))}
                        </div>
                        <div className="lab-market__form__customs-total-control">
                            <div className="lab-market__form__customs-total-control__total-control">
                                <div className="lab-market__form__customs-total-control__total-control__total">
                                    <span>TOTAL: </span>
                                    <BalanceItem
                                        currency="money"
                                        value={calculateTotal(props.values)}
                                        showFull
                                        countDuration={0.03}
                                    />
                                </div>
                                <div className="lab-market__form__customs-total-control__total-control__control">
                                    <Button
                                        name="sell"
                                        styleType="primary"
                                        color="white"
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
                                        styleType="primary"
                                        color="green"
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
                            </div>
                            <div className="lab-market__form__customs-total-control__customs">
                                <Customs />
                            </div>
                        </div>
                    </form>
                )}
            </Formik>
        </Content>
    )
}

export default DrugMarket
