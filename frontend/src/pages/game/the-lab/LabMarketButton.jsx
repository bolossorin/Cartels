import React, { useState } from 'react'
import Button from '../../_common/Button'
import { Link } from 'react-router-dom'
import Arrow from 'img/icons/arrow_large_green.svg'

function LabMarketButton() {
    return (
        <Link to="/lab/market" className="lab-market-button">
            <Button color="green" styleType="secondary">
                <span>MARKET</span>
                <span>
                    BUY/SELL <img src={Arrow} alt="arrow" />
                </span>
            </Button>
        </Link>
    )
}

export default LabMarketButton
