import React from 'react'

import './MarketCard.scss'
import Title from '../../_common/Title/Title'
import Text from '../../_common/Text/Text'
import Image from '../../_common/Image/Image'
import AR15 from 'img/inventory/weapons/ar.png'
import BalanceItem from '../_common/BalanceItem'
import Tick from 'img/tick.svg'

function MarketCard({
    color,
    image,
    title,
    titleColor,
    description,
    rarity,
    rarityColor,
    currency,
    value,
    stat,
    owned,
    onClick,
}) {
    return (
        <div
            className={`market-card market-card__${color} market-card__${
                owned ? 'owned' : 'unowned'
            }`}
            onClick={onClick ? onClick : undefined}
        >
            <div className={`market-card__title`}>
                <Title {...{ [titleColor ?? 'unk']: true }}>
                    {title ?? `M-16`}
                    {owned && (
                        <div className={`market-card__title__owned`}>
                            <Image src={Tick} />
                            Owned
                        </div>
                    )}
                </Title>
                {rarity && (
                    <div
                        className={`market-card__title__rarity market-card__title__rarity__${rarity}`}
                    >
                        <Text boldItalic {...{ [rarityColor]: true }}>
                            {rarity}
                        </Text>
                    </div>
                )}
            </div>
            <div className={`market-card__desc`}>
                <Text>{description ?? `Hasta la vista`}</Text>
            </div>
            <div className={`market-card__image`}>
                <Image
                    src={image ?? AR15}
                    alt={`AR`}
                    opts={{
                        h: 150,
                        w: 600,
                        auto: 'compress',
                    }}
                />
            </div>

            <div className={`market-card__stats`}>
                <Text boldItalic red medium>
                    {stat ?? `24 DMG`}
                </Text>
                <BalanceItem
                    showFull
                    currency={currency ?? `cash`}
                    value={value ?? 10000}
                />
            </div>
        </div>
    )
}

export default MarketCard
