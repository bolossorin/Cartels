import React from 'react'

function Tab({ name, handleSelect, selected, className, color }) {
    return (
        <li
            className={`tabs__item ${selected ? 'tabs__item__selected' : ''} ${color ? `tabs__item--${color}` : ''} ${
                className ?? ''
            }`}
            onClick={!selected ? handleSelect : undefined}
        >
            {name}
        </li>
    )
}

Tab.displayName = 'Tab'

export default Tab
