import React from 'react'
import PropTypes from 'prop-types'
import NoCrimeImage from 'img/crimes/default-crime.svg'
import Timer from 'img/crimes/timer-crime.svg'
import dollar from 'img/icons/dollar.svg'
import Crypto from 'img/icons/crypto.svg'

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

import Numerals from 'numeral'

import './MinorCrimes.scss'

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
    EasterEgg: RobHouse,
}

function CrimesList({ minorCrimes, handleCrime }) {
    return minorCrimes.map((crime) => {
        const progress = Math.min(
            Math.max(
                Math.floor((crime.progress / crime.progressTarget) * 100),
                10
            ),
            100
        )

        const currentProgress =
            crime.progress > crime.progressTarget
                ? crime.progressTarget
                : crime.progress

        return (
            <div
                key={crime.id}
                className={`crime-container crime-container--${
                    crime.difficulty
                } ${!crime?.unlocked ? 'crime-container__locked' : ''}`}
                onClick={
                    !crime?.unlocked ? undefined : () => handleCrime(crime.id)
                }
            >
                <div className="crime-image-container">
                    <div
                        className="crime-image"
                        style={{
                            background: `linear-gradient(to top, #000000EE 0%, #00000000 20%, #00000000 100%), url(${
                                crime.image
                                    ? imageMap[crime.image]
                                    : NoCrimeImage
                            })`,
                        }}
                    />
                    {crime.limitedTime && (
                        <div className="limited-time-crime">
                            <img src={Timer} alt={`Limited time`} />
                            <p>Limited Time Crime</p>
                        </div>
                    )}
                </div>
                <div className="crime-info-action-container">
                    <div className="crime-title-container">
                        <h3>{crime.name}</h3>
                        <p>{crime.description}</p>
                    </div>
                    <div className="crime-prize-engage-cooldown-container">
                        <div className="crime-prize">
                            <img src={dollar} />
                            <p className="money-prize">
                                {crime.loot.money < 1000
                                    ? crime.loot.money
                                    : Numerals(crime.loot.money).format(
                                          '0.0 a'
                                      )}
                            </p>
                            {crime.loot.crypto !== 0 && (
                                <>
                                    <p className="crypto-prize crypto-prize__plus">
                                        +
                                    </p>
                                    <img src={Crypto} />
                                    <p className="crypto-prize">
                                        {crime.loot.crypto < 1000
                                            ? crime.loot.crypto
                                            : Numerals(
                                                  crime.loot.crypto
                                              ).format('0.0 a')}
                                    </p>
                                </>
                            )}
                            <p className="exp-prize">
                                + {crime.loot.exp} <span>XP</span>
                            </p>
                        </div>
                        <div className="crime-progress">
                            <ProgressBar
                                progress={currentProgress}
                                label={``}
                                fullLabel={`MASTERED`}
                                min={0}
                                max={crime.progressTarget}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    })
}

CrimesList.propTypes = {
    minorCrimes: PropTypes.instanceOf(Array).isRequired,
}

export default CrimesList
