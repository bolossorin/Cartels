import React from 'react'
import Content from '../../_common/Content/Content'
import Masthead from '../../_common/Masthead/Masthead'
import Tabs from '../../_common/Tabs/Tabs'
import Tab from '../../_common/Tabs/Tab'
import GoldPage from './GoldPage'
import './Store.scss'
import Restocking from '../market/Restocking'

function Store() {
    return (
        <Content color="game">
            <Tabs name="store" defaultTab={localStorage.getItem('Gold')}>
                <Masthead>Store</Masthead>
                <Tab name="Gold">
                    <GoldPage />
                </Tab>
                <Tab name="Offers">
                    <Restocking />
                </Tab>
            </Tabs>
        </Content>
    )
}

export default Store
