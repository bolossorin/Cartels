import React from 'react'
import NameTag from '../../game/_common/NameTag'
import BalanceItem from '../../game/_common/BalanceItem'
import Iso from 'assets/images/ISO_CASINO.png'
import GovBuilding from 'img/govbuilding.svg'

import './Property.scss'

function PropertyOwner({ property }) {
    const district = property.districtName
    const maximumBet = property?.maximumBet
    const owner = property?.player
    const propertyType = property?.propertyType
    const isStateOwned = property?.currentState === 'STATE_OWNED'
    const isUnowned = property?.currentState === 'UNOWNED'
    const isLocked = property?.currentState === 'LOCKED'
    const isPlayable = !isLocked && !isUnowned

    return (
        <div className={`prop-owner`}>
            <img src={Iso} alt={'test'} width={240} />
            <div className={`prop-owner__info`}>
                <span className={`prop-owner__info__title`}>
                    {district} {propertyType}
                </span>
                {isPlayable && (
                    <>
                        <p className={`prop-owner__info__max`}>
                            Maximum Bet:{' '}
                            <BalanceItem
                                value={maximumBet}
                                currency={'cash'}
                                showFull
                            />
                        </p>
                        <p className={`prop-owner__info__wealth`}>
                            Wealth: <span>{owner?.wealth ?? 'Unlimited'}</span>
                        </p>
                    </>
                )}
                {isLocked && (
                    <>
                        <p
                            className={`prop-owner__info__owner prop-owner__info__owner__state`}
                        >
                            <span>Locked</span>
                        </p>
                        <p className={`prop-owner__info__owner`}>
                            You are not able to play this casino at this time,
                            this may be because the casino is in Escrow or it
                            has been disabled by staff.
                        </p>
                    </>
                )}
                {isUnowned && (
                    <>
                        <p
                            className={`prop-owner__info__owner prop-owner__info__owner__state`}
                        >
                            <span>Unowned</span>
                        </p>
                        <p className={`prop-owner__info__owner`}>
                            You cannot play this casino until it has owner. You
                            may purchase this casino on the Casino page.
                        </p>
                    </>
                )}
                {isStateOwned && (
                    <p
                        className={`prop-owner__info__owner prop-owner__info__owner__state`}
                    >
                        <span>
                            <img src={GovBuilding} alt={'Government'} />
                            Owned by {district} State
                        </span>
                    </p>
                )}
                {owner && (
                    <p className={`prop-owner__info__owner`}>
                        <span className={`prop-owner__info__owner__label`}>
                            Owner:{' '}
                        </span>
                        <NameTag player={owner} />
                    </p>
                )}
                {owner && (
                    <p className={`prop-owner__info__crew`}>
                        <span className={`prop-owner__info__owner__label`}>
                            Crew:{' '}
                        </span>
                        <NameTag
                            player={{
                                name: 'The Admins',
                                id: 1,
                            }}
                        />
                    </p>
                )}
            </div>
        </div>
    )
}

export default PropertyOwner
