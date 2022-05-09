import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { NavItems } from '../../../../config'
import PlayersIcon from 'img/icons/players.svg'
import SmallLogo from 'img/Cartels_logo_small.png'
import JailIcon from 'img/icons/jail.svg'
import MessagesIcon from 'img/icons/messages.svg'
import NotificationIcon from 'img/icons/notifications.svg'
import AccountIcon from 'img/icons/account.svg'
import OptionsIcon from 'img/icons/options.svg'

import './MobileHeader.scss'

function MobileHeader() {
    const [expanded, setExpanded] = useState(false)

    const handleToggleExpand = (event) => {
        event.preventDefault()

        setExpanded(!expanded)
    }

    const LogOut = (event) => {
        localStorage.clear()
        location.reload()
    }

    return (
        <div className="mobile-header-container">
            <div
                className={`swipable-mobile-header ${
                    expanded ? 'swipable-mobile-header__open' : ''
                }`}
            >
                <div className="account-options-mobile-links">
                    <a to="/options" className="disabled">
                        <p>Options</p>
                    </a>
                </div>
                <nav>
                    <ul>
                        {NavItems.map((item) => (
                            <li
                                key={item.key}
                                onClick={handleToggleExpand}
                                className={
                                    item?.disabled ? 'disabled' : 'enabled'
                                }
                            >
                                <Link to={item.link}>
                                    {item?.disabled && (
                                        <p className="coming-soon">
                                            Coming soon
                                        </p>
                                    )}
                                    <p>{item.name}</p>
                                    <img src={item.icon} alt="" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            <nav className={`static-mobile-header`}>
                <ul>
                    <li>
                        <Link to="/players">
                            <img src={PlayersIcon} alt="Players online" />
                        </Link>
                    </li>
                    <li>
                        <Link to="/messages">
                            <img src={MessagesIcon} alt="Messages" />
                        </Link>
                    </li>
                    <li
                        className={
                            expanded ? 'static-mobile-header__active' : ''
                        }
                    >
                        <a
                            className="logo"
                            href=""
                            onClick={handleToggleExpand}
                        >
                            <img src={SmallLogo} alt="Menu" />
                        </a>
                    </li>
                    <li>
                        <Link to="/jail">
                            <img src={JailIcon} alt="Jail" />
                        </Link>
                    </li>
                    <li>
                        <Link to="/news">
                            <img src={NotificationIcon} alt="Game updates" />
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}

export default React.memo(MobileHeader)
