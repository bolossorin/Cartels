import React, { useEffect, useState } from 'react'
import CrimesList from './crimesList.jsx'
import IntegratedLoader from '../_common/Loading/IntegratedLoader'
import Locked from 'img/crimes/locked-crime.svg'
import { gql } from 'apollo-boost'
import { useMutation, useQuery } from '@apollo/react-hooks'

import './MinorCrimes.scss'
import PickpocketBusinessman from 'img/crimes/minor/1-pickpocket-businessman.jpg'
import PickpocketMan from 'img/crimes/minor/1-pickpocket-man.jpg'
import RobGarage from 'img/crimes/minor/1-rob-garage.jpg'
import RobLiquorStore from 'img/crimes/minor/1-rob-liquor-store.jpg'
import SearchCarWreck from 'img/crimes/minor/1-search-car-wreck.jpg'
import SearchFactory from 'img/crimes/minor/1-search-factory.jpg'
import StealBicycle from 'img/crimes/minor/1-steal-bicycle.jpg'
import StealGas from 'img/crimes/minor/1-steal-gas.jpg'
import PickpocketDrugDealer from 'img/crimes/minor/2-pickpocket-drug-dealer.jpg'
import RobATM from 'img/crimes/minor/2-rob-atm.jpg'
import RobHouse from 'img/crimes/minor/2-rob-house.jpg'
import RobJewelleryStore from 'img/crimes/minor/2-rob-jewellery-store.jpg'
import RobLocalBank from 'img/crimes/minor/2-rob-local-bank.jpg'
import StealCar from 'img/crimes/minor/2-steal-car.jpg'
import StealCargoVan from 'img/crimes/minor/2-steal-cargo-van.jpg'
import StealYacht from 'img/crimes/minor/2-steal-yacht.jpg'
import PickpocketAccountant from 'img/crimes/minor/3-pickpocket-accountant.jpg'
import PickpocketLocalBoss from 'img/crimes/minor/3-pickpocket-local-boss.jpg'
import RobCarSalon from 'img/crimes/minor/3-rob-car-salon.jpg'
import RobMobCompound from 'img/crimes/minor/3-rob-mob-compound.jpg'
import RobPenthouse from 'img/crimes/minor/3-rob-penthouse.jpg'
import StealArmoredCar from 'img/crimes/minor/3-steal-armored-car.jpg'
import StealJet from 'img/crimes/minor/3-steal-jet.jpg'
import StealTax from 'img/crimes/minor/3-steal-tax.jpg'
import ProgressBar from '../_common/ProgressBar'
import ProgressStrip from '../_common/ProgressStrip'
import Cooldown from '../../_common/Cooldown'
import Content from '../../_common/Content/Content'
import Masthead from '../../_common/Masthead/Masthead'
import PercentBar from '../_common/PercentBar'
import Tabs from '../../_common/Tabs/Tabs'
import Tab from '../../_common/Tabs/Tab'
import ResultScreen from '../_common/ResultScreen'
import TickManager from '../_common/TickManager'
import CrimeItem from './crimeItem'
import LootItem from '../_common/ResultScreen/LootItem'

const TABS = {
    Street: {
        level: 1,
        difficulty: 'easy',
        locked: null,
    },
    Heists: {
        level: 2,
        difficulty: 'medium',
        locked: 2,
    },
    Corporate: {
        level: 3,
        difficulty: 'hard',
        //locked: 30,
        locked: 3,
    },
}

const CRIMES_QUERY = gql`
    query Crimes {
        crimes {
            list {
                id
                ord
                name
                description
                difficulty
                image
                loot {
                    money
                    crypto
                    exp
                }
                unlocked
                progress
                progressTarget
                limitedTime
            }
            tabs {
                name
                level
                difficulty
            }
            progression {
                id
                level
                progress
                progressMin
                progressTarget
            }
        }
    }
`

const CRIME_MUTATION = gql`
    mutation performCrime($id: ID!) {
        performCrime(id: $id) {
            lootFactor {
                money
                crypto
                exp
            }
            loot {
                name
                variant
                variantType
                image
                quantity
            }
            player {
                id
                currencies {
                    name
                    amount
                }
                xp
                xpTarget
                cash
                isJailed
            }
            event {
                message
                status
                countdownSecs
                countdownStartedAt
                countdownExpiresAt
                countdownLabel
                subtitle
                jailSecs
                timerTag
                crime {
                    id
                    name
                    loot {
                        money
                        crypto
                        exp
                    }
                    image
                }
            }
            crimes {
                list {
                    id
                    ord
                    name
                    description
                    difficulty
                    image
                    loot {
                        money
                        crypto
                        exp
                    }
                    unlocked
                    progress
                    progressTarget
                    limitedTime
                }
                tabs {
                    name
                    level
                    difficulty
                }
                progression {
                    id
                    level
                    progress
                    progressMin
                    progressTarget
                }
            }
        }
    }
`

const imageMap = {
    PickpocketBusinessman: PickpocketBusinessman,
    PickpocketMan: PickpocketMan,
    RobGarage: RobGarage,
    RobLiquorStore: RobLiquorStore,
    SearchCarWreck: SearchCarWreck,
    SearchFactory: SearchFactory,
    StealBicycle: StealBicycle,
    StealGas: StealGas,
    PickpocketDrugDealer: PickpocketDrugDealer,
    RobATM: RobATM,
    RobHouse: RobHouse,
    RobJewelleryStore: RobJewelleryStore,
    RobLocalBank: RobLocalBank,
    StealCar: StealCar,
    StealCargoVan: StealCargoVan,
    StealYacht: StealYacht,
    PickpocketAccountant: PickpocketAccountant,
    PickpocketLocalBoss: PickpocketLocalBoss,
    RobCarSalon: RobCarSalon,
    RobMobCompound: RobMobCompound,
    RobPenthouse: RobPenthouse,
    StealArmoredCar: StealArmoredCar,
    StealJet: StealJet,
    StealTax: StealTax,
}

const sortCrimes = (a, b) => {
    if (!a.unlocked || !b.unlocked) {
        return b.unlocked - a.unlocked
    }

    return b.ord - a.ord
}

function MinorCrimes() {
    const { data } = useQuery(CRIMES_QUERY, {
        fetchPolicy: 'cache-and-network',
    })

    const [result, setResult] = useState()
    const [loadingCrime, setLoadingCrime] = useState(null)

    const [
        mutatePerformCrime,
        { data: resultData, loading: resultLoading, error },
    ] = useMutation(CRIME_MUTATION)

    useEffect(() => {
        if (!resultLoading && resultData) {
            setResult(resultData)
        }
    }, [resultData, resultLoading])

    useEffect(() => {
        if (!!error) {
            confirm(error.message)
        }
    }, [error])

    async function handleCrime(id) {
        setLoadingCrime(id)
        await mutatePerformCrime({
            variables: {
                id,
            },
        })

        setLoadingCrime(null)
        // document.body.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    const streetCrimes = data?.crimes?.list
        ?.filter((crime) => crime.difficulty === 'STREET')
        .sort(sortCrimes)
    const heistCrimes = data?.crimes?.list
        ?.filter((crime) => crime.difficulty === 'HEISTS')
        .sort(sortCrimes)
    const corporateCrimes = data?.crimes?.list
        ?.filter((crime) => crime.difficulty === 'CORPORATE')
        .sort(sortCrimes)

    const crimeProgress = data?.crimes?.progression
    const crimeProgressLevel = crimeProgress?.level

    const skipCooldown = !!resultData || resultLoading

    function clearResult() {
        setResult(undefined)
    }

    return (
        <Content color="game" className="minor-crimes">
            <Masthead fullWidth>Crimes</Masthead>
            {data ? (
                <>
                    <div className={`crimes-level-bar`}>
                        {crimeProgress ? (
                            <PercentBar
                                value={crimeProgress?.progress}
                                maxValue={crimeProgress?.progressTarget}
                                showMaxValue
                                unit="XP"
                                color="blue"
                                label={`Level ${crimeProgress?.level}`}
                            />
                        ) : (
                            <IntegratedLoader />
                        )}
                    </div>
                    <Cooldown timer="crimes" ignore={skipCooldown}>
                        <Tabs
                            isColored
                            name="crimeTabs"
                            defaultTab={localStorage.getItem('crimeTabs')}
                        >
                            <Tab
                                name="Street"
                                className={`crimes-tab crimes-tab__street`}
                                color="blue"
                            >
                                {result && (
                                    <>
                                        <div
                                            className={`crimes-tab-banner crimes-tab-banner__result`}
                                        >
                                            {result?.performCrime.event.message}
                                            {result?.performCrime.event
                                                .subtitle && (
                                                <div
                                                    className={`crimes-tab-banner__sub-label`}
                                                >
                                                    {
                                                        result?.performCrime
                                                            .event.subtitle
                                                    }
                                                </div>
                                            )}
                                        </div>
                                        <ResultScreen
                                            image={
                                                imageMap[
                                                    result?.performCrime.event
                                                        .crime.image
                                                ]
                                            }
                                            title={
                                                result?.performCrime.event.crime
                                                    .name
                                            }
                                            label={
                                                result?.performCrime.event
                                                    .countdownLabel
                                            }
                                            loot={
                                                result?.performCrime.loot ??
                                                undefined
                                            }
                                            cooldown={
                                                <TickManager
                                                    dateStart={
                                                        result?.performCrime
                                                            .event
                                                            .countdownStartedAt
                                                    }
                                                    dateEnd={
                                                        result?.performCrime
                                                            .event
                                                            .countdownExpiresAt
                                                    }
                                                    onExpiry={clearResult}
                                                >
                                                    {({ pretty }) => (
                                                        <>{pretty}</>
                                                    )}
                                                </TickManager>
                                            }
                                        />
                                    </>
                                )}
                                {streetCrimes?.map((crime) => (
                                    <CrimeItem
                                        key={crime?.name}
                                        crime={crime}
                                        handleCrime={handleCrime}
                                        loadingCrime={loadingCrime}
                                    />
                                ))}
                            </Tab>
                            <Tab
                                name="Heists"
                                className={`crimes-tab crimes-tab__heists`}
                                color="yellow"
                            >
                                {result && (
                                    <>
                                        <div
                                            className={`crimes-tab-banner crimes-tab-banner__result`}
                                        >
                                            {result?.performCrime.event.message}
                                            {result?.performCrime.event
                                                .subtitle && (
                                                <div
                                                    className={`crimes-tab-banner__sub-label`}
                                                >
                                                    {
                                                        result?.performCrime
                                                            .event.subtitle
                                                    }
                                                </div>
                                            )}
                                        </div>
                                        <ResultScreen
                                            image={
                                                imageMap[
                                                    result?.performCrime.event
                                                        .crime.image
                                                ]
                                            }
                                            title={
                                                result?.performCrime.event.crime
                                                    .name
                                            }
                                            label={
                                                result?.performCrime.event
                                                    .countdownLabel
                                            }
                                            loot={
                                                result?.performCrime.loot ??
                                                undefined
                                            }
                                            cooldown={
                                                <TickManager
                                                    dateStart={
                                                        result?.performCrime
                                                            .event
                                                            .countdownStartedAt
                                                    }
                                                    dateEnd={
                                                        result?.performCrime
                                                            .event
                                                            .countdownExpiresAt
                                                    }
                                                    onExpiry={clearResult}
                                                >
                                                    {({ pretty }) => (
                                                        <>{pretty}</>
                                                    )}
                                                </TickManager>
                                            }
                                        />
                                    </>
                                )}
                                {heistCrimes?.map((crime) => (
                                    <CrimeItem
                                        key={crime?.name}
                                        crime={crime}
                                        handleCrime={handleCrime}
                                        loadingCrime={loadingCrime}
                                    />
                                ))}
                            </Tab>
                            <Tab
                                name="Corporate"
                                className={`crimes-tab crimes-tab__corporate`}
                                color="red"
                            >
                                {result && (
                                    <>
                                        <div
                                            className={`crimes-tab-banner crimes-tab-banner__result`}
                                        >
                                            {result?.performCrime.event.message}
                                            {result?.performCrime.event
                                                .subtitle && (
                                                <div
                                                    className={`crimes-tab-banner__sub-label`}
                                                >
                                                    {
                                                        result?.performCrime
                                                            .event.subtitle
                                                    }
                                                </div>
                                            )}
                                        </div>
                                        <ResultScreen
                                            image={
                                                imageMap[
                                                    result?.performCrime.event
                                                        .crime.image
                                                ]
                                            }
                                            title={
                                                result?.performCrime.event.crime
                                                    .name
                                            }
                                            label={
                                                result?.performCrime.event
                                                    .countdownLabel
                                            }
                                            loot={
                                                result?.performCrime.loot ??
                                                undefined
                                            }
                                            cooldown={
                                                <TickManager
                                                    dateStart={
                                                        result?.performCrime
                                                            .event
                                                            .countdownStartedAt
                                                    }
                                                    dateEnd={
                                                        result?.performCrime
                                                            .event
                                                            .countdownExpiresAt
                                                    }
                                                    onExpiry={clearResult}
                                                >
                                                    {({ pretty }) => (
                                                        <>{pretty}</>
                                                    )}
                                                </TickManager>
                                            }
                                        />
                                    </>
                                )}
                                {corporateCrimes?.map((crime) => (
                                    <CrimeItem
                                        key={crime?.name}
                                        crime={crime}
                                        handleCrime={handleCrime}
                                        loadingCrime={loadingCrime}
                                    />
                                ))}
                            </Tab>
                        </Tabs>
                    </Cooldown>
                </>
            ) : (
                <IntegratedLoader />
            )}
        </Content>
    )
}

export default MinorCrimes
