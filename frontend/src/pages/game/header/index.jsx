import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { NavItems } from '../../../config'
import ImgBanner from 'img/main_logo.png'
import Discord from 'img/discord.svg'
import './Header.scss'
import HeaderClock from './HeaderClock'

function Header() {
    const LogOut = (event) => {
        localStorage.clear()
        location.reload()
    }

    return (
        <div className="header-container">
            <div className="header-container__top">
                <div className="header-container__top__links">
                    <div className="header-container__top__links__sides">
                        <a href="https://discord.gg/5Xe845M" target="_blank">
                            Discord <img src={Discord} alt="Discord logo" />
                        </a>
                    </div>
                    <div className="header-container__top__links__sides">
                        <Link to="/settings">Settings</Link>
                        <a onClick={LogOut}>Logout</a>
                    </div>
                </div>
                <div className="header-container__top__logo-shadow" />
                <div className="header-container__top__border" />
                <div className="header-container__top__timer">
                    <HeaderClock />
                </div>
                <img
                    className="header-container__top__logo"
                    src={ImgBanner}
                    alt="Cartels.com, formerly Downtown-Mafia"
                />
            </div>
            <nav>
                <ul>
                    {NavItems.map((item) => (
                        <li
                            key={item.key}
                            className={item?.disabled ? 'disabled' : 'enabled'}
                        >
                            <Link to={item.link}>
                                <img src={item.icon} alt="" />
                                <p>{item.name}</p>
                                {item?.disabled && (
                                    <p className="coming-soon">Coming soon</p>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    )
}

export default Header
