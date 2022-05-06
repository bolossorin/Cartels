import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Arrow from 'img/icons/down-arrow.svg'
import JailIcon from 'img/icons/jail.svg'
import MessagesIcon from 'img/icons/messages.svg'
import NotificationIcon from 'img/icons/notifications.svg'
import OptionsIcon from 'img/icons/options.svg'

import './DesktopBottomMenu.scss'

function DesktopBottomMenu() {
    const [expanded, setExpanded] = useState(false)

    const handleToggleExpand = (event) => {
        event.preventDefault()

        setExpanded(!expanded)
        console.log('exp', expanded)
    }

    const LogOut = (event) => {
        localStorage.clear()
        location.reload()
    }

    return (
        <div className="desktop-bottom-menu-container">
            <div
                className={`swipable-desktop-menu ${
                    expanded ? 'swipable-desktop-menu__open' : ''
                }`}
            >
                <div
                    className="options"
                    style={{
                        background: `url(${Arrow}), linear-gradient(180deg, rgba(65, 67, 72, 0.6) 0%, rgba(65, 67, 72, 0.6) 1.08%, rgba(33, 36, 43, 0.6) 2.19%, rgba(24, 66, 90, 0.6) 100%), #1D2026`,
                    }}
                    onClick={handleToggleExpand}
                >
                    Options
                </div>
                <nav>
                    <ul>
                        <li onClick={handleToggleExpand}>
                            <a onClick={LogOut}>Log Out</a>
                        </li>
                        <li onClick={handleToggleExpand}>
                            <a href="">Subscription settings</a>
                        </li>
                        <li onClick={handleToggleExpand}>
                            <a href="">Account settings</a>
                        </li>
                        <li onClick={handleToggleExpand}>
                            <a href="">Report a bug / player</a>
                        </li>
                    </ul>
                </nav>
            </div>
            <nav className={`static-desktop-menu`}>
                <ul>
                    <li>
                        <a href="">
                            <img src={NotificationIcon} alt="Game updates" />
                        </a>
                    </li>
                    <li>
                        <a href="">
                            <img src={MessagesIcon} alt="Messages" />
                        </a>
                    </li>
                    <li>
                        <Link to="/jail">
                            <img src={JailIcon} alt="Jail" />
                        </Link>
                    </li>
                    <li
                        className={
                            expanded ? 'static-desktop-menu__active' : ''
                        }
                    >
                        <a href="" onClick={handleToggleExpand}>
                            <img src={OptionsIcon} alt="Menu" />
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    )
}

export default DesktopBottomMenu
