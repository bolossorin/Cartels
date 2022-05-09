import React from 'react'

import './Teaser.scss'
import TeaserVideo from 'assets/images/glitchTeaser.mp4'

function Teaser() {
    return (
        <>
            <div className="build_your_empire">
                <video autoPlay muted loop>
                    <source src={TeaserVideo} type="video/mp4" />
                </video>
            </div>
            <div className="stop_snooping">
                <svg viewBox="0 0 600 30" className="desktop_only">
                    <defs>
                        <linearGradient
                            id="rainbow"
                            x1="0"
                            x2="0"
                            y1="0"
                            y2="100%"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#07578a" offset="0%" />
                            <stop stopColor="#c65572" offset="80%" />
                        </linearGradient>
                    </defs>
                    <text
                        fill="url(#rainbow)"
                        fontFamily="Arial, sans-serif"
                        className="shadow"
                    >
                        <tspan
                            fontSize="28"
                            x="0"
                            dy="20"
                            fontFamily="'FuturaHeading', sans-serif'"
                        >
                            Please stand by...
                        </tspan>
                    </text>
                </svg>
                <div className="mobile_only">Please stand by...</div>
                <div>
                    Returning October 3, 2020.{' '}
                    <a href="https://discord.gg/5Xe845M" target="_blank">
                        Discord
                    </a>
                </div>
            </div>
        </>
    )
}

export default Teaser
