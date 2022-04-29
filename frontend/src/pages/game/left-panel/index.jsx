import React from 'react'
import Profile from './components/Profile'
import EquippedLeftPanel from './components/EquippedLeftPanel'
import Inventory from './components/Inventory'
import * as PropTypes from 'prop-types'
import Promotions from '../promotions'
import Content from '../../_common/Content/Content'
import Values from './components/Values'
import EquippedVehicle from './components/EquippedVehicle'
import StoreLink from '../store/StoreLink'

function LeftPanel() {
    return (
        <Content color="game" className="column-1">
            <Profile />
            <StoreLink />
            <Values />
            <EquippedLeftPanel />
            {/*<EquippedVehicle />*/}
            <Inventory />
        </Content>
    )
}

export default LeftPanel
