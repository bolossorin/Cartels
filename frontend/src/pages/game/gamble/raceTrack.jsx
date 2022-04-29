import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Field, Formik } from 'formik'
import Horses from './horses'
import HorsesHeader from 'img/gamble/horses-header.png'
import Ownership from '../_common/Ownership'
import TextInput from '../_common/TextInput/TextInput'

import './RaceTrack.scss'
import BalanceItem from '../_common/BalanceItem'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import IntegratedLoader from '../_common/Loading/IntegratedLoader'

const HORSES = [
    {
        name: 'Desolate View',
        winningRatio: 2,
        number: 6,
        selected: true,
        color: '#009bc8',
    },
    {
        name: 'Turkey Shoot',
        winningRatio: 3,
        number: 72,
        selected: false,
        color: '#6f2e3d',
    },
    {
        name: 'Crown Ridge',
        winningRatio: 5,
        number: 3,
        selected: false,
        color: '#5d2f5d',
    },
    {
        name: 'Fine Style',
        winningRatio: 7,
        number: 14,
        selected: false,
        color: '#96cfaf',
    },
    {
        name: 'Super Break',
        winningRatio: 9,
        number: 7,
        selected: false,
        color: '#fce35b',
    },
    {
        name: 'Fearless Gun',
        winningRatio: 15,
        number: 23,
        selected: false,
        color: '#d18c33',
    },
]

const INMATES_QUERY = gql`
    query InmatesQuery {
        raceTrack {
            id
            maximumBet
            forSaleDisplay
            variant
            propertyNameDisplay
            owner {
                id
                name
            }
        }
    }
`

const BET_MUTATION = gql`
    mutation raceTrackBet($propertyId: ID!, $wager: String!, $odds: Int!) {
        raceTrackBet(propertyId: $propertyId, wager: $wager, odds: $odds) {
            title
            money
            subtitle
            won
            player {
                id
                currencies {
                    name
                    amount
                }
                cash
            }
        }
    }
`

function RaceTrack({ player }) {
    const [horse, setHorse] = useState(null)
    const [resultDismiss, setResultDismiss] = useState(false)
    const { data, loading } = useQuery(INMATES_QUERY, {
        fetchPolicy: 'cache-and-network',
    })
    const [
        mutateBet,
        { data: result, loading: betLoading, error },
    ] = useMutation(BET_MUTATION)

    const betError = error?.graphQLErrors?.[0]?.message
    const resultShown = !resultDismiss && (betLoading || result || betError)
    const selectedHorse = HORSES.find(
        ({ winningRatio }) => winningRatio === horse
    )

    useEffect(() => {
        let timeout

        if (!resultDismiss && resultShown) {
            timeout = setTimeout(() => {
                dismissResult()
            }, 2000)
        }

        return () => clearTimeout(timeout)
    }, [resultDismiss, resultShown])

    function placeBet(wager) {
        setResultDismiss(false)

        mutateBet({
            variables: {
                propertyId: data?.raceTrack?.id,
                wager,
                odds: horse,
            },
        })
    }

    function dismissResult() {
        setResultDismiss(true)
    }

    function formatTitle(title) {
        return title
            ?.replace('{name}', selectedHorse?.name)
            ?.replace('{ratio}', selectedHorse?.winningRatio)
    }

    if (!data?.raceTrack?.owner) {
        return <IntegratedLoader text="Feeding horses..." />
    }

    return (
        <section className="gamble-container race-track-container">
            <Link to="/casino" className="gamble-header">
                <h1>Gamble</h1>
            </Link>
            <h2>Hippodrome</h2>
            <div
                className="horses-header"
                style={{ background: `url(${HorsesHeader})` }}
            />
            <div
                className={`horses-list horses-list__${
                    resultShown ? 'shown' : 'hidden'
                }`}
            >
                <Horses horseList={HORSES} horse={horse} setHorse={setHorse} />
                <div
                    className={`results results__${
                        resultShown && !betLoading ? 'shown' : 'hidden'
                    }`}
                >
                    <div
                        className="results__box"
                        onClick={() => dismissResult()}
                    >
                        <h1>
                            {betError
                                ? 'An error has occurred'
                                : formatTitle(result?.raceTrackBet?.title)}
                        </h1>
                        <article>
                            {!betError && (
                                <BalanceItem
                                    value={result?.raceTrackBet?.money}
                                    currency="money"
                                    type={
                                        result?.raceTrackBet?.won
                                            ? 'credit'
                                            : 'debit'
                                    }
                                    showFull
                                />
                            )}

                            <p>
                                {betError
                                    ? betError
                                    : result?.raceTrackBet?.subtitle}
                            </p>
                        </article>
                    </div>
                </div>
            </div>
            <h2>
                {`Available: `}
                <BalanceItem
                    value={player?.cash}
                    currency="money"
                    inlineBalance
                    type="money"
                />
            </h2>
            <Formik
                initialValues={{ bet: '' }}
                onSubmit={(values, actions) => {
                    placeBet(values?.wager)
                }}
            >
                {(props) => (
                    <form
                        onSubmit={props.handleSubmit}
                        className={`wager-input ${
                            props.isSubmitting ? 'form__loading' : 'form'
                        }`}
                    >
                        <Field
                            name="wager"
                            placeholder="Place a bet"
                            hasModifiers={true}
                            component={TextInput}
                        />
                        <button
                            className="start-race"
                            disabled={
                                !horse || resultShown || betLoading
                                    ? 'disabled'
                                    : undefined
                            }
                        >
                            {horse ? 'Place Bet' : 'Select Horse'}
                        </button>
                    </form>
                )}
            </Formik>
            <h2>Ownership information</h2>
            <Ownership
                property={{
                    maximumBet: data?.raceTrack?.maximumBet,
                    forSale: data?.raceTrack?.forSaleDisplay,
                    owner: data?.raceTrack?.owner,
                }}
            />
        </section>
    )
}

export default RaceTrack
