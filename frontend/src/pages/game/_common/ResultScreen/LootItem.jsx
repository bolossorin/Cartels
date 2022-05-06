import React from 'react'
import CrimeImage from 'img/crimes/minor/3-rob-mob-compound.jpg'
import LockpickTools from 'img/inventory/lock.png'
import Ammo from 'img/inventory/AMMO CRATE.png'
import Gold from 'img/inventory/GOLD.png'
import Crypto from 'img/inventory/PURPLE.png'
import Money from 'img/inventory/DOLLAR BILLS-2.png'
import './ResultScreen.scss'
import BalanceItem from '../BalanceItem'
import Image from '../../../_common/Image/Image'
import Text from '../../../_common/Text/Text'
import VehiclePlate from '../VehiclePlate'
import { Link } from 'react-router-dom'

function LootItem({ loot }) {
    return (
        <div className="loot-item">
            {loot?.plate && (
                <>
                    <Link to={`/garage/${loot.id}`}>
                        <Image
                            src={loot.image}
                            alt={loot.name}
                            className={`loot-item__vehicle-showcase`}
                            opts={{
                                h: 240,
                                w: 600,
                                auto: 'compress',
                            }}
                        />
                    </Link>
                    <Text red accentedHeader24>
                        {loot?.damage}% DMG
                    </Text>
                    <Text white accentedHeader24>
                        {loot?.name}
                    </Text>
                    <VehiclePlate
                        location={loot.originDistrict}
                        plate={loot.plate}
                    />
                </>
            )}
            {!loot?.plate && (
                <>
                    {loot?.variant === 'item' && (
                        <img src={loot?.image} alt={loot?.name} />
                    )}
                    {loot?.variant === 'ammo' && (
                        <img src={Ammo} alt={'Ammo'} />
                    )}
                    {loot?.variantType === 'gold' && (
                        <img src={Gold} alt={'Gold'} />
                    )}
                    {loot?.variantType === 'money' && (
                        <img src={Money} alt={'Money'} />
                    )}
                    {loot?.variantType === 'crypto' && (
                        <img src={Crypto} alt={'Crypto'} />
                    )}
                    <div className="loot-item__label">
                        {loot?.variant !== 'currency' &&
                            `${loot?.name}: x${loot?.quantity}`}
                        {loot?.variant === 'currency' && (
                            <BalanceItem
                                value={loot?.quantity}
                                currency={loot?.variantType}
                                showFull
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default LootItem
