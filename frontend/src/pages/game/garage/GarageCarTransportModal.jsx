import React, { useEffect, useState } from 'react'
import './GarageCar.scss'
import Image from '../../_common/Image/Image'
import Button from '../../_common/Button'
import BalanceItem from '../_common/BalanceItem'
import Close from 'assets/images/close.svg'
import Modal from '../_common/Modal'

function GarageCarTransportModal({
    isOpen,
    handleMechanic,
    handleClose,
    vehicle,
    loading,
}) {
    const vehiclePricing = vehicle?.pricing
    const transportLocations = vehiclePricing?.transportOptions
    const [selectedLocation, setSelectedLocation] = useState(null)

    function handleTransport() {
        handleMechanic({
            taskCode: 'transport',
            agreedPrice: transportLocations.find(
                (location) => selectedLocation === location.district
            ).price,
            destination: selectedLocation,
        })
    }

    return (
        <Modal isOpen={isOpen} className="transport-modal">
            <div className="transport-modal__header">
                <h2>Ship to</h2>
                <div
                    className={`transport-modal__header__close`}
                    onClick={() => handleClose()}
                >
                    <Image src={Close} alt={`Close item showcase`} />
                </div>
            </div>
            <div className="transport-modal__cities">
                {transportLocations?.map(({ district, price }) => (
                    <a
                        key={district}
                        className={`transport-modal__cities__city ${
                            district === selectedLocation
                                ? 'transport-modal__cities__city--selected'
                                : ''
                        }`}
                        onClick={() => setSelectedLocation(district)}
                    >
                        <span>{district}</span>
                        <BalanceItem currency="money" value={price} showFull />
                    </a>
                ))}
            </div>
            <div className="transport-modal__button">
                <Button
                    styleType="primary"
                    color="green"
                    disabled={loading}
                    onClick={handleTransport}
                >
                    Ship car
                </Button>
            </div>
        </Modal>
    )
}

export default GarageCarTransportModal
