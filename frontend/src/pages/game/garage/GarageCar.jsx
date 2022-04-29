import React, { useEffect, useState } from 'react'
import Masthead from '../../_common/Masthead/Masthead'
import { useHistory, useParams } from 'react-router'
import Content from '../../_common/Content/Content'
import './GarageCar.scss'
import GarageStar from 'img/garage-star.svg'
import PercentBar from '../_common/PercentBar'
import Image from '../../_common/Image/Image'
import Button from '../../_common/Button'
import BalanceItem from '../_common/BalanceItem'
import VehiclePlate from '../_common/VehiclePlate'
import IcoDollars from 'img/icons/dollar.svg'
import { Link } from 'react-router-dom'
import { gql } from 'apollo-boost'
import { useMutation, useQuery } from '@apollo/react-hooks'
import FullScreenError from '../_common/FullScreenError'
import GraphErrors from '../_common/GraphErrors'
import Shipping from 'img/cargo.svg'
import { useToast } from '../_common/Toast'
import Modal from "../_common/Modal";
import NameTag from "../_common/NameTag";
import GarageCarTransportModal from "./GarageCarTransportModal";
import TickManager from "../_common/TickManager";

const GARAGE_VEHICLE_QUERY = gql`
    query GarageVehiclePage($input: GarageVehicleInput!) {
        garageVehicle(input: $input) {
            id
            plate
            name
            damage
            heat
            image
            originDistrict
            destinationDistrict
            destinationArrival
            destinationShipped
            district
            pricing {
                sell
                repair
                changePlates
                transportOptions {
                    district
                    price
                    distance
                }
            }
        }
    }
`

const MECHANIC_MUTATION = gql`
    mutation GarageVehiclePageMechanic($input: PerformMechanicTaskInput!) {
        performMechanicTask(input: $input) {
            status
            message
            player {
                id
                cash
            }
            vehicle {
                id
                plate
                name
                damage
                heat
                image
                originDistrict
                destinationDistrict
                destinationArrival
                destinationShipped
                district
                pricing {
                    sell
                    repair
                    changePlates
                    transportOptions {
                        district
                        price
                        distance
                    }
                }
            }
        }
    }
`

function GarageCar() {
    const { id } = useParams()
    const toast = useToast()
    const history = useHistory()
    const [transportModal, setTransportModal] = useState(false)
    const { data, error } = useQuery(GARAGE_VEHICLE_QUERY, {
        variables: {
            input: {
                id,
            },
        },
        fetchPolicy: 'cache-and-network',
        returnPartialData: true,
    })
    const [mutateMechanic, { loading, error: mechanicError }] = useMutation(
        MECHANIC_MUTATION
    )

    const vehicle = data?.garageVehicle
    const vehiclePricing = vehicle?.pricing

    async function handleMechanic({ taskCode, destination, agreedPrice }) {
        const result = await mutateMechanic({
            variables: {
                input: {
                    id: vehicle?.id,
                    taskCode,
                    destinationDistrict: destination ?? undefined,
                    agreedPrice,
                },
            },
        })

        const data = result?.data?.performMechanicTask
        toast.add(data.status, `Car Mechanic`, data.message)

        if (taskCode === 'sell' && data.status === 'success') {
            history.push('/garage')
        }
    }

    function handleTransport() {
        setTransportModal(!transportModal)
    }

    if (error ?? mechanicError) {
        return (
            <Content color="black">
                <Link to={`/garage`}>
                    <Masthead fullWidth>Garage</Masthead>
                </Link>
                <GraphErrors error={error ?? mechanicError} />
                <div className={`garage-error-return`}>
                    <Link to={`/garage`}>
                        <Button color={`red`} type={`secondary`}>
                            Back to Garage
                        </Button>
                    </Link>
                </div>
            </Content>
        )
    }

    return (
        <Content color="game" className={`garage`}>
            <div
                className={`garage__content garage__content__${
                    vehicle?.destinationDistrict ? 'shipping' : 'landed'
                }`}
            >
                <Link to={`/garage`}>
                    <Masthead fullWidth>Garage</Masthead>
                </Link>
                <div className={`garage__content__title`}>
                    {vehicle?.name ?? 'Loading...'}
                </div>
                <div className={`garage__content__class`}>Class: Normal</div>
                <div className={`garage__content__damage`}>
                    <PercentBar
                        value={
                            vehicle?.damage === 0 ? 100 : vehicle?.damage * 2
                        }
                        maxValue={Math.max(100, vehicle?.damage ?? 100)}
                        unit="Damage"
                        color={vehicle?.damage === 0 ? 'blue' : 'red'}
                    >
                        {vehicle?.damage === 0 ? (
                            <>Flawless condition</>
                        ) : (
                            <>{vehicle?.damage}% Damage</>
                        )}
                    </PercentBar>
                </div>
                <div className={`garage__content__controls`}>
                    <div className={`garage__content__controls__plate`}>
                        <Button
                            color={`white`}
                            type={`tertiary`}
                            disabled={loading || vehicle?.destinationDistrict}
                            onClick={() => {
                                handleMechanic({
                                    taskCode: 'changePlates',
                                    agreedPrice: vehiclePricing?.changePlates,
                                })
                            }}
                        >
                            Swap plates
                        </Button>
                        <BalanceItem
                            value={vehiclePricing?.changePlates}
                            currency={'cash'}
                            showFull
                            countDuration={0.6}
                        />
                    </div>{' '}
                    <div className={`garage__content__controls__repair`}>
                        <Button
                            color={`white`}
                            type={`tertiary`}
                            disabled={loading || vehicle?.damage === 0 || vehicle?.destinationDistrict}
                            onClick={() => {
                                handleMechanic({
                                    taskCode: 'repair',
                                    agreedPrice: vehiclePricing?.repair,
                                })
                            }}
                        >
                            Repair
                        </Button>
                        {vehicle?.damage !== 0 && (
                            <BalanceItem
                                value={vehiclePricing?.repair}
                                currency={'cash'}
                                showFull
                                countDuration={0.6}
                            />
                        )}
                    </div>
                </div>
                <div className={`garage__content__image`}>
                    <Image src={vehicle?.image} alt={`${vehicle?.name}`} />
                    {vehicle?.destinationDistrict && (
                        <div className={`garage__content__image__shipping`}>
                            <Image
                                src={Shipping}
                                alt={`Shipping to ${vehicle?.destinationDistrict}`}
                            />
                            <div
                                className={`garage__content__image__shipping__explainer`}
                            >
                                <p
                                    className={`garage__content__image__shipping__explainer__title`}
                                >
                                    Bound for {vehicle?.destinationDistrict}
                                </p>
                                <p
                                    className={`garage__content__image__shipping__explainer__text`}
                                >
                                    Arrives in{' '}
                                    <TickManager
                                        dateStart={vehicle?.destinationShipped}
                                        dateEnd={vehicle?.destinationArrival}
                                    >
                                        {({ pretty }) => <>{pretty}</>}
                                    </TickManager>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                <div className={`garage__content__heat`}>
                    <div className={`garage__content__heat__title`}>Heat</div>
                    <div
                        className={`garage__content__heat__stars garage__content__heat__stars__${
                            vehicle?.heat ?? 0
                        }-heat`}
                    >
                        <img src={GarageStar} alt={`Heat star`} />
                        <img src={GarageStar} alt={`Heat star`} />
                        <img src={GarageStar} alt={`Heat star`} />
                    </div>
                </div>
                <div className={`garage__content__plate`}>
                    <VehiclePlate
                        plate={vehicle?.plate}
                        location={vehicle?.district}
                    />
                </div>
                <div className={`garage__content__cta`}>
                    <div className={`garage__content__cta__transport`}>
                        <div className={`garage__content__cta__title`}>
                            Transport
                        </div>
                        <Button
                            color={`white`}
                            type={`secondary`}
                            disabled={loading || vehicle?.destinationDistrict}
                            onClick={() => {
                                handleTransport()
                            }}
                        >
                            Select destination
                        </Button>
                        <GarageCarTransportModal isOpen={transportModal} handleClose={handleTransport} vehicle={vehicle} loading={loading} handleMechanic={handleMechanic} />
                    </div>
                    <div className={`garage__content__cta__sell`}>
                        <div className={`garage__content__cta__title`}>
                            Sell car
                        </div>
                        <Button
                            color={`green`}
                            type={`primary`}
                            disabled={loading || vehicle?.destinationDistrict}
                            onClick={() => {
                                handleMechanic({
                                    taskCode: 'sell',
                                    agreedPrice: vehiclePricing?.sell,
                                })
                            }}
                        >
                            <Image src={IcoDollars} alt={`Cash purchase`} />{' '}
                            {vehiclePricing?.sell?.toLocaleString()}
                        </Button>
                    </div>
                </div>
            </div>
        </Content>
    )
}

export default GarageCar
