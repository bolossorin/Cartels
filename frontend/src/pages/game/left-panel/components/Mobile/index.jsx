import React, { useState } from 'react'
import Profile from '../Profile'
import InventoryList from '../EquippedLeftPanel'
import Inventory from '../Inventory'
import MenuArrow from 'img/icons/back.svg'
import './LeftPanelMobile.scss'
import * as PropTypes from 'prop-types'
import Promotions from '../../../promotions'
import Values from '../Values'
import EquippedLeftPanel from '../EquippedLeftPanel'
import EquippedVehicle from '../EquippedVehicle'
import Content from '../../../../_common/Content/Content'
import StoreLink from '../../../store/StoreLink'

function MobileLeftPanel() {
    const [expanded, setExpanded] = useState(false)

    const handleToggleExpand = (event) => {
        event.preventDefault()

        setExpanded(!expanded)
    }

    return (
        <div
            className={`left-panel-mobile-container ${
                expanded ? 'left-panel-mobile-container__open' : ''
            }`}
        >
            <Content color="black" className="left-right-panel-mobile">
                <Profile />
                <StoreLink />
                <Values />
                {/*<EquippedLeftPanel />*/}
                {/*<EquippedVehicle />*/}
                <Inventory />
            </Content>
            <a className="pull-menu-arrow" href="" onClick={handleToggleExpand}>
                <img src={MenuArrow} />
            </a>
        </div>
    )
}

MobileLeftPanel.propTypes = { player: PropTypes.any }

export default MobileLeftPanel
