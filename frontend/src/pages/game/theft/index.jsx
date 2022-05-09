import React, { useEffect, useState } from 'react'
import Tabs from '../../_common/Tabs/Tabs'
import Masthead from '../../_common/Masthead/Masthead'
import Tab from '../../_common/Tabs/Tab'
import MarketPage from '../market/MarketPage'
import MarketCard from '../market/MarketCard'
import Content from '../../_common/Content/Content'
import House from 'img/theft/house.png'
import Garage from 'img/theft/Garage.png'
import Impound from 'img/theft/Impound.png'
import CrimeImage from 'img/crimes/minor/3-rob-mob-compound.jpg'
import LockpickTools from 'img/inventory/lock.png'

import './Theft.scss'
import Button from '../../_common/Button'
import ResultScreen from '../_common/ResultScreen'
import PercentBar from '../_common/PercentBar'
import Text from '../../_common/Text/Text'
import { gql } from 'apollo-boost'
import { useMutation, useQuery } from '@apollo/react-hooks'
import IntegratedLoader from '../_common/Loading/IntegratedLoader'
import { Field, Form, Formik } from 'formik'
import GraphErrors from '../_common/GraphErrors'
import Cooldown from '../../_common/Cooldown'
import useClickStreamFormMeta from '../../../hooks/useClickStreamFormMeta'
import Ticker from '../_common/Ticker'
import TickManager from '../_common/TickManager'
import { Link } from 'react-router-dom'

const CRIME = {
    name: 'Mob compound',
    cooldown: '03:21',
    image: CrimeImage,
    loot: [
        {
            name: 'Lockpick tools',
            image: LockpickTools,
            variant: 'item',
            variantType: null,
            quantity: 1,
        },
        {
            name: 'Ammo',
            image: null,
            variant: 'ammo',
            variantType: null,
            quantity: 100,
        },
        {
            name: 'Gold',
            image: null,
            variant: 'currency',
            variantType: 'gold',
            quantity: 44600,
        },
        {
            name: 'Money',
            image: null,
            variant: 'currency',
            variantType: 'money',
            quantity: 10,
        },
    ],
}

const CAR_THEFT_QUERY = gql`
    query CarTheftProgression {
        viewer {
            player {
                id
                xp
            }
        }
        carTheft {
            progression {
                id
                level
                progress
                progressMin
                progressTarget
            }
            residentialUnlocksAt
            commercialUnlocksAt
            corporateUnlocksAt
        }
    }
`

const CAR_THEFT_MUTATION = gql`
    mutation PerformCarTheft($input: PerformCarTheftInput!) {
        performCarTheft(input: $input) {
            title
            subtitle
            actionLabel
            status
            countdownStartedAt
            countdownExpiresAt
            countdownLabel
            vehicleLoot {
                id
                plate
                name
                damage
                heat
                image
                originDistrict
            }
            player {
                id
                xp
            }
            carTheft {
                progression {
                    id
                    level
                    progress
                    progressMin
                    progressTarget
                }
                residentialUnlocksAt
                commercialUnlocksAt
                corporateUnlocksAt
            }
        }
    }
`

function Theft() {
    const [result, setResult] = useState()
    const { data } = useQuery(CAR_THEFT_QUERY, {
        fetchPolicy: 'cache-and-network',
    })
    const [mutateCarTheft, { error, data: resultData }] = useMutation(
        CAR_THEFT_MUTATION
    )
    const sendFormMeta = useClickStreamFormMeta()
    const crime = CRIME
    const progression = data?.carTheft?.progression
    const commercialLocked = data?.carTheft?.commercialUnlocksAt
    const corporateLocked = data?.carTheft?.corporateUnlocksAt

    async function performTheft(values, actions) {
        const [formName, rawDifficulty, label] = values.theft.split(':')
        const [rawArea] = formName.split('-')
        const area = rawArea.charAt(0).toUpperCase() + rawArea.slice(1)
        const difficulty =
            rawDifficulty.charAt(0).toUpperCase() + rawDifficulty.slice(1)

        sendFormMeta(formName)

        try {
            const { data } = await mutateCarTheft({
                variables: {
                    input: {
                        label,
                        difficulty,
                        area,
                    },
                },
            })

            setResult(data.performCarTheft)
        } catch (e) {
            return await new Promise((resolve) => {
                setTimeout(() => {
                    resolve()
                    // actions.setSubmitting(false)
                    console.log('done')
                }, 1500)
            })
        }
    }

    function clearResult() {
        setResult(undefined)
    }

    return (
        <Content color="game" className="car-theft">
            <Masthead fullWidth>Car Theft</Masthead>
            <div className={`theft-garage-cta`}>
                <Link to={`/garage`}>
                    <Button color="blue" styleType="secondary">
                        Garage
                    </Button>
                </Link>
            </div>
            <div className={`theft-level-bar`}>
                {progression ? (
                    <PercentBar
                        value={progression.progress}
                        maxValue={progression.progressTarget}
                        showMaxValue
                        unit="XP"
                        color="blue"
                        label={`Level ${progression.level}`}
                    />
                ) : (
                    <IntegratedLoader />
                )}
            </div>
            <Cooldown timer="car-theft" ignore={!!result}>
                <Tabs
                    isColored
                    name="carTheftTabs"
                    defaultTab={localStorage.getItem('carTheftTabs')}
                >
                    <Tab name="Residential" color="blue">
                        {result && (
                            <>
                                <div
                                    className={`theft-tab-banner theft-tab-banner__result`}
                                >
                                    {result?.title}
                                    {result?.subtitle && (
                                        <div
                                            className={`theft-tab-banner__sub-label`}
                                        >
                                            {result?.subtitle}
                                        </div>
                                    )}
                                </div>
                                <ResultScreen
                                    image={CRIME.image}
                                    title={result?.actionLabel}
                                    label={result?.countdownLabel}
                                    loot={
                                        result?.vehicleLoot
                                            ? [result?.vehicleLoot]
                                            : undefined
                                    }
                                    cooldown={
                                        <TickManager
                                            dateStart={
                                                result.countdownStartedAt
                                            }
                                            dateEnd={result.countdownExpiresAt}
                                            onExpiry={clearResult}
                                        >
                                            {({ pretty }) => <>{pretty}</>}
                                        </TickManager>
                                    }
                                />
                            </>
                        )}
                        <div className={`theft-tab-banner`}>
                            Residential property
                        </div>
                        <div className="theft-buttons">
                            <Formik
                                initialValues={{ theft: null }}
                                onSubmit={performTheft}
                            >
                                {({ setFieldValue, handleSubmit }) => (
                                    <Form name="residential-car-theft">
                                        <div className={`theft-buttons__item`}>
                                            <Text lightBlue>Easy</Text>
                                            <Field
                                                component={Button}
                                                styleType="primary"
                                                color="blue"
                                                onClick={(e) => {
                                                    console.log('clicky')
                                                    setFieldValue(
                                                        'theft',
                                                        `${e.target.form.name}:easy:${e.target.textContent}`,
                                                        false
                                                    )
                                                    handleSubmit()
                                                    e.preventDefault()
                                                }}
                                            >
                                                Bathroom window
                                            </Field>
                                        </div>
                                        <div className={`theft-buttons__item`}>
                                            <Text green>Risky</Text>
                                            <Field
                                                component={Button}
                                                styleType="primary"
                                                color="green"
                                                name="risky"
                                                onClick={(e) => {
                                                    setFieldValue(
                                                        'theft',
                                                        `${e.target.form.name}:risky:${e.target.textContent}`,
                                                        false
                                                    )
                                                    handleSubmit()
                                                    e.preventDefault()
                                                }}
                                            >
                                                Garage door
                                            </Field>
                                        </div>
                                        <div className={`theft-buttons__item`}>
                                            <Text top-desktop yellow>
                                                Medium
                                            </Text>
                                            <Field
                                                component={Button}
                                                styleType="primary"
                                                color="yellow"
                                                name="medium"
                                                onClick={(e) => {
                                                    setFieldValue(
                                                        'theft',
                                                        `${e.target.form.name}:medium:${e.target.textContent}`,
                                                        false
                                                    )
                                                    handleSubmit()
                                                    e.preventDefault()
                                                }}
                                            >
                                                Back window
                                            </Field>
                                            <Text bottom-mobile green>
                                                Medium
                                            </Text>
                                        </div>
                                        <div className={`theft-buttons__item`}>
                                            <Text top-desktop red>
                                                Crackdown
                                            </Text>
                                            <Field
                                                component={Button}
                                                styleType="primary"
                                                color="red"
                                                name="crackdown"
                                                onClick={(e) => {
                                                    setFieldValue(
                                                        'theft',
                                                        `${e.target.form.name}:crackdown:${e.target.textContent}`,
                                                        false
                                                    )
                                                    handleSubmit()
                                                    e.preventDefault()
                                                }}
                                            >
                                                Front security door
                                            </Field>
                                            <Text bottom-mobile red>
                                                Crackdown
                                            </Text>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                        <div
                            className="theft-blueprint theft-blueprint--house"
                            style={{ backgroundImage: `url(${House})` }}
                        >
                            <div className="point point--easy" />
                            <div className="point point--risky" />
                            <div className="point point--medium" />
                            <div className="point point--crackdown" />
                        </div>
                    </Tab>
                    <Tab name="Commercial" color="yellow">
                        {result && (
                            <>
                                <div
                                    className={`theft-tab-banner theft-tab-banner__result`}
                                >
                                    {result?.title}
                                    {result?.subtitle && (
                                        <div
                                            className={`theft-tab-banner__sub-label`}
                                        >
                                            {result?.subtitle}
                                        </div>
                                    )}
                                </div>
                                <ResultScreen
                                    image={CRIME.image}
                                    title={result?.actionLabel}
                                    label={result?.countdownLabel}
                                    loot={
                                        result?.vehicleLoot
                                            ? [result?.vehicleLoot]
                                            : undefined
                                    }
                                    cooldown={
                                        <TickManager
                                            dateStart={
                                                result.countdownStartedAt
                                            }
                                            dateEnd={result.countdownExpiresAt}
                                            onExpiry={clearResult}
                                        >
                                            {({ pretty }) => <>{pretty}</>}
                                        </TickManager>
                                    }
                                />
                            </>
                        )}
                        <div className={`theft-tab-banner`}>
                            {commercialLocked ?? 'Local car park'}
                        </div>
                        <div className="theft-buttons">
                            <Formik
                                initialValues={{ theft: null }}
                                onSubmit={performTheft}
                            >
                                {({ setFieldValue, handleSubmit }) => (
                                    <Form name="commercial-car-theft">
                                        <div className={`theft-buttons__item`}>
                                            <Text lightBlue>Easy</Text>
                                            <Field
                                                component={Button}
                                                styleType="primary"
                                                color="blue"
                                                onClick={(e) => {
                                                    setFieldValue(
                                                        'theft',
                                                        `${e.target.form.name}:easy:${e.target.textContent}`,
                                                        false
                                                    )
                                                    handleSubmit()
                                                    e.preventDefault()
                                                }}
                                                disabled={commercialLocked}
                                            >
                                                Bathroom window
                                            </Field>
                                        </div>
                                        <div className={`theft-buttons__item`}>
                                            <Text green>Risky</Text>
                                            <Field
                                                component={Button}
                                                styleType="primary"
                                                color="green"
                                                name="risky"
                                                onClick={(e) => {
                                                    setFieldValue(
                                                        'theft',
                                                        `${e.target.form.name}:risky:${e.target.textContent}`,
                                                        false
                                                    )
                                                    handleSubmit()
                                                    e.preventDefault()
                                                }}
                                                disabled={commercialLocked}
                                            >
                                                Staff door
                                            </Field>
                                        </div>
                                        <div className={`theft-buttons__item`}>
                                            <Text top-desktop yellow>
                                                Medium
                                            </Text>
                                            <Field
                                                component={Button}
                                                styleType="primary"
                                                color="yellow"
                                                name="medium"
                                                onClick={(e) => {
                                                    setFieldValue(
                                                        'theft',
                                                        `${e.target.form.name}:medium:${e.target.textContent}`,
                                                        false
                                                    )
                                                    handleSubmit()
                                                    e.preventDefault()
                                                }}
                                                disabled={commercialLocked}
                                            >
                                                Roller door
                                            </Field>
                                            <Text bottom-mobile green>
                                                Medium
                                            </Text>
                                        </div>
                                        <div className={`theft-buttons__item`}>
                                            <Text top-desktop red>
                                                Crackdown
                                            </Text>
                                            <Field
                                                component={Button}
                                                styleType="primary"
                                                color="red"
                                                name="crackdown"
                                                onClick={(e) => {
                                                    setFieldValue(
                                                        'theft',
                                                        `${e.target.form.name}:crackdown:${e.target.textContent}`,
                                                        false
                                                    )
                                                    handleSubmit()
                                                    e.preventDefault()
                                                }}
                                                disabled={commercialLocked}
                                            >
                                                Security room
                                            </Field>
                                            <Text bottom-mobile red>
                                                Crackdown
                                            </Text>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                        <div
                            className="theft-blueprint theft-blueprint--garage"
                            style={{ backgroundImage: `url(${Garage})` }}
                        >
                            <div className="point point--easy" />
                            <div className="point point--risky" />
                            <div className="point point--medium" />
                            <div className="point point--crackdown" />
                        </div>
                    </Tab>
                    <Tab name="Corporate" color="red">
                        {result && (
                            <>
                                <div
                                    className={`theft-tab-banner theft-tab-banner__result`}
                                >
                                    {result?.title}
                                    {result?.subtitle && (
                                        <div
                                            className={`theft-tab-banner__sub-label`}
                                        >
                                            {result?.subtitle}
                                        </div>
                                    )}
                                </div>
                                <ResultScreen
                                    image={CRIME.image}
                                    title={result?.actionLabel}
                                    label={result?.countdownLabel}
                                    loot={
                                        result?.vehicleLoot
                                            ? [result?.vehicleLoot]
                                            : undefined
                                    }
                                    cooldown={
                                        <TickManager
                                            dateStart={
                                                result.countdownStartedAt
                                            }
                                            dateEnd={result.countdownExpiresAt}
                                            onExpiry={clearResult}
                                        >
                                            {({ pretty }) => <>{pretty}</>}
                                        </TickManager>
                                    }
                                />
                            </>
                        )}
                        <div className={`theft-tab-banner`}>
                            {corporateLocked ?? 'Impound Lot'}
                        </div>
                        <div className="theft-buttons">
                            <Formik
                                initialValues={{ theft: null }}
                                onSubmit={performTheft}
                            >
                                {({ setFieldValue, handleSubmit }) => (
                                    <Form name="corporate-car-theft">
                                        <div className={`theft-buttons__item`}>
                                            <Text lightBlue>Easy</Text>
                                            <Field
                                                component={Button}
                                                styleType="primary"
                                                color="blue"
                                                onClick={(e) => {
                                                    setFieldValue(
                                                        'theft',
                                                        `${e.target.form.name}:easy:${e.target.textContent}`,
                                                        false
                                                    )
                                                    handleSubmit()
                                                    e.preventDefault()
                                                }}
                                                disabled={corporateLocked}
                                            >
                                                Bathroom window
                                            </Field>
                                        </div>
                                        <div className={`theft-buttons__item`}>
                                            <Text green>Risky</Text>
                                            <Field
                                                component={Button}
                                                styleType="primary"
                                                color="green"
                                                name="risky"
                                                onClick={(e) => {
                                                    setFieldValue(
                                                        'theft',
                                                        `${e.target.form.name}:risky:${e.target.textContent}`,
                                                        false
                                                    )
                                                    handleSubmit()
                                                    e.preventDefault()
                                                }}
                                                disabled={corporateLocked}
                                            >
                                                Garage door lock
                                            </Field>
                                        </div>
                                        <div className={`theft-buttons__item`}>
                                            <Text top-desktop yellow>
                                                Medium
                                            </Text>
                                            <Field
                                                component={Button}
                                                styleType="primary"
                                                color="yellow"
                                                name="medium"
                                                onClick={(e) => {
                                                    setFieldValue(
                                                        'theft',
                                                        `${e.target.form.name}:medium:${e.target.textContent}`,
                                                        false
                                                    )
                                                    handleSubmit()
                                                    e.preventDefault()
                                                }}
                                                disabled={corporateLocked}
                                            >
                                                Cut through fence
                                            </Field>
                                            <Text bottom-mobile green>
                                                Medium
                                            </Text>
                                        </div>
                                        <div className={`theft-buttons__item`}>
                                            <Text top-desktop red>
                                                Crackdown
                                            </Text>
                                            <Field
                                                component={Button}
                                                styleType="primary"
                                                color="red"
                                                name="crackdown"
                                                onClick={(e) => {
                                                    setFieldValue(
                                                        'theft',
                                                        `${e.target.form.name}:crackdown:${e.target.textContent}`,
                                                        false
                                                    )
                                                    handleSubmit()
                                                    e.preventDefault()
                                                }}
                                                disabled={corporateLocked}
                                            >
                                                Drain manhole
                                            </Field>
                                            <Text bottom-mobile red>
                                                Crackdown
                                            </Text>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                        <div
                            className="theft-blueprint theft-blueprint--impound"
                            style={{ backgroundImage: `url(${Impound})` }}
                        >
                            <div className="point point--easy" />
                            <div className="point point--risky" />
                            <div className="point point--medium" />
                            <div className="point point--crackdown" />
                        </div>
                    </Tab>
                </Tabs>
            </Cooldown>
            <div className={`theft-errors`}>
                {error && <GraphErrors error={error} />}
            </div>
        </Content>
    )
}

export default Theft
