import React, { useState } from 'react'
import Tab from './Tab'

import './Tabs.scss'

function Tabs({
    children,
    defaultTab,
    handleChange,
    isSelfManaged,
    isColored,
    name,
}) {
    const firstDefaultableTab =
        children[0].props?.name !== undefined
            ? children[0].props.name
            : children[1].props.name
    const [selectedTab, setSelectedTab] = useState(
        defaultTab ?? firstDefaultableTab
    )

    function handleSelect(tabName) {
        setSelectedTab(tabName)
        handleChange?.(tabName, tabs?.[selectedTab])
        localStorage.setItem(name, tabName)
    }

    const tabs = {}
    for (const tab of children) {
        const tabName = tab.props.name

        if (tab.type.displayName !== 'Tab') {
            tabs[`react:${tab.type.name}`] = tab
        } else {
            tabs[tabName] = {
                children: tab.props.children,
                className: tab.props?.className,
                color: tab.props?.color,
            }
        }
    }

    const shouldDisplayContent = !isSelfManaged

    return (
        <>
            <ul className={`tabs ${isColored ? 'tabs--colored' : ''}`}>
                {Object.entries(tabs).map(([name, value]) => {
                    if (name.startsWith('react:')) {
                        return value
                    }

                    return (
                        <Tab
                            key={name}
                            name={name}
                            selected={name === selectedTab}
                            handleSelect={() => handleSelect(name)}
                            className={value?.className}
                            color={value?.color}
                        />
                    )
                })}
            </ul>
            {shouldDisplayContent && (
                <div className="tabs-content">
                    {tabs?.[selectedTab]?.children ?? tabs?.[selectedTab]}
                </div>
            )}
        </>
    )
}

export default Tabs
