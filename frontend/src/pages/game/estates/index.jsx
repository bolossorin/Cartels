import React, { useState } from 'react'
import './Estates.scss'
import Content from '../../_common/Content/Content'
import Masthead from '../../_common/Masthead/Masthead'
import Restocking from '../market/Restocking'
import StripClubImage from 'img/../items/estate/strip_club/ISO_STRIPCLUB 1.png'
import HeadquartersImage from 'img/../items/estate/headquarters/ISO_MANSION.png'
import GarageImage from 'img/../items/estate/garage/ISO_GARAGE.png'
import SafehouseImage from 'img/../items/estate/safehouse/ISO_SAFEHOUSE.png'

import BusinessItem from './BusinessItem'
import EstateItem from './EstateItem'
import EstateMapBackground from 'img/map/mini-def.svg'
import EstatesModal from './EstatesModal'

const ESTATES_LIST = [
    {
        name: 'Headquarters',
        level: 2,
        type: 'estate',
        maxLevel: 6,
        progress: 456,
        maxProgress: 1200,
        image: HeadquartersImage,
        id: 56,
        actions: [
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 566,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 562,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 156,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 568,
            },
        ],
    },
    {
        name: 'Garage',
        level: 1,
        maxLevel: 6,
        type: 'estate',
        progress: 456,
        maxProgress: 1200,
        image: GarageImage,
        id: 23,
        actions: [
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 560,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 567,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 564,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 56456,
            },
        ],
    },
    {
        name: 'Money Laundry',
        level: 3,
        type: 'estate',
        maxLevel: 6,
        progress: 456,
        maxProgress: 1200,
        image: StripClubImage,
        id: 27,
        actions: [
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 566456,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 564654,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 5365466,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 568978,
            },
        ],
    },
    {
        name: 'Safehouse',
        level: 5,
        type: 'estate',
        maxLevel: 6,
        progress: 456,
        maxProgress: 1200,
        image: SafehouseImage,
        id: 98,
        actions: [
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 565645,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 5654325476,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 5624563,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 5665464,
            },
        ],
    },
]

const BUSINESSES_LIST = [
    {
        name: 'strip club',
        type: 'business',
        image: StripClubImage,
        location: 'Valencia Hills',
        producingDaily: 10000,
        level: 1,
        progress: 456,
        maxProgress: 1200,
        collectReady: 10000,
        upgradeAvailable: true,
        id: 1,
        actions: [
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 5632456,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 56546445,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 56546,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 56253465,
            },
        ],
    },
    {
        name: 'strip club',
        image: StripClubImage,
        type: 'business',
        location: 'Valencia Hills',
        producingDaily: 10000,
        level: 1,
        progress: 456,
        maxProgress: 1200,
        collectReady: 10000,
        upgradeAvailable: false,
        id: 2,
        actions: [
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 56254687,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 5456456,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 565748978,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 5678978,
            },
        ],
    },
    {
        name: 'strip club',
        image: StripClubImage,
        type: 'business',
        location: 'Valencia Hills',
        producingDaily: 10000,
        level: 1,
        progress: 456,
        maxProgress: 1200,
        collectReady: 10000,
        upgradeAvailable: true,
        id: 3,
        actions: [
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 565646546,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 5656786,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 56546546,
            },
            {
                name: 'strip club',
                type: 'losing',
                dealAmount: 2000,
                amount: 25498,
                id: 565786,
            },
        ],
    },
    {
        name: 'strip club',
        image: StripClubImage,
        type: 'business',
        location: 'Valencia Hills',
        producingDaily: 10000,
        level: 12,
        progress: 456,
        maxProgress: 1200,
        collectReady: 10000,
        upgradeAvailable: true,
        id: 4,
        actions: [
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 565646546,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 5656786,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 56546546,
            },
            {
                name: 'strip club',
                type: 'losing',
                amount: 25498,
                dealAmount: 2000,
                id: 565786,
            },
        ],
    },
]

function Estates() {
    const [selectedItem, setSelectedItem] = useState(undefined)

    const businessesList = BUSINESSES_LIST
    const estatesList = ESTATES_LIST

    function handleSelect(estateItem) {
        setSelectedItem(estateItem)
    }

    function handleClose() {
        setSelectedItem(undefined)
        refetch()
    }

    return (
        <Content color="game" className="estates">
            <EstatesModal
                handleClose={handleClose}
                isOpen={!!selectedItem}
                estate={selectedItem}
            />
            <div className="estates__top-background">
                <Masthead fullWidth>Estates</Masthead>
                <div className="main-estates-list">
                    {estatesList.map((estateItem) => (
                        <EstateItem
                            key={estateItem?.id}
                            estateItem={estateItem}
                            handleSelect={handleSelect}
                        />
                    ))}
                </div>
            </div>
            <h3>Businesses</h3>
            {businessesList.map((businessItem) => (
                <BusinessItem
                    key={businessItem?.id}
                    businessItem={businessItem}
                    handleSelect={handleSelect}
                />
            ))}
        </Content>
    )
}

export default Estates
