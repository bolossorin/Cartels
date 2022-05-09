import React from 'react'
import Content from '../../_common/Content/Content'
import Masthead from '../../_common/Masthead/Masthead'
import Tabs from '../../_common/Tabs/Tabs'
import Tab from '../../_common/Tabs/Tab'
import MarketCard from './MarketCard'
import AR15 from 'img/inventory/weapons/ar_gold.png'
import Deagle from 'img/inventory/weapons/ar_leg.png'
import MarketPage from './MarketPage'
import Restocking from './Restocking'

function Market() {
    return (
        <Content color="game">
            <Tabs
                name="marketTab"
                defaultTab={localStorage.getItem("marketTab")}
            >
                <Masthead>Market</Masthead>
                <Tab name="Weapons">
                    <MarketPage variant={`weapons`} />
                </Tab>
                <Tab name="Protection">
                    <MarketPage variant={`protection`} />
                </Tab>
                <Tab name="Equipment">
                    <Restocking />
                </Tab>
                <Tab name="Skins">
                    <Restocking />
                </Tab>
            </Tabs>
        </Content>
    )
}

export default Market
