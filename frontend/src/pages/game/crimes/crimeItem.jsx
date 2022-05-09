import React from 'react'
import PropTypes from 'prop-types'
import NoCrimeImage from 'img/crimes/default-crime.svg'
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

import './MinorCrimes.scss'
import BalanceItem from '../_common/BalanceItem'
import PercentBar from '../_common/PercentBar'
import Timer from 'img/crimes/timer-crime.svg'

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

function CrimeItem({ crime, handleCrime, loadingCrime }) {
    return (
        <div
            className={`crime-item ${
                crime.unlocked ? '' : 'crime-item--locked'
            } ${crime.id === loadingCrime ? 'crime-item--loading' : ''} ${
                crime.limitedTime ? 'crime-item__limited' : ''
            }`}
            style={{
                backgroundImage: `linear-gradient(to right, #111111 0%, #11111120 100%), url(${
                    crime.image ? imageMap[crime.image] : NoCrimeImage
                })`,
                backgroundColor: 'black',
            }}
            onClick={!crime?.unlocked ? undefined : () => handleCrime(crime.id)}
        >
            <div className={`crime-item__content`}>
                <h3>{crime?.name}</h3>
                {crime.limitedTime && (
                    <div className="limited-time-crime">
                        <img src={Timer} alt={`Limited time`} />
                        <span>Limited Time</span>
                    </div>
                )}
                <p className="crime-item__content__description">
                    {crime?.description}
                </p>
                <div className="crime-item__content__loot">
                    <BalanceItem
                        currency="money"
                        value={crime?.loot?.money}
                        showFull
                    />
                    {crime?.loot?.crypto > 0 && (
                        <BalanceItem
                            currency="crypto"
                            value={crime?.loot?.crypto}
                            showFull
                        />
                    )}
                    <p className="crime-item__content__loot__exp">{`+ ${crime?.loot?.exp} XP`}</p>
                </div>
                <PercentBar
                    value={
                        crime?.progress > crime?.progressTarget
                            ? crime?.progressTarget
                            : crime?.progress
                    }
                    maxValue={crime?.progressTarget}
                    showMaxValue
                    unit="XP"
                    color="blue"
                />
            </div>
        </div>
    )
}

export default CrimeItem
