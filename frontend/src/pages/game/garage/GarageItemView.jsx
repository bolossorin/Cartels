import React from 'react'
import { Link } from 'react-router-dom'
import Image from '../../_common/Image/Image'

function GridView({ vehicleState }) {
    return (
        <ul className={`inventory-page__grid`}>
            {vehicleState?.map((vehicle) => {
                return (
                    <li
                        className={`inventory-page__grid__item`}
                        key={vehicle.id}
                    >
                        <Link to={`/garage/${vehicle.id}`}>
                            <div className={`inventory-page__grid__item__box`}>
                                <div
                                    className={`inventory-page__grid__item__box__image`}
                                >
                                    <Image src={vehicle.image} />
                                </div>

                                <div
                                    className={`inventory-page__grid__item__box__statistics`}
                                >
                                    <div
                                        className={`inventory-page__grid__item__box__statistics__title__and__plate`}
                                    >
                                        <span className="__vehicle_name">
                                            {vehicle.name}
                                        </span>
                                        <span className="__vehicle_plate">
                                            {vehicle.plate}
                                        </span>
                                    </div>

                                    <div
                                        className={`inventory-page__grid__item__box__stats`}
                                    >
                                        {vehicle.damage} DMG
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </li>
                )
            })}
        </ul>
    )
}

function ListView({ vehicleState }) {
    return (
        <ul className={`inventory-page__list`}>
            {vehicleState.map((vehicle) => (
                <li className={`inventory-page__list__item`} key={vehicle.id}>
                    <Link to={`/garage/${vehicle.id}`}>
                        <div className={`inventory-page__list__item__box`}>
                            <div
                                className={`inventory-page__list__item__box__image`}
                            >
                                <Image src={vehicle.image} />
                            </div>

                            <div
                                className={`inventory-page__list__item__box__statistics`}
                            >
                                <div
                                    className={`inventory-page__list__item__box__statistics__title__and__plate`}
                                >
                                    <span className="__vehicle_name">
                                        {vehicle.name}
                                    </span>
                                    <span className="__vehicle_plate">
                                        {vehicle.plate}
                                    </span>
                                </div>

                                <div
                                    className={`inventory-page__list__item__box__statistics__dmg`}
                                >
                                    {vehicle.damage} DMG
                                </div>
                            </div>
                        </div>
                    </Link>
                </li>
            ))}
        </ul>
    )
}

function GarageItemView({ vehicleState, isGridOrList }) {
    switch (isGridOrList) {
        case 'grid':
            return <GridView vehicleState={vehicleState} />
        default:
            return <ListView vehicleState={vehicleState} />
    }
}

export default GarageItemView
