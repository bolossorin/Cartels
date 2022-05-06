import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import ImgWeapon from 'img/inventory/weapons/M16-2.png'
import ImgBullets from 'img/inventory/BLACK TIP BULLETS.png'
import ImgProtection from 'img/inventory/armored-vest.png'
import ImgCar from 'img//equipped-inventory/car.png'

import './EquippedLeftPanel.scss'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'

export const EQUIPPED_ITEMS_QUERY = gql`
    query EquippedPlayerItems {
        equippedItems {
            id
            equipped
            quantity
            createdAt
            item {
                id
                code
                name
                variant
                description
                imageUrl
                horizontalImageUrl
                strengthDisplay
                rarity
                stackable
                tradable
                options {
                    type
                }
            }
            showcaseFactoids {
                title
                text
                specialType
            }
        }
    }
`

function EquippedLeftPanel() {
    const { data } = useQuery(EQUIPPED_ITEMS_QUERY, {
        pollInterval: 30000,
    })

    const equipped = data?.equippedItems
    const weapon = equipped?.find((e) => e?.item?.variant === 'weapon')
    const protection = equipped?.find((e) => e?.item?.variant === 'protection')
    const hasEquipped = weapon || protection

    if (!hasEquipped) return <></>

    return (
        <>
            <h3 className="side-title">Equipped</h3>
            <div className="equipped-weapon-protection">
                {weapon && (
                    <div className="equipped-weapon">
                        <p className="name">{weapon.item.name}</p>
                        <img
                            className="weapon-image"
                            src={weapon.item.horizontalImageUrl}
                            alt={weapon.item.name}
                        />
                        <div className="bullets">
                            <img src={ImgBullets} alt="Bullets" />
                            <p className="count">0 rounds</p>
                        </div>
                    </div>
                )}
                {protection && (
                    <div className="equipped-protection">
                        <p className="name">{protection.item.name}</p>
                        <img
                            className="weapon-image"
                            src={protection.item.imageUrl}
                            alt={protection.item.name}
                        />
                        <p className="level">
                            {protection.item.strengthDisplay}
                        </p>
                    </div>
                )}
            </div>
        </>
    )
}

export default EquippedLeftPanel
