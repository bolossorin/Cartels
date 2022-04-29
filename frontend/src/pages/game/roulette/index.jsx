import React, { useState } from 'react'
import Content from '../../_common/Content/Content'
import Masthead from '../../_common/Masthead/Masthead'

import './Roulette.scss'
import useClientRect from '../../../hooks/useClientRect'
import IntegratedLoader from '../_common/Loading/IntegratedLoader'
import RouletteBoard from './RouletteBoard'
import RouletteWheel from './RouletteWheel'
import Property from '../../_common/Property/Property'
import { Link } from 'react-router-dom'
import useEvent from '../../../hooks/useEvent'

function Roulette() {
    const triggerEvent = useEvent()
    const [rapid, setRapid] = useState(false)
    const [rect, ref] = useClientRect()

    const contentWidth = rect?.width
    const contentHeight = rect?.height

    function handleToggleRapid(event) {
        const isRapid = event?.target?.value === 'on'
        triggerEvent({
            name: 'ROULETTE_TOGGLE_RAPID',
            details: {
                isRapid,
            },
        })

        setRapid(isRapid)
    }
    return (
        <Content color={`game`} className={`roulette`} contentRef={ref}>
            <Masthead fullWidth>
                <Link to={`/casino`}>Roulette</Link>
            </Masthead>
            <div className={`roulette__rapid`}>
                <label htmlFor={`roulette-rapid`}>Rapid</label>
                <label className="switch">
                    <input
                        type="checkbox"
                        id="roulette-rapid"
                        onClick={handleToggleRapid}
                    />
                    <span className="slider round">&nbsp;</span>
                </label>
            </div>
            {contentWidth ? (
                <Property propertyType={`roulette`}>
                    <RouletteBoard rect={rect} rapid={rapid} />
                </Property>
            ) : (
                <IntegratedLoader />
            )}
        </Content>
    )
}

export default Roulette
