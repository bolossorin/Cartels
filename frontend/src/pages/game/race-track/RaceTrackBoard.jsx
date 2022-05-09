import React, { useState } from 'react'
import useEvent from '../../../hooks/useEvent'
import Button from '../../_common/Button'
import { gql } from 'apollo-boost'
import { useMutation, useQuery } from '@apollo/react-hooks'
import IntegratedLoader from '../_common/Loading/IntegratedLoader'
import TickManager from '../_common/TickManager'
import RaceTrackRewardBanner from './RewardBanner'
import RaceTrackBetSlip from './BetSlip'
import { useToast } from '../_common/Toast'

const RACE_TRACK_QUERY = gql`
    query RoulettePage {
        raceTrackSheet {
            horses {
                id
                name
            }
            odds {
                id
                name
                odds
                silk
            }
            sheetExpiresAt
        }
    }
`

const PLACE_BET_MUTATION = gql`
    mutation RaceTrackPageBet($input: BetRaceTrackInput!) {
        betRaceTrack(input: $input) {
            player {
                id
                cash
            }
            property {
                id
                propertyType
                currentState
                maximumBet
                player {
                    id
                    wealth
                }
            }
            result {
                landedHorse
                banner {
                    displayType
                    nodes {
                        id
                        nodeType
                        nodeData
                    }
                }
            }
        }
    }
`

function decimalPlaces(num) {
    const match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/)
    if (!match) {
        return 0
    }
    return Math.max(
        0,
        (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0)
    )
}

function moneylineFromDecimal(dec) {
    if (dec < 2) {
        const moneyline = -100 / (dec - 1)
        if (decimalPlaces(moneyline) > 2) {
            return Number(moneyline).toFixed(2)
        }

        return moneyline
    } else {
        const moneyline = 100 * (dec - 1)
        if (decimalPlaces(moneyline) > 2) {
            return `+` + Number(moneyline).toFixed(2)
        }

        return `+` + Math.floor(moneyline)
    }
}

function formatOdds(odds, displayType) {
    const decimal = parseInt(odds) / 10

    return {
        decimal: `$${decimal.toFixed(2)}`,
        percentage: `${Number(100 / decimal).toFixed(2)}%`,
        moneyline: moneylineFromDecimal(decimal),
    }[displayType]
}

const WHEEL_HANG_TIME_MS = 0.5 * 1000

function RaceTrackBoard() {
    const { data, refetch, loading } = useQuery(RACE_TRACK_QUERY)
    const [mutateBet, { loading: betLoading }] = useMutation(PLACE_BET_MUTATION)
    const triggerEvent = useEvent()
    const toast = useToast()
    const [betData, setBetData] = useState()
    const [spinning, setSpinning] = useState(false)
    const [preferences, setPreferences] = useState({
        moneyline: !!(window.localStorage.getItem('rt-moneyline') ?? false),
        probability: !!(window.localStorage.getItem('rt-probability') ?? false),
    })
    const [selected, setSelected] = useState()
    const [expired, setExpired] = useState(false)

    const horses = data?.raceTrackSheet?.horses
    const sheetOdds = data?.raceTrackSheet?.odds
    const sheetExpires = data?.raceTrackSheet?.sheetExpiresAt

    const betResult = betData?.betRaceTrack?.result

    function handlePreferenceChange(id) {
        const enabled = !preferences[id]
        window.localStorage.setItem(`rt-${id}`, `${enabled}`)
        setPreferences({ ...preferences, [id]: enabled })

        triggerEvent({
            name: 'RACE_TRACK_UPDATE_PREFERENCE',
            details: {
                id,
                enabled,
            },
        })
    }

    function handleSelect(horseId) {
        setSelected(horseId)

        triggerEvent({
            name: 'RACE_TRACK_SELECT_HORSE',
            details: {
                horseId,
            },
        })
    }

    function handleRefresh() {
        refetch()
        setTimeout(() => {
            setSelected(undefined)
            setExpired(false)
        }, 500)

        triggerEvent({
            name: 'RACE_TRACK_REFRESH_HORSES',
            details: {
                selected,
            },
        })
    }

    async function handleBet(amount) {
        if (!selected || spinning || loading || betLoading) return

        setSpinning(true)

        const horseStacks = []
        for (const sheetItem of sheetOdds) {
            horseStacks.push({
                odds: sheetItem.odds,
                horseId: sheetItem.id,
                bet: selected === sheetItem.id ? amount : undefined,
            })
        }

        const startedBetMs = window.ESCOBAR.getTime().getTime()

        let result
        try {
            result = await mutateBet({
                variables: {
                    input: {
                        horseStacks,
                    },
                },
            })

            const timeTakenMs =
                startedBetMs - window.ESCOBAR.getTime().getTime()
            let wheelStopMs = 0
            if (
                timeTakenMs < WHEEL_HANG_TIME_MS &&
                preferences?.rapid !== true
            ) {
                // Mutation was 2fast2furious, add some artificial delay
                wheelStopMs =
                    WHEEL_HANG_TIME_MS -
                    (timeTakenMs - startedBetMs) -
                    window.ESCOBAR.getTime().getTime()
            }

            const landed = result?.data?.betRaceTrack?.result?.landedHorse
            if (landed) {
                setTimeout(() => {
                    setSpinning(false)
                    setBetData(result?.data)
                }, wheelStopMs)
            } else {
                setSpinning(false)
            }
        } catch (err) {
            console.log(err)
            toast.add('error', 'Race Track Bookmaker', err.message, true)
            setSpinning(false)
        }
    }

    let baseHorseClass =
        'race-track__list__horse race-track__list__horse__decided'
    if (!selected) {
        baseHorseClass =
            'race-track__list__horse race-track__list__horse__undecided'
    }

    return (
        <>
            <div className={`race-track__list__title`}>
                Horses
                {sheetExpires && !expired && (
                    <div className={`race-track__list__title__new-field`}>
                        New horses in{' '}
                        <TickManager
                            dateStart={new Date().toJSON()}
                            dateEnd={sheetExpires}
                            onExpiry={() => setExpired(true)}
                        >
                            {({ pretty }) => <>{pretty}</>}
                        </TickManager>
                    </div>
                )}
                {expired && !loading && (
                    <div
                        className={`race-track__list__title__new-field__refresh`}
                        onClick={handleRefresh}
                    >
                        Refresh horses
                    </div>
                )}
            </div>
            <div
                className={`race-track__list ${
                    selected ? `race-track__list__has-decided` : ``
                }`}
            >
                {!sheetOdds && <IntegratedLoader />}
                {sheetOdds?.map((horse, k) => (
                    <div
                        key={horse.id}
                        className={`${baseHorseClass} race-track__horse${
                            k + 1
                        } ${
                            selected === horse.id
                                ? `race-track__list__horse__selected`
                                : ``
                        }`}
                        onClick={() => handleSelect(horse.id)}
                    >
                        <div className={`race-track__list__horse__silk`}>
                            <img
                                src={`/static/img/track/silks/${horse.silk}.svg`}
                                alt={`${horse.name} silk`}
                            />
                        </div>
                        <div className={`race-track__list__horse__sheet`}>
                            <h3>{horse.name}</h3>
                            <span
                                className={`race-track__list__horse__sheet__odds`}
                            >
                                {formatOdds(
                                    horse.odds,
                                    preferences.moneyline
                                        ? 'moneyline'
                                        : 'decimal'
                                )}
                            </span>{' '}
                            ODDS
                            {preferences.probability && (
                                <p>
                                    {formatOdds(horse.odds, 'percentage')} impl.
                                    probability
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <RaceTrackRewardBanner
                selected={selected}
                result={betResult}
                loading={betLoading}
                spinning={spinning}
                odds={sheetOdds}
                horses={horses}
            />
            <RaceTrackBetSlip
                handleBet={handleBet}
                spinning={spinning}
                selectedHorse={selected}
            />
            <div className={`race-track__results`}>
                <div className={`race-track__results__title`}>Preferences</div>
                <div className={`race-track__results__prefs`}>
                    <div className={`race-track__results__pref`}>
                        <label htmlFor={`switch`}>
                            Show implied probability
                        </label>
                        <label className="switch">
                            <input
                                type="checkbox"
                                id="switch"
                                checked={preferences.probability}
                                onChange={(e) => {
                                    handlePreferenceChange('probability')
                                    e.stopPropagation()
                                }}
                            />
                            <span className="slider round">&nbsp;</span>
                        </label>
                    </div>
                    <div className={`race-track__results__pref`}>
                        <label htmlFor={`moneyline`}>
                            Use Moneyline (American) odds
                        </label>
                        <label className="switch">
                            <input
                                type="checkbox"
                                id="moneyline"
                                checked={preferences.moneyline}
                                onChange={(e) => {
                                    handlePreferenceChange('moneyline')
                                    e.stopPropagation()
                                }}
                            />
                            <span className="slider round">&nbsp;</span>
                        </label>
                    </div>
                </div>
            </div>
        </>
    )
}

export default RaceTrackBoard
