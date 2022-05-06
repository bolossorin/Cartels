import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import Ocean from 'img/map/Ocean.png'
import Modal from '../_common/Modal'
import ReactModal from 'react-modal'
import MapImage from 'img/map/mini-def.svg'
import DLArrow from 'img/map/DL-arrow.svg'
import PCArrow from 'img/map/PC-arrow.svg'
import SFArrow from 'img/map/SF-arrow.svg'
import MCArrow from 'img/map/MC-arrow.svg'
import VHArrow from 'img/map/VH-arrow.svg'
import DLPin from 'img/map/DL-pin.svg'
import PCPin from 'img/map/PC-pin.svg'
import SFPin from 'img/map/SF-pin.svg'
import MCPin from 'img/map/MC-pin.svg'
import VHPin from 'img/map/VH-pin.svg'
import DL from 'img/map/DL.svg'
import PC from 'img/map/PC.svg'
import SF from 'img/map/SF.svg'
import MC from 'img/map/MC.svg'
import VH from 'img/map/VH.svg'
import Timer from 'img/map/timer.svg'
import Dollar from 'img/icons/dollar.svg'

import './MainGameMap.scss'
import '../_common/Modal.scss'
import Customs from '../the-lab/Customs'
import Button from '../../_common/Button'
import { Form, Formik } from 'formik'
import { useToast } from '../_common/Toast'
import Cooldown from '../../_common/Cooldown'

const DISTRICTS = [
    {
        name: 'Dirtlands',
        short: 'DL',
        triangle: DLArrow,
        pin: DLPin,
        letters: DL,
        price: 5000,
        time: 20,
        description: 'description optional',
    },
    {
        name: 'Park City',
        short: 'PC',
        triangle: PCArrow,
        pin: PCPin,
        letters: PC,
        price: 5000,
        time: 20,
        description: 'description optional',
    },
    {
        name: 'Sol Furioso',
        short: 'SF',
        triangle: SFArrow,
        pin: SFPin,
        letters: SF,
        price: 5000,
        time: 20,
        description: 'description optional',
    },
    {
        name: 'Marshall City',
        short: 'MC',
        triangle: MCArrow,
        pin: MCPin,
        letters: MC,
        price: 5000,
        time: 20,
        description: 'description optional',
    },
    {
        name: 'Valencia Hills',
        short: 'VH',
        triangle: VHArrow,
        pin: VHPin,
        letters: VH,
        price: 5000,
        time: 20,
        description: 'description optional',
    },
]

const TRAVEL_MUTATION = gql`
    mutation MapTravel($input: TravelInput!) {
        travel(input: $input) {
            success
            player {
                id
                district
            }
            customsSuccess
            message
        }
    }
`

function MainGameMap() {
    const toast = useToast()
    const [
        mutateTravel,
        { data: travelData, loading: travelLoading },
    ] = useMutation(TRAVEL_MUTATION)

    const [selectDistrict, setSelectDistrict] = useState(null)

    const district = DISTRICTS[selectDistrict]

    function handlePinClick(num) {
        setSelectDistrict(num)
    }

    async function handleTravel() {
        const result = await mutateTravel({
            variables: {
                input: {
                    district: district.name,
                },
            },
        })
        if (!result || result?.errors) {
            toast.add(
                'error',
                `${district.name} Airport`,
                'You are unable to travel at this time. Please refresh your page.'
            )
        }
        const toastType = result.data.travel.success ? 'success' : 'error'

        toast.add(
            toastType,
            `${district.name} Airport`,
            result.data.travel.message
        )
        handlePinClick(null)
    }

    return (
        <Cooldown timer="travel">
            <section className="main-map-container">
                <h1>Map</h1>
                <div
                    className="main-map"
                    style={{ background: `url(${MapImage}), url(${Ocean})` }}
                >
                    <div
                        className={`main-map__travel ${
                            selectDistrict === null
                                ? 'main-map__travel__closed'
                                : 'main-map__travel__open'
                        }`}
                    >
                        <h3>
                            Travelling to{' '}
                            <span data-district={district?.short}>
                                {district?.name}
                            </span>
                            ...
                        </h3>
                        <div className={`main-map__travel__actions`}>
                            <Customs />
                            <div
                                className={`main-map__travel__actions__buttons`}
                            >
                                <Button
                                    styleType="secondary"
                                    color="white"
                                    onClick={() => handlePinClick(null)}
                                >
                                    Close
                                </Button>
                                <Formik
                                    onSubmit={handleTravel}
                                    initialValues={{}}
                                >
                                    {(props) => (
                                        <Form name="login">
                                            <Button
                                                name="travel"
                                                styleType="primary"
                                                color="blue"
                                            >
                                                Travel (Free)
                                            </Button>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </div>
                    </div>
                    <div className="canvas">
                        {DISTRICTS.map(
                            (
                                {
                                    name,
                                    short,
                                    pin,
                                    triangle,
                                    price,
                                    time,
                                    letters,
                                },
                                num
                            ) => (
                                <a
                                    key={short}
                                    className={`pin-container pin-container--${short}`}
                                    onClick={() => handlePinClick(num)}
                                >
                                    <img
                                        className="pin"
                                        src={pin}
                                        alt={`${name}`}
                                    />
                                    <img
                                        className="arrow"
                                        src={triangle}
                                        alt={`${name}`}
                                    />
                                    <div className="letters-container">
                                        <img
                                            className="letters"
                                            src={letters}
                                            alt={`${short}`}
                                        />
                                    </div>
                                </a>
                            )
                        )}
                    </div>
                </div>
            </section>
        </Cooldown>
    )
}

export default MainGameMap
