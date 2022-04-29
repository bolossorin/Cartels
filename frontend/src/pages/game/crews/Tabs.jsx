import React, { useEffect, useState } from 'react'
import './Crews.scss'
import { Link } from 'react-router-dom'
import { crewNameComplement } from './crewUtils'
import Button from '../../_common/Button'

function Tabs({ currentTab, firstPartLink, tabs }) {
    const [selectCurrentTab, setSelectCurrentTab] = useState(currentTab)
    useEffect(() => {
        if (currentTab === undefined) {
            setSelectCurrentTab('')
        }
        if (currentTab !== undefined) {
            setSelectCurrentTab(currentTab)
        }
    }, [currentTab])

    return (
        <div className="crew-tabs">
            {tabs.map((tab) => (
                <Link to={`${firstPartLink}/${tab?.url}`} key={tab?.name}>
                    <Button
                        styleType="tertiary"
                        color="blue"
                        className={`${
                            tab.url === selectCurrentTab ? 'current-tab' : ''
                        }`}
                    >
                        {tab.name}
                    </Button>
                </Link>
            ))}
        </div>
    )
}

export default Tabs
